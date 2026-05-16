import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { Code, Sliders, Server, Maximize, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import SvgEditorTab from './components/Tabs/SvgEditorTab';
import VideoControlsTab from './components/Tabs/VideoControlsTab';
import ExportTab from './components/Tabs/ExportTab';

export default function App() {
  const { activeTab, setActiveTab, svgCode, background } = useStore();
  const [previewKey, setPreviewKey] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const tabs = [
    { id: 'SVG Editor', icon: Code, label: 'Source' },
    { id: 'Video Controls', icon: Sliders, label: 'Settings' },
    { id: 'Export', icon: Server, label: 'Render' },
  ];

  // Auto-fit logic
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('preview-container');
      if (container) {
        setContainerSize({ width: container.clientWidth, height: container.clientHeight });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (containerSize.width > 0 && containerSize.height > 0) {
      // Fit 1920x1080 into the container with some padding (e.g., 64px)
      const scaleX = (containerSize.width - 128) / 1920;
      const scaleY = (containerSize.height - 128) / 1080;
      setZoomLevel(Math.min(scaleX, scaleY));
    }
  }, [containerSize]);

  // Safe background logic for preview
  const getBgColor = () => {
    if (background === 'Transparent') return 'bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMWExYTFhIj48L3JlY3Q+CjxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMxYTFhMWEiPjwvcmVjdD4KPHJlY3QgeD0iNCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iIzIyMiI+PC9yZWN0Pgo8cmVjdCB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMjIyIj48L3JlY3Q+Cjwvc3ZnPg==")]';
    if (background === 'White') return 'bg-white';
    return 'bg-black';
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0c] text-slate-300 font-sans overflow-hidden select-none">
      
      {/* 1. NARROW LEFT SIDEBAR: Navigation Rail */}
      <aside className="w-[72px] bg-[#0c0c0e] border-r border-white/5 flex flex-col items-center py-6 z-20 shadow-2xl shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-black font-bold text-lg mb-8 shadow-lg shadow-orange-500/20">
          PR
        </div>
        
        <nav className="flex flex-col gap-4 w-full px-2 mt-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
                className={`relative w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 group
                  ${isActive 
                    ? 'bg-orange-500/10 text-orange-500 shadow-inner border border-orange-500/20' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }
                `}
              >
                <tab.icon className={`w-5 h-5 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                <span className={`text-[9px] uppercase tracking-widest font-bold ${isActive ? 'text-orange-500' : 'text-slate-500'}`}>{tab.label}</span>
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-orange-500 rounded-r-md"></div>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 2. CENTER STAGE: Huge Live Preview */}
      <main className="flex-1 h-full flex flex-col relative bg-[#111114]">
        
        {/* Stage Toolbar */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0c0c0e] z-10">
          <div className="flex items-center gap-6">
            <button onClick={() => setPreviewKey(k => k + 1)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold uppercase tracking-wider text-white transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Replay Runtime
            </button>
            <div className="h-4 w-px bg-white/10"></div>
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/5">
               <button onClick={() => setZoomLevel(z => Math.max(0.1, z - 0.1))} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors"><ZoomOut className="w-4 h-4"/></button>
               <span className="text-[10px] font-mono font-bold w-12 text-center text-slate-300">{Math.round(zoomLevel * 100)}%</span>
               <button onClick={() => setZoomLevel(z => Math.min(3, z + 0.1))} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors"><ZoomIn className="w-4 h-4"/></button>
               <div className="w-px h-3 bg-white/10 mx-1"></div>
               <button onClick={() => {
                   const container = document.getElementById('preview-container');
                   if (container) {
                     const scaleX = (container.clientWidth - 128) / 1920;
                     const scaleY = (container.clientHeight - 128) / 1080;
                     setZoomLevel(Math.min(scaleX, scaleY));
                   }
               }} title="Fit to Screen" className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors"><Maximize className="w-3.5 h-3.5"/></button>
            </div>
          </div>
          <div className="flex items-center gap-3 border border-white/5 bg-white/5 rounded-lg px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">1080p Target</span>
          </div>
        </div>

        {/* Stage Canvas Area */}
        <div id="preview-container" className="flex-1 overflow-auto bg-[#0a0a0c] relative flex items-center justify-center p-8 custom-scrollbar">
           {/* Cinematic Grid Background */}
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none"></div>
           
           {/* Center Crosshairs */}
           <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5 pointer-events-none"></div>
           <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5 pointer-events-none"></div>

           {/* SVG Canvas Content (16:9 bounds) */}
           <div 
             key={previewKey}
             style={{ 
               transform: `scale(${zoomLevel})`, 
               width: '1920px', 
               height: '1080px', 
               transformOrigin: 'center center' // Important for predictable zooming
             }}
             className={`flex items-center justify-center transition-transform duration-100 ease-out outline outline-1 outline-white/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden shrink-0 relative ${getBgColor()}`}
           >
             <div 
                className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain absolute inset-0"
                dangerouslySetInnerHTML={{ __html: svgCode }}
              />
           </div>
        </div>
      </main>

      {/* 3. WIDE RIGHT PANEL: Active Tab Context */}
      <aside className="w-[440px] bg-[#0c0c0e] border-l border-white/5 flex flex-col z-20 shadow-2xl shrink-0">
        {activeTab === 'SVG Editor' && <SvgEditorTab />}
        {activeTab === 'Video Controls' && <VideoControlsTab />}
        {activeTab === 'Export' && <ExportTab />}
      </aside>

    </div>
  );
}
