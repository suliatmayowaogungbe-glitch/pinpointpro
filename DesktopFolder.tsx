
import React, { useState, useEffect } from 'react';
import { WindowState } from './types';

interface Props {
  folder: WindowState;
  childrenWindows: WindowState[];
  isActive: boolean;
  onActivate: () => void;
  onMove: (id: string, x: number, y: number) => void;
  onOpenChild: (id: string) => void;
}

const DesktopFolder: React.FC<Props> = ({ folder, childrenWindows, isActive, onActivate, onMove, onOpenChild }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onActivate();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - folder.x,
      y: e.clientY - folder.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) onMove(folder.id, e.clientX - dragOffset.x, e.clientY - dragOffset.y);
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, onMove, folder.id]);

  return (
    <div 
      data-window-id={folder.id}
      style={{
        left: folder.x,
        top: folder.y,
        width: 120,
        height: 120,
        zIndex: isExpanded ? 500 : 5,
        transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      className={`absolute group cursor-pointer glass rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center space-y-2 hover:bg-white/5 active:scale-95 transition-all ${isActive ? 'border-white/20 bg-white/10' : ''}`}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Folder Icon Stack Preview */}
      <div className="relative w-12 h-10">
        <div className="absolute inset-0 bg-blue-500/20 rounded-md rotate-[-5deg] scale-90" />
        <div className="absolute inset-0 bg-blue-500/30 rounded-md rotate-[5deg] scale-95" />
        <div className="absolute inset-0 bg-blue-500/40 rounded-md flex items-center justify-center">
          <span className="text-white text-xs">📁</span>
        </div>
      </div>
      
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center truncate w-full">
        {folder.title}
      </span>
      
      <div className="bg-slate-900/40 px-2 py-0.5 rounded-full border border-white/5">
        <span className="text-[8px] font-bold text-slate-500">{childrenWindows.length} Items</span>
      </div>

      {/* Expanded Grid View */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 backdrop-blur-xl animate-in zoom-in-95 duration-300"
          onMouseDown={(e) => { e.stopPropagation(); setIsExpanded(false); }}
        >
          <div 
            className="w-full max-w-4xl p-12 grid grid-cols-4 gap-8"
            onMouseDown={e => e.stopPropagation()}
          >
            {childrenWindows.map(win => (
              <div 
                key={win.id}
                onClick={() => onOpenChild(win.id)}
                className="glass rounded-3xl p-6 aspect-square flex flex-col items-center justify-center space-y-4 hover:bg-white/10 transition-all cursor-pointer group/item hover:scale-105 active:scale-95 shadow-2xl"
              >
                <div className="text-4xl group-hover/item:scale-110 transition-transform">
                  {win.type === 'browser' ? '🌐' : win.type === 'code' ? '💻' : '📄'}
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">{win.title}</p>
                  <p className="text-[8px] text-slate-500 mt-1 uppercase font-bold">{win.type}</p>
                </div>
              </div>
            ))}
          </div>
          <button 
            className="absolute top-12 right-12 w-12 h-12 glass rounded-full flex items-center justify-center text-xl hover:bg-red-500/20 transition-colors"
            onClick={() => setIsExpanded(false)}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default DesktopFolder;
