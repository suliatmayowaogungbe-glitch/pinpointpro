
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { WindowState } from './types';

interface Props {
  windows: WindowState[];
  onApplyLayout: (layouts: any[]) => void;
  onCategorize: (groups: { category: string, tabIds: string[] }[]) => void;
  onSyncTabs?: () => void;
  onCleanDesktop?: () => void;
  onClose: () => void;
  isMobile?: boolean;
}

const SmartAssistant: React.FC<Props> = ({ windows, onApplyLayout, onCategorize, onSyncTabs, onCleanDesktop, onClose, isMobile }) => {
  const [goal, setGoal] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const openGitHub = () => {
    window.open('https://github.com', '_blank');
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await onSyncTabs?.();
    setTimeout(() => setIsSyncing(false), 800);
  };

  const containerClasses = isMobile 
    ? "fixed inset-0 bg-slate-900 z-[200] p-6 flex flex-col"
    : "fixed top-8 right-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 z-[100] p-6 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col";

  return (
    <div className={containerClasses}>
      <div className="flex justify-between items-center mb-8 shrink-0">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="text-blue-500 animate-pulse">✨</span>
          Assistant
        </h2>
        <button onClick={onClose} className="text-slate-500 hover:text-white text-3xl md:text-xl transition-colors">&times;</button>
      </div>

      <div className="flex-1 overflow-auto no-scrollbar space-y-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Contextual Intent</p>
          <textarea 
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What's your current goal?"
            className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500 transition-colors mb-4 resize-none placeholder:text-slate-600"
          />
        </div>

        {/* Surface Usage Tracker */}
        <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Surface Usage Frequency</p>
            <span className="text-[8px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">Realtime</span>
          </div>
          <div className="space-y-2 max-h-40 overflow-auto pr-1 no-scrollbar">
            {windows.filter(w => !w.isClosed).length === 0 ? (
              <p className="text-[10px] text-slate-600 italic">No active surfaces on desktop.</p>
            ) : (
              [...windows]
                .filter(w => !w.isClosed)
                .sort((a, b) => (b.focusCount || 0) - (a.focusCount || 0))
                .map(w => {
                  const count = w.focusCount || 0;
                  return (
                    <div key={w.id} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-800/60 border border-slate-700/30">
                      <span className="truncate max-w-[120px] font-medium text-slate-300">{w.title}</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[9px] text-slate-400 font-mono">{count} focus{count === 1 ? '' : 'es'}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${count > 5 ? 'bg-blue-500 animate-pulse' : count > 2 ? 'bg-indigo-400' : 'bg-slate-600'}`} />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border border-blue-500/20 hover:bg-blue-500/10 transition-all flex items-center justify-center space-x-2 ${isSyncing ? 'opacity-50' : 'text-blue-400'}`}
          >
            <span>{isSyncing ? '⌛' : '🔄'}</span>
            <span>Sync Browser Tabs</span>
          </button>

          <button
            onClick={() => onCleanDesktop?.()}
            className="w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <span>🧹</span>
            <span>Desktop Tidy</span>
          </button>

          <button
            className="w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] bg-slate-800 border border-slate-700 hover:bg-slate-750 transition-all flex items-center justify-center space-x-2"
          >
            <span>🚀</span>
            <span>Arrange Screen</span>
          </button>
        </div>
      </div>

      <div className="pt-6 border-t border-white/5 mt-auto shrink-0 pb-20 md:pb-0">
        <button 
          onClick={openGitHub}
          className="w-full py-4 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition-all uppercase tracking-widest flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          <span>Open Source Core</span>
        </button>
      </div>
    </div>
  );
};

export default SmartAssistant;
