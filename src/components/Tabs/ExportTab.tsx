import { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { Download, RefreshCcw, CheckCircle, AlertCircle, Upload, Play, Server } from 'lucide-react';

export default function ExportTab() {
  const { svgCode, duration, fps, resolution, background, format } = useStore();
  
  const [isExporting, setIsExporting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('Idle');
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(duration * fps);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [stuckTimer, setStuckTimer] = useState(0);
  const [isStuck, setIsStuck] = useState(false);
  const [renderTime, setRenderTime] = useState(0);
  
  const pollInterval = useRef<any>(null);
  const elapsedInterval = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    setTotalFrames(duration * fps);
  }, [duration, fps]);

  const cancelRender = () => {
    setIsExporting(false);
    clearInterval(pollInterval.current);
    clearInterval(elapsedInterval.current);
    setCurrentStage('Cancelled');
    setIsStuck(false);
  };

  const startExport = async () => {
    if (!svgCode) return;
    setIsExporting(true);
    setDownloadUrl(null);
    setProgress(0);
    setCurrentFrame(0);
    setElapsedSeconds(0);
    setCurrentStage('Submitting Job...');
    setIsStuck(false);
    setStuckTimer(0);
    
    startTimeRef.current = Date.now();
    elapsedInterval.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      setStuckTimer(t => t + 1);
    }, 1000);

    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ svg: svgCode, duration, fps, resolution, background, format })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const jobId = data.jobId;
        let lastProgress = 0;

        pollInterval.current = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/status/${jobId}`);
            if (statusRes.ok) {
               const statusData = await statusRes.json();
               
               if (statusData.progress > lastProgress) {
                 lastProgress = statusData.progress;
                 setStuckTimer(0);
               }

               if (statusData.status === 'Processing') {
                 setProgress(statusData.progress || 0);
                 setCurrentStage(statusData.stage || 'Rendering...');
                 setCurrentFrame(statusData.frame || 0);
                 setTotalFrames(statusData.totalFrames || (duration * fps));
               }

               if (statusData.status === 'Completed') {
                 clearInterval(pollInterval.current);
                 clearInterval(elapsedInterval.current);
                 setRenderTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
                 setDownloadUrl(statusData.fileUrl);
                 setIsExporting(false);
                 setProgress(100);
                 setCurrentStage('Completed');
               } else if (statusData.status === 'Failed') {
                 clearInterval(pollInterval.current);
                 clearInterval(elapsedInterval.current);
                 setIsExporting(false);
                 alert("Export failed: " + statusData.error);
                 setCurrentStage('Failed');
               }
            }
          } catch(e) {}
        }, 500);

      } else {
         clearInterval(elapsedInterval.current);
         setIsExporting(false);
         alert("Export failed: " + data.error);
      }
    } catch (err) {
      clearInterval(elapsedInterval.current);
      alert("Network Error");
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (stuckTimer > 15) {
      setIsStuck(true);
    }
  }, [stuckTimer]);

  const formatTime = (sec: number) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Remaining time estimation
  const estimateRemaining = () => {
    if (progress === 0 || elapsedSeconds === 0) return "--:--";
    const totalEst = (elapsedSeconds / progress) * 100;
    const rem = totalEst - elapsedSeconds;
    if (rem < 0) return "00:00";
    return formatTime(Math.round(rem));
  };

  return (
    <div className="flex flex-col h-full bg-[#111114]">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
         <div>
           <h2 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
             <Server className="w-5 h-5 text-orange-500" /> Render Queue
           </h2>
           <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Execute pipeline export</p>
         </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center relative">
        
        {/* Render Form / Top Actions */}
        <div className="w-full mb-8">
           <div className="grid grid-cols-2 gap-3 mb-6">
             <div className="bg-[#1a1a1f] p-4 rounded-xl border border-white/5 shadow-inner">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block mb-1 font-bold">Format</span>
                <span className="text-sm font-mono text-white tracking-widest">{format}</span>
             </div>
             <div className="bg-[#1a1a1f] p-4 rounded-xl border border-white/5 shadow-inner">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block mb-1 font-bold">Engine</span>
                <span className="text-sm font-mono text-white tracking-widest">H.264 CPU</span>
             </div>
           </div>

           {(!isExporting && !downloadUrl) && (
              <button 
                onClick={startExport}
                className="w-full h-16 bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest shadow-[0_0_30px_rgba(234,88,12,0.15)] hover:shadow-[0_0_40px_rgba(234,88,12,0.3)] shadow-orange-500/20 active:scale-[0.98] border border-orange-500/50"
              >
                <Upload className="w-5 h-5"/> Initialize Render
              </button>
           )}

           {(isExporting) && (
              <button 
                onClick={cancelRender}
                className="w-full h-16 bg-[#1a1a1f] hover:bg-red-500/10 text-red-500 border border-red-500/30 font-bold rounded-xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest active:scale-[0.98]"
              >
                Abort Render
              </button>
           )}

           {(!isExporting && downloadUrl) && (
             <div className="flex flex-col gap-3">
               <a 
                 href={downloadUrl} download 
                 className="w-full h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] border border-emerald-500/50 active:scale-[0.98]"
               >
                 <Download className="w-5 h-5"/> Download MP4 File
               </a>
               <button 
                 onClick={startExport}
                 className="w-full h-14 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 font-bold rounded-xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest border border-white/5 active:scale-[0.98]"
               >
                 <RefreshCcw className="w-5 h-5"/> Start New Render
               </button>
             </div>
           )}
        </div>

        {/* Live Status Region */}
        <div className="w-full flex-1 border border-white/5 bg-[#0c0c0e] rounded-xl flex flex-col items-center justify-center relative p-6 shadow-inner overflow-hidden">
          
          {(!isExporting && !downloadUrl) && (
             <div className="text-center opacity-30 flex flex-col items-center gap-4">
                <Server className="w-12 h-12 text-slate-500" />
                <span className="text-xs uppercase tracking-widest font-bold">Node Idle</span>
             </div>
          )}

          {isExporting && (
             <div className="w-full animate-in fade-in duration-500 flex flex-col gap-8">
                
                <div className="text-center">
                  <div className="text-5xl font-mono font-light text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    {progress}%
                  </div>
                  <div className="flex flex-col items-center gap-2">
                     <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1.5">
                       <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span> Active Operation
                     </span>
                     <span className="text-sm font-medium tracking-wide text-orange-400 font-mono">
                       {currentStage}
                     </span>
                  </div>
                </div>

                <div className="w-full relative">
                  <div className="w-full h-3 bg-[#1a1a1f] rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(234,88,12,0.8)] relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(-45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[stripes_1s_linear_infinite]"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <span className="text-[9px] uppercase text-slate-500 tracking-widest mb-1 block">Frame Rendered</span>
                     <span className="font-mono text-base text-white">{currentFrame} <span className="text-slate-600">/ {totalFrames}</span></span>
                   </div>
                   <div>
                     <span className="text-[9px] uppercase text-slate-500 tracking-widest mb-1 block">Elapsed Time</span>
                     <span className="font-mono text-base text-white">{formatTime(elapsedSeconds)}</span>
                   </div>
                   <div className="col-span-2 border-t border-white/5 pt-4">
                     <span className="text-[9px] uppercase text-slate-500 tracking-widest mb-1 block">Estimated Remaining</span>
                     <span className="font-mono text-base text-orange-400">{estimateRemaining()}</span>
                   </div>
                </div>

                {isStuck && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest">Pipeline Stall Detected</h4>
                      <p className="text-[10px] text-red-400/80 mt-1.5 leading-relaxed tracking-wide">No progress received in 15 seconds. FFMPEG encoder may be bottlenecking CPU cores.</p>
                      <button onClick={cancelRender} className="mt-3 text-[10px] uppercase tracking-widest font-bold text-white bg-red-500/20 px-3 py-1.5 rounded hover:bg-red-500/30 transition-colors">Abort Render</button>
                    </div>
                  </div>
                )}
             </div>
          )}

          {(!isExporting && downloadUrl) && (
            <div className="w-full animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center text-center gap-6">
              
              {/* Actual Video Preview block replacing the big checkmark */}
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] bg-black relative flex items-center justify-center">
                 <video src={downloadUrl} controls autoPlay loop className="w-full h-full object-contain" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-widest text-shadow">Render Completed</h3>
                <p className="text-xs text-emerald-400 mt-2 tracking-wide font-medium">Successfully transcoded to video.</p>
              </div>

              <div className="w-full grid grid-cols-2 gap-px mt-2 overflow-hidden rounded-xl border border-white/5 bg-white/5">
                 <div className="bg-[#111114] p-4 text-center">
                   <span className="text-[9px] uppercase text-slate-500 tracking-widest block mb-1">Total Time</span>
                   <span className="font-mono text-lg text-white">{formatTime(renderTime)}</span>
                 </div>
                 <div className="bg-[#111114] p-4 text-center">
                   <span className="text-[9px] uppercase text-slate-500 tracking-widest block mb-1">Processed Frames</span>
                   <span className="font-mono text-lg text-white">{totalFrames}</span>
                 </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
