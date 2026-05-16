import React from 'react';
import { useStore } from '../../store/useStore';
import { Upload, Code, Trash, Download } from 'lucide-react';
import Editor from '@monaco-editor/react';

export default function SvgEditorTab() {
  const { svgCode, setSvgCode } = useStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setSvgCode(e.target?.result as string);
      reader.readAsText(file);
    }
  };

  const clearSvg = () => {
    if(confirm("Are you sure you want to clear the design?")) setSvgCode('');
  };

  const downloadSvg = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#111114]">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
         <div>
           <h2 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
             <Code className="w-5 h-5 text-orange-500" /> SVG Source
           </h2>
           <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Paste or upload a vector graphic format</p>
         </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6 overflow-hidden">
         {/* Upload Zone */}
         <div className="border border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center bg-white/[0.02] hover:bg-white/[0.05] hover:border-orange-500/50 transition-all cursor-pointer relative group">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-orange-500" />
            </div>
            <span className="text-sm text-white font-medium tracking-wide">Import SVG File</span>
            <span className="text-xs text-slate-500 mt-1">Drag & Drop anywhere</span>
            <input 
              type="file" 
              accept=".svg" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileUpload}
            />
         </div>

         {/* Actions */}
         <div className="flex items-center gap-3">
           <button onClick={downloadSvg} className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-xs font-semibold uppercase tracking-wider px-4 py-3 rounded-lg text-slate-300 transition-colors border border-white/5">
             <Download className="w-4 h-4" /> Save Local
           </button>
           <button onClick={clearSvg} className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-xs font-semibold uppercase tracking-wider px-4 py-3 rounded-lg text-red-500 transition-colors border border-red-500/20">
             <Trash className="w-4 h-4" /> Clear Master
           </button>
         </div>

         {/* Monaco Editor */}
         <div className="flex-1 min-h-0 border border-white/10 rounded-xl overflow-hidden bg-[#0c0c0e] shadow-inner flex flex-col">
           <div className="bg-[#1a1a1f] px-5 py-3 border-b border-white/10 flex items-center justify-between">
             <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Raw Source Editor</span>
             <span className="text-[10px] uppercase tracking-widest text-green-500 font-bold px-2 py-0.5 bg-green-500/10 rounded border border-green-500/20">Active</span>
           </div>
           <div className="flex-1 relative">
             <Editor
               height="100%"
               language="xml"
               theme="vs-dark"
               value={svgCode}
               onChange={(val) => setSvgCode(val || '')}
               options={{
                 minimap: { enabled: false },
                 fontSize: 13,
                 wordWrap: 'on',
                 padding: { top: 20, bottom: 20 },
                 scrollBeyondLastLine: false,
                 smoothScrolling: true,
                 fontFamily: '"JetBrains Mono", monospace'
               }}
             />
           </div>
         </div>
      </div>
    </div>
  );
}
