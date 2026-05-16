import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import { createRequire } from 'module';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';

const require = createRequire(import.meta.url);
const archiver = require('archiver');

ffmpeg.setFfmpegPath(ffmpegPath.path);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const uploadDir = path.join(process.cwd(), 'uploads');
const outputDir = path.join(process.cwd(), 'outputs');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Job state registry
const jobs = new Map<string, { status: string, progress: number, fileUrl?: string, error?: string, stage?: string, frame?: number, totalFrames?: number }>();

// Basic API check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Premium SVG Render Engine Running' });
});

const encodeVideo = (framesDir: string, outputPath: string, format: string, fpsNum: number, useGpu: boolean, ext: string, onProgress?: (p: any) => void): Promise<void> => {
  return new Promise((resolve, reject) => {
      let command = ffmpeg()
          .input(path.join(framesDir, `frame-%05d.${ext}`))
          .inputFPS(fpsNum);

      const options = [];
      if (format === 'MOV (Alpha)') {
          options.push('-c:v prores_ks', '-profile:v 4444', '-vendor apl0', '-pix_fmt yuva444p10le');
      } else {
          options.push('-pix_fmt yuv420p');
          if (useGpu) {
              options.push('-c:v h264_amf', '-b:v 15M', '-usage ultrafast', '-quality speed', '-threads 0'); // AMD optimized
          } else {
              options.push('-c:v libx264', '-preset ultrafast', '-crf 18', '-threads 0');
          }
      }
      
      if (onProgress) {
          command.on('progress', onProgress);
      }

      command.outputOptions(options)
          .output(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(new Error(`FFmpeg Encoding Error: ${err.message}`)))
          .run();
  });
};

const captureFrames = async (jobId: string, svg: string, background: string, totalFrames: number, fpsNum: number, width: number, height: number, framesDir: string) => {
    const htmlPath = path.join(framesDir, '../', 'index.html');
    const bgStyle = background === 'Transparent' ? 'transparent' : (background === 'White' ? 'white' : 'black');
    
    // Ensure the SVG retains perfect dimensions
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body, html { margin: 0; padding: 0; width: ${width}px; height: ${height}px; background: ${bgStyle}; overflow: hidden; display: flex; align-items: center; justify-content: center; }
#svg-container { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
#svg-container svg { width: 100%; height: 100%; object-fit: contain; }
* { animation-play-state: paused !important; }
</style>
</head>
<body>
<div id="svg-container">
${svg}
</div>
<script>
  const svgs = document.querySelectorAll('svg');
  svgs.forEach(s => {
    if(typeof s.pauseAnimations === 'function') {
      s.pauseAnimations();
    }
  });
</script>
</body>
</html>`;
    
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');

    const browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--js-flags=--max-old-space-size=4096'
      ] 
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      await page.goto(`file://${htmlPath}`, { waitUntil: 'load', timeout: 60000 });

      // Cache DOM queries once
      await page.evaluate(() => {
          (window as any).cachedSvgs = Array.from(document.querySelectorAll('svg')).filter(s => typeof (s as any).pauseAnimations === 'function');
          (window as any).cachedAnims = Array.from(document.querySelectorAll('*')).filter(el => typeof el.getAnimations === 'function');
      });

      const isTransparent = background === 'Transparent';
      const targetExt = isTransparent ? 'png' : 'jpeg';

      for(let i=0; i<totalFrames; i++) {
          const currentTime = i / fpsNum;
          await page.evaluate((currentTime) => {
              // 1. SMIL Animations
              const svgs = (window as any).cachedSvgs || [];
              svgs.forEach((s: any) => {
                  if(typeof s.setCurrentTime === 'function') {
                      s.setCurrentTime(currentTime);
                  }
              });

              // 2. CSS Animations / Web Animations API
              const elements = (window as any).cachedAnims || [];
              elements.forEach((el: any) => {
                  if(typeof el.getAnimations === 'function') {
                      const anims = el.getAnimations();
                      anims.forEach((anim: any) => {
                          anim.currentTime = currentTime * 1000;
                      });
                  }
              });

              // Force CSS layout reflow
              document.body.offsetTop;
          }, currentTime);

          const framePath = path.join(framesDir, `frame-${String(i).padStart(5, '0')}.${targetExt}`);
          await page.screenshot({ 
              path: framePath, 
              type: targetExt, 
              quality: isTransparent ? undefined : 100,
              omitBackground: isTransparent 
          });
          
          jobs.set(jobId, { 
            status: 'Processing', 
            stage: 'Capturing Frames',
            progress: Math.round((i / totalFrames) * 80),
            frame: i + 1,
            totalFrames
          });
          
          // Yield to event loop
          await new Promise(r => setTimeout(r, 0));
      }
    } finally {
      await browser.close();
    }
};

