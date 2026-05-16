import { useStore } from '../store/useStore';

export default function RightPreviewPanel() {
  const { svgCode, duration, fps, resolution, background, format } = useStore();

  const getBgColor = () => {
    if (background === 'Transparent') return 'bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMWExYTFhIj48L3JlY3Q+CjxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMxYTFhMWEiPjwvcmVjdD4KPHJlY3QgeD0iNCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iIzIyMiI+PC9yZWN0Pgo8cmVjdCB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMjIyIj48L3JlY3Q+Cjwvc3ZnPg==")]';
    if (background === 'White') return 'bg-white';
    return 'bg-black';
  };

  return (
    <aside className="w-80 border-l border-white/5 bg-[#141416]/40 backdrop-blur-md flex flex-col">
      <div className="h-12 flex items-center px-4 border-b border-white/5">
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Live Preview</span>
      </div>
      
      <div className="flex-1 p-4 flex flex-col items-center">
        {/* Aspect Ratio Box relative to standard 16:9 */}
        <div className={`w-full aspect-video rounded overflow-hidden flex items-center justify-center border border-white/10 shadow-2xl relative ${getBgColor()}`}>
          {/* We render the SVG exactly as it is via innerHTML to ensure pixel-perfect playback of CSS animations */}
          <div 
            className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto [&>svg]:object-contain"
            dangerouslySetInnerHTML={{ __html: svgCode }}
          />
          <div className="absolute inset-0 border border-dashed border-white/5 pointer-events-none"></div>
        </div>

        <div className="mt-6 w-full space-y-3">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Resolution</span>
            <span className="text-[10px] text-white font-mono uppercase">{resolution}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Format</span>
            <span className="text-[10px] text-white font-mono uppercase">{format}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Frame Rate</span>
            <span className="text-[10px] text-white font-mono uppercase">{fps} FPS</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Duration</span>
            <span className="text-[10px] text-white font-mono uppercase">0{duration}.00s</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
