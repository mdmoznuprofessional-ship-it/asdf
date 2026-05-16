import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Download, Loader, Play, CheckCircle, Video } from 'lucide-react';

export default function ExportTab() {
  const { svgCode, duration, fps, resolution, background, format, setFormat, addToHistory } = useStore();
  const [isExporting, setIsExporting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const startExport = async (overrideFormat?: string) => {
    if (!svgCode) return;
    const targetFormat = overrideFormat || format;
    setFormat(targetFormat);
    setIsExporting(true);
    setDownloadUrl(null);
    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          svg: svgCode,
          duration,
          fps,
          resolution,
          background,
          format: targetFormat,
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Poll for job status
        const jobId = data.jobId;
        const poll = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/status/${jobId}`);
            if (statusRes.ok) {
               const statusData = await statusRes.json();
               if (statusData.status === 'Completed') {
                 clearInterval(poll);
                 setDownloadUrl(statusData.fileUrl);
                 setIsExporting(false);
                 addToHistory({
                  id: jobId,
                  filename: 'Single_Export_' + jobId,
                  svgCode,
                  status: 'Completed',
                  duration,
                  resolution,
                  fps,
                  format: targetFormat,
                  progress: 100,
                  fileUrl: statusData.fileUrl,
                 });
               } else if (statusData.status === 'Failed') {
                 clearInterval(poll);
                 setIsExporting(false);
                 alert("Export failed: " + statusData.error);
               }
            }
          } catch(e) {
             clearInterval(poll);
             setIsExporting(false);
             alert("Poll Error");
          }
        }, 1500);

      } else {
        alert("Export failed: " + data.error);
        setIsExporting(false);
      }
    } catch (err) {
      alert("Network Error");
      setIsExporting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Single Export</h2>
          <p className="text-sm text-slate-400 mt-1">Render your current Editor SVG to video instantly.</p>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        
        {isExporting ? (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 rounded-full border-4 border-white/10 border-t-orange-500 animate-spin"></div>
            <h3 className="text-xl font-medium text-white">Rendering Video...</h3>
            <p className="text-sm text-slate-400">Processing {resolution} @ {fps}fps on local GPU/CPU.</p>
          </div>
        ) : downloadUrl ? (
          <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Render Completed</h3>
              <p className="text-sm text-slate-400 mt-1">Your high-quality video is ready.</p>
            </div>
            <a href={downloadUrl} download className="flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded shadow-xl shadow-orange-900/20 transition-all hover:scale-105 uppercase text-xs tracking-wider">
              <Download className="w-4 h-4" /> Download Video
            </a>
            <button onClick={() => setDownloadUrl(null)} className="text-[10px] text-slate-500 hover:text-white transition-colors font-bold uppercase tracking-widest">
              Render Again
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-6">
            <div className="bg-[#141416]/40 backdrop-blur-md border border-white/5 rounded-lg p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Settings Validation</span>
                <span className="px-2 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] rounded font-mono font-bold uppercase">{resolution} • {fps} FPS</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded p-3 border border-white/5">
                  <span className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Duration</span>
                  <span className="block text-sm font-mono text-slate-200">{duration} seconds</span>
                </div>
                <div className="bg-white/5 rounded p-3 border border-white/5">
                  <span className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Background</span>
                  <span className="block text-sm font-mono text-slate-200 uppercase">{background}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => startExport('MP4')}
                  disabled={!svgCode}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-200 disabled:opacity-50 text-black font-bold text-xs rounded transition-colors uppercase tracking-wider"
                >
                  <Play className="w-4 h-4" /> Export MP4 (H.264)
                </button>
                <button 
                  onClick={() => startExport('MOV (Alpha)')}
                  disabled={!svgCode}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-xs rounded transition-colors uppercase tracking-wider shadow-lg shadow-orange-900/20"
                >
                  <Video className="w-4 h-4" /> Export MOV (ProRes 4444 Alpha)
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