app.post('/api/render', async (req, res) => {
  try {
    const { svg, duration, fps, resolution, background, format } = req.body;
    
    if (!svg) {
      return res.status(400).json({ error: 'Missing SVG content' });
    }

    const durationNum = parseInt(duration) || 6;
    const fpsNum = parseInt(fps) || 30;
    
    // Exact sizing
    let width = 1920; let height = 1080;
    if (resolution === '1080p') { width = 1920; height = 1080; }
    if (resolution === '2K')    { width = 2560; height = 1440; }
    if (resolution === '4K')    { width = 3840; height = 2160; }

    const totalFrames = durationNum * fpsNum;
    const jobId = Date.now() + '-' + Math.random().toString(36).substring(7);
    
    jobs.set(jobId, { status: 'Processing', stage: 'Preparing SVG', progress: 0, frame: 0, totalFrames });
    
    // Safe Background Processor
    (async () => {
      const jobDir = path.join(outputDir, jobId);
      fs.mkdirSync(jobDir, { recursive: true });
      const framesDir = path.join(jobDir, 'frames');
      let retryCount = 0;
      
      try {
        const svgPath = path.join(jobDir, 'input.svg');
        fs.writeFileSync(svgPath, svg, 'utf8');

        // Capture Frames (with retry logic)
        while(retryCount < 2) {
           fs.mkdirSync(framesDir, { recursive: true });
           try {
             await captureFrames(jobId, svg, background, totalFrames, fpsNum, width, height, framesDir);
             break; // success
           } catch (err: any) {
             console.error("Puppeteer Capture Error:", err.message);
             retryCount++;
             if (retryCount >= 2) throw new Error("Puppeteer Render Failed: " + err.message);
             // Clear frames for retry
             fs.rmSync(framesDir, { recursive: true, force: true });
             console.log("Retrying capture... Attempt", retryCount + 1);
           }
        }

        const outputExt = format === 'MOV (Alpha)' ? '.mov' : '.mp4';
        const outputPath = path.join(outputDir, `${jobId}${outputExt}`);
        const frameExt = background === 'Transparent' ? 'png' : 'jpeg';

        jobs.set(jobId, { status: 'Processing', stage: 'Encoding MP4', progress: 85, frame: totalFrames, totalFrames });

        const onFfmpegProgress = (p: any) => {
            if (p.frames) {
                // Approximate encoding progress between 85% and 99%
                const encodeProgress = Math.min(99, 85 + Math.round((p.frames / totalFrames) * 14));
                jobs.set(jobId, { status: 'Processing', stage: 'Encoding MP4', progress: encodeProgress, frame: totalFrames, totalFrames });
            } else {
                // fallback just ping to prevent stuck timer
                jobs.set(jobId, { status: 'Processing', stage: 'Encoding MP4', progress: 85, frame: totalFrames, totalFrames });
            }
        };

        // Encode Video (with GPU fallback to CPU)
        if (format === 'MP4') {
            try {
                // Priority 1: GPU Rendering
                await encodeVideo(framesDir, outputPath, format, fpsNum, true, frameExt, onFfmpegProgress);
            } catch (err: any) {
                console.log("GPU Render Failed, switching to CPU fallback...", err.message);
                // Priority 2: CPU Fallback
                await encodeVideo(framesDir, outputPath, format, fpsNum, false, frameExt, onFfmpegProgress);
            }
        } else {
            // MOV ProRes processing
            await encodeVideo(framesDir, outputPath, format, fpsNum, false, frameExt, onFfmpegProgress);
        }

        jobs.set(jobId, { status: 'Completed', progress: 100, fileUrl: `/api/download/${jobId}${outputExt}` });
      } catch (e: any) {
        console.error("Job Error:", e);
        jobs.set(jobId, { status: 'Failed', progress: 0, error: e.message });
      } finally {
        fs.rmSync(framesDir, { recursive: true, force: true });
      }
    })();

    res.json({ success: true, jobId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/status/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

app.get('/api/download/:filename', (req, res) => {
    const filePath = path.join(outputDir, req.params.filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

app.post('/api/bulk-zip', express.json(), (req, res) => {
    const { filenames } = req.body;
    if (!filenames || filenames.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
    }

    const zipName = 'motion-pack-' + Date.now() + '.zip';
    const zipPath = path.join(outputDir, zipName);
    
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        res.json({ zipUrl: '/api/download/' + zipName });
    });

    archive.on('error', (err) => {
        console.error("Archive Error:", err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to create zip file' });
        }
    });

    archive.pipe(output);

    filenames.forEach((filename: string) => {
        const file = path.join(outputDir, filename);
        if (fs.existsSync(file)) {
            archive.file(file, { name: filename });
        }
    });

    archive.finalize();
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();
