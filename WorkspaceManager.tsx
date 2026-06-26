
import React, { useState } from 'react';
import { Workspace } from './types';

interface Props {
  workspaces: Workspace[];
  onSave: (name: string) => void;
  onRestore: (ws: Workspace) => void;
  onClose: () => void;
}

const WorkspaceManager: React.FC<Props> = ({ workspaces, onSave, onRestore, onClose }) => {
  const [newWsName, setNewWsName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWsName.trim()) {
      onSave(newWsName);
      setNewWsName('');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <span>☁️</span>
            <span>Cloud Workspaces</span>
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl">&times;</button>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          {workspaces.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500 space-y-2 italic">
              <span className="text-3xl">🏜️</span>
              <p>No workspaces saved yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workspaces.map(ws => (
                <div 
                  key={ws.id}
                  className="bg-slate-800/50 border border-slate-800 p-5 rounded-xl flex items-center justify-between group hover:border-slate-600 transition-all"
                >
                  <div>
                    <h3 className="font-bold text-slate-200">{ws.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{ws.windows.length} windows • {ws.windows.filter(w => w.isPinned).length} pinned</p>
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onRestore(ws)}
                      className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                    >
                      Restore
                    </button>
                    <button className="text-slate-500 hover:text-red-400 p-1.5">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-950/40">
          {isSaving ? (
            <form onSubmit={handleSave} className="flex space-x-2 animate-in slide-in-from-bottom-2 duration-200">
              <input 
                autoFocus
                type="text" 
                placeholder="Workspace name..."
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-sm font-bold">Save</button>
              <button type="button" onClick={() => setIsSaving(false)} className="text-slate-500 hover:text-white px-3">✕</button>
            </form>
          ) : (
            <button 
              onClick={() => setIsSaving(true)}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors font-semibold"
            >
              <span>+</span>
              <span>Save Current Layout</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceManager;
