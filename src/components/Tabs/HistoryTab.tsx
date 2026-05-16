import { useStore } from '../../store/useStore';
import { Download, Trash2, Video } from 'lucide-react';

export default function HistoryTab() {
  const { renderHistory, clearHistory } = useStore();

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Render History</h2>
          <p className="text-sm text-slate-400 mt-1">Access your previously rendered videos in this session.</p>
        </div>
        <button onClick={clearHistory} disabled={renderHistory.length === 0} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded transition-colors border border-white/10 hover:border-red-500/20">
          <Trash2 className="w-4 h-4" /> Clear History
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {renderHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <Video className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-[10px] uppercase font-bold tracking-widest">No render history yet.</p>
          </div>
        ) : (
          <div className="bg-[#141416]/40 backdrop-blur-md border border-white/5 rounded-lg overflow-hidden shadow-xl">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-black/60 text-[10px] uppercase tracking-widest text-slate-500 border-b border-white/5">
                <tr>
                  <th className="px-4 py-3 font-bold">Render Job</th>
                  <th className="px-4 py-3 font-bold">Format</th>
                  <th className="px-4 py-3 font-bold">Settings</th>
                  <th className="px-4 py-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {renderHistory.map((job, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-black border border-white/10 flex items-center justify-center p-1" dangerouslySetInnerHTML={{__html: job.svgCode}} />
                        <div>
                          <div className="text-sm text-white font-bold">{job.filename}</div>
                          <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-0.5 font-mono">ID: {job.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-white/5 border border-white/10 rounded font-mono text-[10px] uppercase">{job.format}</span>
                    </td>
                    <td className="px-4 py-3 text-[10px] uppercase tracking-widest text-slate-400 font-mono">
                      {job.resolution} • {job.fps}fps • {job.duration}s
                    </td>
                    <td className="px-4 py-3 text-right">
                      {job.fileUrl && (
                        <a href={job.fileUrl} download className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-orange-600 border border-white/5 hover:border-orange-500/20 text-white rounded text-[10px] uppercase tracking-widest font-bold transition-colors shadow hover:shadow-orange-900/20">
                          <Download className="w-4 h-4" /> Download
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
