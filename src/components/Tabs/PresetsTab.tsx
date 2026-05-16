import { useStore } from '../../store/useStore';
import { Settings, Play, Save, Trash2 } from 'lucide-react';

export default function PresetsTab() {
  const { presets, applyPreset, deletePreset, resolution, fps, duration, format, background, addPreset } = useStore();

  const handleSaveCurrent = () => {
    const name = prompt("Enter a name for your preset:");
    if (name) {
      addPreset({
        id: Date.now().toString(),
        name,
        resolution,
        fps,
        duration,
        format,
        background
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Export Presets</h2>
          <p className="text-sm text-slate-400 mt-1">Quickly apply recommended settings for microstock or social media.</p>
        </div>
        <button onClick={handleSaveCurrent} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-colors border border-white/10">
          <Save className="w-4 h-4" /> Save Current Settings
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presets.map(preset => (
            <div key={preset.id} className="bg-[#141416]/40 backdrop-blur-md border border-white/5 rounded-lg p-5 hover:border-white/20 transition-colors group flex flex-col shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                    <Settings className="w-4 h-4 text-orange-500" />
                  </div>
                  <h3 className="text-white font-bold leading-tight">{preset.name}</h3>
                </div>
                {presets.length > 4 && (
                  <button onClick={() => deletePreset(preset.id)} className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="space-y-2 mb-6 flex-1">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                  <span className="text-slate-500">Resolution</span>
                  <span className="text-slate-300 font-mono">{preset.resolution}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                  <span className="text-slate-500">Framerate</span>
                  <span className="text-slate-300 font-mono">{preset.fps} FPS</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                  <span className="text-slate-500">Duration</span>
                  <span className="text-slate-300 font-mono">{preset.duration} sec</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                  <span className="text-slate-500">Format</span>
                  <span className="text-slate-300 font-mono">{preset.format}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                  <span className="text-slate-500">Background</span>
                  <span className="text-slate-300 font-mono">{preset.background}</span>
                </div>
              </div>

              <button onClick={() => applyPreset(preset)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-orange-600 text-white text-[10px] uppercase tracking-widest font-bold rounded transition-colors border border-white/5 group-hover:border-orange-500/20 shadow-lg group-hover:shadow-orange-900/20">
                <Play className="w-4 h-4" /> Apply Preset
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
