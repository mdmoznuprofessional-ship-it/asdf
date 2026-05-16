# ProRender SVG - Local Setup (AMD Optimized)

Follow these exact instructions to ensure perfect 1080p MP4 exports natively on your AMD Ryzen 7 5700G system.

## 1. Prerequisites
- **Node.js**: Install Node.js v18 or later.
- **FFmpeg**: You do **not** need to install FFmpeg globally. The app includes `@ffmpeg-installer/ffmpeg` and will download static binaries automatically.

## 2. Installation
Open your terminal in the project directory and run:

```bash
npm install
```

## 3. Running the App Local Server
Do **not** use Netlify CLI or Render commands. Run the custom full-stack server natively:

```bash
npm run dev
```

This boots up the Vite frontend + Express backend on **http://localhost:3000**.

## 4. Usage Rules for Perfect Exports
1. Open http://localhost:3000 in your browser.
2. In the "SVG Editor" tab, paste your SVG code.
   - *Tip:* Make sure your `<svg>` tag has a valid `viewBox` attribute (e.g., `viewBox="0 0 800 600"`), which allows our engine to perfectly upscale it to 1080p without breaking layout.
3. In the "Video Controls" tab (or directly in Export):
   - Set Resolution to **1080p**
   - Set FPS to **30**
   - Set Duration to **6 seconds**
   - Set Background to **Black**
   - Set Format to **MP4**
4. Switch to the **Export** tab and click **Render MP4**.

## 5. Why AMD `h264_amf` Encoding?
The rendering engine in `server.ts` has been explicitly tuned for your **AMD Ryzen 7 5700G**. It will attempt Priority 1 GPU encoding using `-c:v h264_amf`.
If you are missing AMD drivers, it will seamlessly fall back to CPU (`libx264 ultrafast`), which easily computes 6 seconds of 1080p frames on a Ryzen 7 in just a few seconds.

## Troubleshooting
- **No Video Exporting?** Check your terminal where you ran `npm run dev` to see if Puppeteer or FFmpeg logged any specific errors.
- **Chrome/Puppeteer errors?** Ensure you don't have antivirus software aggressively blocking Chromium from booting in the background.
