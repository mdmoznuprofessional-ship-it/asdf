import { useState } from 'react';
import { useStore } from '../../store/useStore';
import Editor from '@monaco-editor/react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Code, Trash2, Download } from 'lucide-react';

export default function SvgEditorTab() {
  const { svgCode, setSvgCode } = useStore();
  const [editorReady, setEditorReady] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSvgCode(reader.result);
        }
      };
      reader.readAsText(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/svg+xml': ['.svg'] },
    multiple: false
  } as any);

  const handleDownload = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited_design.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">SVG Editor</h2>
          <p className="text-sm text-slate-400 mt-1">Paste, upload, or edit your SVG code here. Preserves all animations & gradients.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/5 text-sm font-medium rounded text-slate-300 border border-white/10 transition-colors">
            <Download className="w-4 h-4" /> Download SVG
          </button>
          <button onClick={() => setSvgCode('')} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-sm font-medium rounded transition-colors">
            <Trash2 className="w-4 h-4" /> Clear Editor
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-4">
        {/* Dropzone top area */}
        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragActive ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
        }`}>
          <input {...getInputProps()} />
          <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-sm text-slate-300 font-medium">Drag & drop an SVG file here, or click to select</p>
          <p className="text-xs text-slate-500 mt-1">Supports static and animated SVG files.</p>
        </div>

        {/* Editor Area */}
        <div className="flex-1 rounded-lg overflow-hidden border border-white/5 bg-[#0c0c0e] flex flex-col">
          <div className="bg-black/40 px-4 py-2 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">editor.svg</span>
            </div>
          </div>
          <div className="flex-1 relative">
            <Editor
              height="100%"
              defaultLanguage="xml"
              theme="vs-dark"
              value={svgCode}
              onChange={(val) => setSvgCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                wordWrap: 'on',
                formatOnPaste: true,
                scrollBeyondLastLine: false,
              }}
              onMount={() => setEditorReady(true)}
            />
            {!editorReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0c0c0e]">
                <span className="text-slate-500 text-sm">Loading Editor...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
