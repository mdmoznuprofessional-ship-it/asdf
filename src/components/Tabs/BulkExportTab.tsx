import { useStore, RenderJob } from '../../store/useStore';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Play, FileArchive, Download, XCircle, CheckCircle, Loader } from 'lucide-react';

export default function BulkExportTab() {
  const { bulkJobs, addBulkJobs, updateBulkJob, isProcessingQueue, setIsProcessingQueue, duration, fps, resolution, format, addToHistory } = useStore();

  const onDrop = async (acceptedFiles: File[]) => {
    const newJobs: RenderJob[] = [];
    
    for (const file of acceptedFiles) {
      const content = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsText(file);
      });
      
      newJobs.push({
        id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        filename: file.name,
        svgCode: content,
        status: 'Waiting',
        duration,
        resolution,
        fps,
        format,
        progress: 0,
      });
    }
    
    if (newJobs.length > 0) {
      addBulkJobs(newJobs);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/svg+xml': ['.svg'] }
  } as any);

  const processJob = async (job: RenderJob): Promise<void> => {
    updateBulkJob(job.id, { status: 'Processing', progress: 0 });
    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          svg: job.svgCode,
          duration: job.duration,
          fps: job.fps,
          resolution: job.resolution,
          background: 'Transparent',
          format: job.format,
        })
      });
      
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.indexOf('text/html') !== -1) {
        throw new Error("Backend deployment missing (Netlify static host restriction). Deploy to Render.com.");
      }

      const data = await res.json();
      if (res.ok && data.success) {
        return new Promise((resolve) => {
           const jobId = data.jobId;
           const poll = setInterval(async () => {
             try {
                const statusRes = await fetch(`/api/status/${jobId}`);
                if (statusRes.ok) {
                   const statusData = await statusRes.json();
                   if (statusData.status === 'Completed') {
                     clearInterval(poll);
                     updateBulkJob(job.id, { status: 'Completed', progress: 100, fileUrl: statusData.fileUrl });
                     addToHistory({ ...job, status: 'Completed', progress: 100, fileUrl: statusData.fileUrl });
                     resolve();
                   } else if (statusData.status === 'Failed') {
                     clearInterval(poll);
                     updateBulkJob(job.id, { status: 'Failed', progress: 0, error: statusData.error || 'Unknown rendering error' });
                     resolve();
                   } else {
                     updateBulkJob(job.id, { progress: statusData.progress || 0 });
                   }
                }
             } catch(e: any) {
               clearInterval(poll);
               updateBulkJob(job.id, { status: 'Failed', progress: 0, error: 'Polling connection lost' });
               resolve();
             }
           }, 1500);
        });
      } else {
        throw new Error(data.error || 'Failed to start job');
      }
    } catch (err: any) {
      updateBulkJob(job.id, { status: 'Failed', progress: 0, error: err.message });
    }
  };

  const startQueue = async () => {
    if (isProcessingQueue) return;
    setIsProcessingQueue(true);
    
    while (true) {
      if (!useStore.getState().isProcessingQueue) break;
      
      const nextJob = useStore.getState().bulkJobs.find(j => j.status === 'Waiting');
      if (!nextJob) break;
      
      await processJob(nextJob);
    }
    
    setIsProcessingQueue(false);
  };

  const stopQueue = () => {
    setIsProcessingQueue(false);
  };

  const downloadAllZip = async () => {
    const completed = useStore.getState().bulkJobs.filter(j => j.status === 'Completed' && j.fileUrl);
    if (completed.length === 0) return;
    
    const filenames = completed.map(j => j.fileUrl!.split('/').pop()!).filter(Boolean);
    const res = await fetch('/api/bulk-zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filenames })
    });
    const data = await res.json();
    if (res.ok && data.zipUrl) {
      window.location.href = data.zipUrl;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Bulk Export</h2>
          <p className="text-sm text-slate-400 mt-1">Upload multiple SVG files, queue them up, and render sequentially.</p>
        </div>
        <div className="flex gap-2">
          {bulkJobs.some(j => j.status === 'Completed') && (
            <button onClick={downloadAllZip} className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold rounded hover:bg-slate-200 transition-colors shadow">
              <FileArchive className="w-4 h-4" /> DOWNLOAD ZIP
            </button>
          )}
          {!isProcessingQueue ? (
            <button onClick={startQueue} disabled={!bulkJobs.some(j => j.status === 'Waiting')} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-bold rounded flex shrink-0 transition-colors shadow-lg shadow-orange-900/20">
              <Play className="w-4 h-4" /> RENDER ALL
            </button>
          ) : (
            <button onClick={stopQueue} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded transition-colors shadow">
              <XCircle className="w-4 h-4" /> STOP QUEUE
            </button>
          )}
        </div>
      </div>

      <div className="p-6 flex-none">
        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragActive ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
        }`}>
          <input {...getInputProps()} />
          <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-sm text-slate-300 font-medium">Add SVGs to Queue (Drag & Drop)</p>
          <p className="text-xs text-slate-500 mt-1">Current global settings will be applied: {resolution} / {fps}fps / {duration}s</p>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="border border-white/5 rounded-lg overflow-hidden bg-[#141416]/40 backdrop-blur-md">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-black/60 text-[10px] uppercase tracking-widest text-slate-500 border-b border-white/5">
              <tr>
                <th className="px-4 py-3 font-bold">File Name</th>
                <th className="px-4 py-3 font-bold">Settings</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bulkJobs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-xs">No SVGs in queue.</td>
                </tr>
              ) : bulkJobs.map(job => (
                <tr key={job.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-300">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-black border border-white/10 flex items-center justify-center p-1" dangerouslySetInnerHTML={{__html: job.svgCode}} />
                      {job.filename}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[10px] font-mono text-slate-500">
                    {job.resolution} • {job.format} • {job.duration}s
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold">
                      {job.status === 'Waiting' && <span className="text-slate-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-700"></div> Waiting</span>}
                      {job.status === 'Processing' && <span className="text-orange-400 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div> Processing {job.progress}%</span>}
                      {job.status === 'Completed' && <span className="text-green-500/70 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Completed</span>}
                      {job.status === 'Failed' && (
                        <span className="text-red-400 flex items-center gap-1 group relative">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div> Failed
                          {job.error && (
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-black text-white text-[10px] font-mono leading-tight rounded border border-red-500/20 z-10 shadow-xl pointer-events-none">
                              {job.error}
                            </div>
                          )}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {job.status === 'Completed' && job.fileUrl && (
                      <a href={job.fileUrl} download className="inline-flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded text-[10px] font-bold uppercase transition-colors">
                        <Download className="w-3 h-3" /> Download
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
