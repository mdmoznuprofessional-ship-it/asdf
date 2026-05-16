import { Cpu, Zap } from 'lucide-react';

export default function SettingsTab() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-white/5">
        <h2 className="text-2xl font-bold text-white">App Settings</h2>
        <p className="text-sm text-slate-400 mt-1">Configure performance and app preferences.</p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto max-w-3xl">
        <div className="space-y-8">
          
          <section className="space-y-4">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 border-b border-white/5 pb-2">Rendering Performance</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-6 bg-orange-500/10 border-2 border-orange-500/50 rounded-xl text-orange-400">
                <Zap className="w-8 h-8 mb-2 text-orange-500" />
                <span className="font-bold text-white uppercase tracking-wider text-sm">GPU Acceleration</span>
                <span className="text-[10px] text-center mt-1 text-orange-200">Using hardware nvenc/videotoolbox if available</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-6 bg-white/5 border-2 border-white/10 rounded-xl text-slate-400 hover:border-white/20 transition-colors">
                <Cpu className="w-8 h-8 mb-2" />
                <span className="font-bold text-slate-200 uppercase tracking-wider text-sm">CPU Fallback</span>
                <span className="text-[10px] text-center mt-1 text-slate-500">Slower rendering using libx264</span>
              </button>
            </div>
            
            <div className="pt-4">
              <label className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded">
                <div>
                  <div className="text-white font-bold text-sm">Auto-Optimize Threads</div>
                  <div className="text-[10px] uppercase text-slate-500 tracking-widest">Automatically balance CPU threads for rendering (Recommended)</div>
                </div>
                <div className="w-12 h-6 bg-orange-500 rounded-full relative">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 border-b border-white/5 pb-2">Appearance</h3>
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded">
              <div>
                <div className="text-white font-bold text-sm">Theme</div>
                <div className="text-[10px] uppercase text-slate-500 tracking-widest">Choose between dark and light mode.</div>
              </div>
              <select className="bg-black/40 border border-white/10 text-slate-200 rounded px-3 py-1.5 focus:outline-none focus:border-orange-500 text-xs font-bold uppercase tracking-widest">
                <option>Dark Mode (Frosted)</option>
                <option>Light Mode</option>
              </select>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 border-b border-white/5 pb-2">Cache Management</h3>
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded">
              <div>
                <div className="text-white font-bold text-sm">Render Cache</div>
                <div className="text-[10px] uppercase text-slate-500 tracking-widest font-mono">12.4 MB currently used by temporary frames.</div>
              </div>
              <button className="px-4 py-2 bg-red-500/10 text-red-500 hover:text-red-400 hover:bg-red-500/20 text-[10px] font-bold uppercase tracking-widest border border-red-500/20 rounded transition-colors">
                Clear Cache
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
