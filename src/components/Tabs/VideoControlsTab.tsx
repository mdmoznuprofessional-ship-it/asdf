import { useStore } from '../../store/useStore';
import { Sliders, Monitor, Clock, Video, Palette } from 'lucide-react';

export default function VideoControlsTab() {
  const { duration, setDuration, fps, setFps, resolution, setResolution, background, setBackground, format, setFormat } = useStore();

  return (
    <div className="flex flex-col h-full bg-[#111114]">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
         <div>
           <h2 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
             <Sliders className="w-5 h-5 text-orange-500" /> Output Config
           </h2>
           <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Configure rendering engine parameters</p>
         </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-8">
         <div className="space-y-4">
            <h3 className="text-[11px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
              <Monitor className="w-4 h-4" /> Sequence Properties
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-500 font-bold mb-2 block uppercase tracking-widest">Resolution</label>
                <select 
                  value={resolution} onChange={e => setResolution(e.target.value)} 
                  className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-orange-500 hover:border-white/20 transition-colors shadow-inner"
                >
                  <option value="1080p">1080p Full HD</option>
                  <option value="2K">1440p 2K</option>
                  <option value="4K">2160p 4K UHD</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold mb-2 block uppercase tracking-widest">Frame Rate</label>
                <select 
                  value={fps} onChange={e => setFps(Number(e.target.value))} 
                  className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-orange-500 hover:border-white/20 transition-colors shadow-inner"
                >
                  <option value={24}>24.00 (Film)</option>
                  <option value={30}>30.00 (Standard)</option>
                  <option value={60}>60.00 (Smooth)</option>
                </select>
              </div>
            </div>
         </div>

         <div className="h-px bg-white/5 w-full"></div>

         <div className="space-y-4">
            <h3 className="text-[11px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
              <Clock className="w-4 h-4" /> Timeline
            </h3>
            
            <div>
              <label className="text-[10px] text-slate-500 font-bold mb-2 flex justify-between uppercase tracking-widest">
                <span>Duration</span>
                <span className="text-orange-400">{duration} Seconds / {duration * fps} Frames</span>
              </label>
              <input 
                type="range" min="1" max="60"
                value={duration} onChange={e => setDuration(Number(e.target.value))}
                className="w-full accent-orange-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>
         </div>

         <div className="h-px bg-white/5 w-full"></div>

         <div className="space-y-4">
            <h3 className="text-[11px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
              <Palette className="w-4 h-4" /> Composition
            </h3>
            
            <div>
              <label className="text-[10px] text-slate-500 font-bold mb-2 block uppercase tracking-widest">Backdrop</label>
              <select 
                value={background} onChange={e => setBackground(e.target.value)} 
                className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-orange-500 hover:border-white/20 transition-colors shadow-inner"
              >
                <option value="Black">Solid Black (RGB 0,0,0)</option>
                <option value="White">Solid White (RGB 255,255,255)</option>
                <option value="Transparent">Alpha Transparent</option>
              </select>
            </div>
         </div>

      </div>
    </div>
  );
}
