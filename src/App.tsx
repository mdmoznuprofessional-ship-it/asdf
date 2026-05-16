/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { FileCode, Sliders, Layers, Download, List, History, Settings } from 'lucide-react';
import SvgEditorTab from './components/Tabs/SvgEditorTab';
import VideoControlsTab from './components/Tabs/VideoControlsTab';
import BulkExportTab from './components/Tabs/BulkExportTab';
import ExportTab from './components/Tabs/ExportTab';
import PresetsTab from './components/Tabs/PresetsTab';
import HistoryTab from './components/Tabs/HistoryTab';
import SettingsTab from './components/Tabs/SettingsTab';
import RightPreviewPanel from './components/RightPreviewPanel';

function App() {
  const { activeTab, setActiveTab } = useStore();

  const tabs = [
    { id: 'SVG Editor', icon: FileCode },
    { id: 'Video Controls', icon: Sliders },
    { id: 'Bulk Export', icon: Layers },
    { id: 'Export', icon: Download },
    { id: 'Presets', icon: List },
    { id: 'Render History', icon: History },
    { id: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    console.log("ProRender SVG App Mounted v1.0.1");
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#0c0c0e] text-slate-300 font-sans overflow-hidden select-none">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 border-r border-white/5 bg-[#141416]/40 backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-white/5">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center text-black font-bold text-xs">
                V
              </div>
              <span className="text-white font-semibold tracking-tight">PRORENDER <span className="text-orange-500 font-normal">SVG</span></span>
            </h1>
          </div>
          <nav className="p-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded hover:bg-white/5 transition-colors text-xs font-medium
                  ${activeTab === tab.id 
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' 
                    : 'text-slate-400 hover:text-slate-300 border border-transparent'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.id}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-white/5 text-[10px] font-medium text-slate-500 flex flex-col gap-1">
           <span className="text-orange-500 uppercase tracking-widest">PRO LICENSE ACTIVE</span>
           <span>ENGINE: FFmpeg v6.1-ProRender</span>
        </div>
      </aside>

      {/* Center Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-black/40">
        <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none"></div>
        <div className="absolute inset-0">
          {activeTab === 'SVG Editor' && <SvgEditorTab />}
          {activeTab === 'Video Controls' && <VideoControlsTab />}
          {activeTab === 'Bulk Export' && <BulkExportTab />}
          {activeTab === 'Export' && <ExportTab />}
          {activeTab === 'Presets' && <PresetsTab />}
          {activeTab === 'Render History' && <HistoryTab />}
          {activeTab === 'Settings' && <SettingsTab />}
        </div>
      </main>

      {/* Right Preview Panel */}
      <RightPreviewPanel />
    </div>
  );
}

export default App;

