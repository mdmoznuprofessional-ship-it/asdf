import { useStore } from '../../store/useStore';
import { Clock, MonitorPlay, Maximize, Palette } from 'lucide-react';

export default function VideoControlsTab() {
  const { duration, setDuration, fps, setFps, resolution, setResolution, background, setBackground } = useStore();

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Video Controls</h2>
          <p className="text-sm text-slate-400 mt-1">Configure duration, framerate, and output quality.</p>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto max-w-3xl">
        <div className="space-y-8">
          
          {/* Duration */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-medium">
              <Clock className="w-4 h-4 text-orange-500" />
              <h3>Duration (Seconds)</h3>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="1" 
                max="60" 
                value={duration} 
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="flex-1 accent-orange-500"
              />
              <div className="w-24 relative">
                <input 
                  type="number" 
                  min="1"
                  max="60"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 6)}
                  className="w-full bg-[#141416]/40 border border-white/5 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-500 text-sm font-mono"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500 uppercase">sec</span>
              </div>
            </div>
          </section>

          {/* FPS */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-medium">
              <MonitorPlay className="w-4 h-4 text-orange-500" />
              <h3>Framerate (FPS)</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[24, 30, 60].map((val) => (
                <button
                  key={val}
                  onClick={() => setFps(val)}
                  className={`py-3 rounded border text-sm font-medium transition-colors ${
                    fps === val 
                      ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 font-mono uppercase' 
                      : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20 font-mono uppercase'
                  }`}
                >
                  {val} fps
                </button>
              ))}
            </div>
          </section>

          {/* Resolution */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-medium">
              <Maximize className="w-4 h-4 text-orange-500" />
              <h3>Resolution</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['1080p', '2K', '4K'].map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`py-3 rounded border text-sm font-medium transition-colors ${
                    resolution === res 
                      ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 font-mono uppercase' 
                      : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20 font-mono uppercase'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </section>

          {/* Background */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-medium">
              <Palette className="w-4 h-4 text-orange-500" />
              <h3>Background</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['Transparent', 'White', 'Black'].map((bg) => (
                <button
                  key={bg}
                  onClick={() => setBackground(bg)}
                  className={`py-3 rounded border flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                    background === bg 
                      ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 font-mono uppercase' 
                      : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20 font-mono uppercase'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border border-white/20 ${
                    bg === 'Transparent' ? 'bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMWExYTFhIj48L3JlY3Q+CjxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMxYTFhMWEiPjwvcmVjdD4KPHJlY3QgeD0iNCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iIzIyMiI+PC9yZWN0Pgo8cmVjdCB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMjIyIj48L3JlY3Q+Cjwvc3ZnPg==")]' 
                    : bg === 'White' ? 'bg-white' : 'bg-black'
                  }`} />
                  {bg}
                </button>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
