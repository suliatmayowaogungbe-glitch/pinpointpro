
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { WindowState, UserPreferences, IndicatorStyle, TabData } from './types';
import { Pin, PinOff } from 'lucide-react';

interface Props {
  window: WindowState;
  isActive: boolean;
  focusMode: boolean;
  preferences: UserPreferences;
  focusTimerActive: boolean;
  onActivate: () => void;
  onMove: (x: number, y: number) => void;
  onTogglePin: (timer?: number) => void;
  onUpdateOpacity: (opacity: number) => void;
  onDetachTab: (tabId: string) => void;
  onSwitchTab?: (tabId: string) => void;
  onUpdateTabCategory?: (tabId: string, category: string) => void;
  onAddTab?: () => void;
  onCloseTab?: (tabId: string) => void;
  onGenerateGlance: () => void;
  onGenerateCanvas?: (id: string, prompt: string) => void;
  onApplyWallpaper?: (imageUrl: string) => void;
  onSmartStack?: (id: string) => void;
  onDroppedOn?: (targetId: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const TabStack: React.FC<{
  tabs: TabData[];
  onSwitch: (id: string) => void;
  onAdd: () => void;
  onClose: (id: string) => void;
  onUpdateCategory: (id: string, cat: string) => void;
  onSmartStack: () => void;
  isMobile?: boolean;
}> = ({ tabs, onSwitch, onAdd, onClose, onUpdateCategory, onSmartStack, isMobile }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contextTabId, setContextTabId] = useState<string | null>(null);

  // Group tabs by category
  const groups = useMemo(() => {
    const map: Record<string, TabData[]> = {};
    tabs.forEach(t => {
      const cat = t.category || 'General';
      if (!map[cat]) map[cat] = [];
      map[cat].push(t);
    });
    return Object.entries(map);
  }, [tabs]);

  const handleTabContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextTabId(tabId);
  };

  return (
    <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
      <div className="flex items-center space-x-2 relative overflow-visible">
        {/* Visual Stack Indicator - Overlapping grouped view */}
        <div 
          className="relative h-8 flex items-center group/stack cursor-pointer overflow-visible"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {groups.map(([category, catTabs], groupIdx) => (
            <div 
              key={category} 
              className="relative h-8 flex items-center -ml-2 first:ml-0"
              style={{ zIndex: 10 - groupIdx }}
            >
              {catTabs.slice(0, 3).map((tab, i) => (
                <div 
                  key={tab.id}
                  onContextMenu={(e) => handleTabContextMenu(e, tab.id)}
                  className={`absolute h-6 w-24 rounded-lg border border-white/10 glass transition-all duration-500 shadow-xl flex items-center px-2 overflow-hidden ${tab.isActive ? 'border-blue-500/50 z-20' : 'z-10'}`}
                  style={{
                    left: `${i * 4}px`,
                    transform: `scale(${1 - i * 0.05})`,
                    opacity: 1 - i * 0.3,
                    boxShadow: tab.isActive ? '0 0 15px rgba(59, 130, 246, 0.2)' : 'none'
                  }}
                >
                  <span className={`text-[8px] font-black uppercase tracking-tight truncate ${tab.isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                    {tab.title}
                  </span>
                </div>
              ))}
              <div className="w-24 h-8" /> {/* Spacer for group */}
            </div>
          ))}
          {groups.length === 0 && <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">No Active Surfaces</span>}
        </div>
        
        <button 
          onClick={onSmartStack}
          className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors p-1"
          title="AI Smart Stack"
        >
          ✨
        </button>
      </div>

      <button onClick={onAdd} className="w-6 h-6 flex items-center justify-center rounded-md bg-white/5 text-slate-500 hover:text-white transition-all">+</button>

      {/* Expanded Tab Overlay - Fanned out expansion */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-[500] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-12"
          onClick={() => setIsExpanded(false)}
        >
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            {groups.map(([category, catTabs]) => (
              <div key={category} className="space-y-3">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">{category}</h3>
                   <span className="text-[8px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full">{catTabs.length}</span>
                </div>
                {catTabs.map(tab => (
                  <div 
                    key={tab.id}
                    onClick={() => { onSwitch(tab.id); setIsExpanded(false); }}
                    className={`glass p-4 rounded-2xl border transition-all cursor-pointer group/card ${tab.isActive ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`text-xs font-bold ${tab.isActive ? 'text-white' : 'text-slate-400 group-hover/card:text-white'}`}>{tab.title}</h4>
                        <p className="text-[9px] text-slate-600 mt-1 truncate">{tab.url}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
                        className="opacity-0 group-hover/card:opacity-100 text-slate-600 hover:text-red-400 transition-all ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Context Menu - Manual Stacking */}
      {contextTabId && (
        <div 
          className="fixed inset-0 z-[600]"
          onClick={() => setContextTabId(null)}
          onContextMenu={(e) => { e.preventDefault(); setContextTabId(null); }}
        >
          <div 
            className="absolute glass border border-white/10 shadow-2xl rounded-xl py-2 w-44 text-[9px] font-black uppercase tracking-widest overflow-hidden animate-in zoom-in-95 duration-100"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <div className="px-4 py-2 text-slate-500 border-b border-white/5">Stack Surface</div>
            {['General', 'Research', 'Dev Docs', 'Design', 'Social'].map(cat => (
              <button 
                key={cat}
                className="w-full text-left px-4 py-2.5 hover:bg-white/10 transition-colors"
                onClick={() => { onUpdateCategory(contextTabId, cat); setContextTabId(null); }}
              >
                Move to {cat}
              </button>
            ))}
            <div className="h-px bg-white/5 mx-2 my-1" />
            <button 
              className="w-full text-left px-4 py-2.5 hover:bg-red-500/10 text-red-400 transition-colors"
              onClick={() => { onClose(contextTabId); setContextTabId(null); }}
            >
              Move to Vault
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Window: React.FC<Props> = ({ 
  window: win, 
  isActive, 
  focusMode, 
  preferences, 
  focusTimerActive,
  onActivate, 
  onMove, 
  onTogglePin,
  onUpdateOpacity,
  onDetachTab,
  onSwitchTab,
  onUpdateTabCategory,
  onAddTab,
  onCloseTab,
  onGenerateGlance,
  onGenerateCanvas,
  onApplyWallpaper,
  onSmartStack,
  onDroppedOn,
  isMobile,
  onClose,
  onToggleCollapse,
  onDragStart,
  onDragEnd
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [canvasPrompt, setCanvasPrompt] = useState(win.canvasData?.prompt || '');
  const windowRef = useRef<HTMLDivElement>(null);

  const activeTab = win.tabs?.find(t => t.isActive);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;
    e.stopPropagation();
    onActivate();
    
    const target = e.target as HTMLElement;
    if (target.closest('.window-title-bar')) {
      setIsDragging(true);
      onDragStart?.();
      setDragOffset({
        x: e.clientX - win.x,
        y: e.clientY - win.y,
      });
    }
  };

  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onMove(e.clientX - dragOffset.x, e.clientY - dragOffset.y);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging && onDroppedOn) {
        const target = document.elementFromPoint(e.clientX, e.clientY);
        const targetWindow = target?.closest('.glass');
        if (targetWindow) {
          const targetId = targetWindow.getAttribute('data-window-id');
          if (targetId && targetId !== win.id) {
            onDroppedOn(targetId);
          }
        }
      }
      setIsDragging(false);
      onDragEnd?.();
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, onMove, onDroppedOn, win.id, isMobile, onDragEnd]);

  const isInteracting = isHovered || isActive || isDragging;
  const shouldGhost = !isMobile && preferences.ghostingEnabled && win.isPinned && !isInteracting;
  
  const zenStageOpacity = focusMode && !win.isPinned ? 0.05 : win.opacity;
  const ghostOpacity = preferences.minOpacity; 
  const finalOpacity = shouldGhost ? ghostOpacity : zenStageOpacity;

  const zenStageBlur = focusMode && !win.isPinned ? 'blur(15px)' : 'none';
  const ghostFilter = shouldGhost ? 'grayscale(1) brightness(0.5)' : 'none';

  const auraClass = (focusTimerActive && win.isPinned && preferences.indicatorStyle === IndicatorStyle.COLORED_GLOW) ? 'aura-pulse' : '';

  const mobileStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    minHeight: win.isCollapsed ? '48px' : '300px',
    height: win.isCollapsed ? '48px' : 'auto',
    marginBottom: '1rem',
    left: 0,
    top: 0,
    zIndex: 10,
    transform: 'none'
  };

  const desktopStyles: React.CSSProperties = {
    position: 'absolute',
    left: win.x,
    top: win.y,
    width: win.width,
    height: win.isCollapsed ? (isMobile ? 48 : 40) : win.height,
    zIndex: win.isPinned ? 100 : (isActive ? 50 : 10),
    transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
    boxShadow: (preferences.indicatorStyle === IndicatorStyle.COLORED_GLOW && win.isPinned) 
      ? `0 0 30px ${preferences.accentColor}${shouldGhost ? '05' : '15'}` 
      : (isActive ? '0 30px 60px rgba(0,0,0,0.6)' : '0 10px 30px rgba(0,0,0,0.2)'),
  };

  const handleCanvasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canvasPrompt.trim() && onGenerateCanvas) {
      onGenerateCanvas(win.id, canvasPrompt);
    }
  };

  const handleDownload = () => {
    if (win.canvasData?.imageUrl) {
      const link = document.createElement('a');
      link.href = win.canvasData.imageUrl;
      link.download = `pinpoint-canvas-${Date.now()}.png`;
      link.click();
    }
  };

  return (
    <div
      ref={windowRef}
      data-window-id={win.id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...(isMobile ? mobileStyles : desktopStyles),
        opacity: finalOpacity,
        filter: `${zenStageBlur} ${ghostFilter}`,
        borderColor: (win.isPinned && preferences.indicatorStyle === IndicatorStyle.SUBTLE_BORDER)
          ? `${preferences.accentColor}cc`
          : undefined,
        borderWidth: (win.isPinned && preferences.indicatorStyle === IndicatorStyle.SUBTLE_BORDER)
          ? '1.5px'
          : undefined,
      }}
      className={`flex flex-col rounded-2xl overflow-hidden border glass ${isDragging ? 'scale-[1.005] cursor-grabbing' : 'cursor-default'} ${auraClass}`}
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowContextMenu(true);
      }}
    >
      {/* Title Bar */}
      <div 
        onDoubleClick={(e) => { e.stopPropagation(); onToggleCollapse?.(); }}
        className={`window-title-bar ${isMobile ? 'h-12' : 'h-10'} flex items-center justify-between px-4 shrink-0 select-none group/bar relative cursor-pointer`}
      >
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5 items-center">
            <button 
              onClick={(e) => { e.stopPropagation(); onClose?.(); }}
              className="w-2.5 h-2.5 rounded-full bg-white/10 group-hover/bar:bg-red-500 hover:scale-125 transition-all cursor-pointer" 
              title="Close Surface"
            />
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleCollapse?.(); }}
              className={`w-2.5 h-2.5 rounded-full ${win.isCollapsed ? 'bg-yellow-500/80 animate-pulse' : 'bg-white/10 group-hover/bar:bg-yellow-500'} hover:scale-125 transition-all cursor-pointer`}
              title={win.isCollapsed ? "Expand Surface" : "Collapse Surface"}
            />
            <button 
              onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
              className={`w-2.5 h-2.5 rounded-full ${win.isPinned ? 'bg-green-500/80' : 'bg-white/10 group-hover/bar:bg-green-500'} hover:scale-125 transition-all cursor-pointer`}
              title="Pin Surface"
            />
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-500'} flex items-center space-x-1.5`}>
            <span>{win.type === 'canvas' ? '🎨 Creative Canvas' : (win.type === 'browser' && activeTab ? activeTab.title : win.title)}</span>
            {win.isCollapsed && <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full font-mono normal-case tracking-normal">Collapsed</span>}
            {win.isPinned && preferences.indicatorStyle === IndicatorStyle.PIN_ICON && (
              <span className="flex items-center space-x-1 text-[8px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold tracking-normal normal-case animate-in fade-in zoom-in-95 duration-200">
                <Pin className="w-2 h-2 fill-blue-400" />
                <span>Pinned</span>
              </span>
            )}
          </span>
        </div>
        
        <div className={`flex items-center space-x-1 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover/bar:opacity-100 transition-opacity'}`}>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleCollapse?.(); }} 
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors text-slate-500 hover:text-white ${win.isCollapsed ? 'text-yellow-400 bg-yellow-500/10' : ''}`}
            title={win.isCollapsed ? "Expand" : "Collapse"}
          >
            {win.isCollapsed ? '🔽' : '🔼'}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onTogglePin(); }} 
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${win.isPinned ? 'text-blue-400 bg-blue-500/10' : 'text-slate-500 hover:text-white'}`}
            title={win.isPinned ? "Unpin Surface" : "Pin Surface"}
          >
            <Pin className={`w-3.5 h-3.5 transition-transform duration-300 ${win.isPinned ? 'fill-blue-400 text-blue-400' : 'text-slate-500 rotate-45'}`} />
          </button>
        </div>
      </div>

      {/* Tab Stack Rail */}
      {win.type === 'browser' && win.tabs && win.tabs.length > 0 && (
        <TabStack 
          tabs={win.tabs} 
          onSwitch={onSwitchTab || (() => {})} 
          onAdd={onAddTab || (() => {})} 
          onClose={onCloseTab || (() => {})}
          onUpdateCategory={(tabId, cat) => onUpdateTabCategory?.(tabId, cat)}
          onSmartStack={() => onSmartStack?.(win.id)}
          isMobile={isMobile}
        />
      )}

      {/* Content Area */}
      <div className={`flex-1 relative overflow-hidden bg-slate-900/40`}>
        {win.type === 'canvas' ? (
          <div className="w-full h-full relative flex flex-col">
            {win.canvasData?.imageUrl ? (
              <img src={win.canvasData.imageUrl} className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-700" alt="Generated Canvas" />
            ) : (
              <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                <span className="text-[40px] opacity-20">🎨</span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
            
            <div className="relative mt-auto p-4 z-10 flex flex-col space-y-3">
              {win.canvasData?.imageUrl && !win.canvasData.isGenerating && (
                <div className="flex space-x-2 animate-in slide-in-from-bottom-2">
                  <button 
                    onClick={() => onApplyWallpaper?.(win.canvasData!.imageUrl!)}
                    className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-lg py-2 text-[9px] font-black uppercase tracking-widest text-white transition-all flex items-center justify-center space-x-2"
                  >
                    <span>✨</span>
                    <span>Apply Atmosphere</span>
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="w-10 h-9 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg flex items-center justify-center transition-all"
                    title="Download Scene"
                  >
                    📥
                  </button>
                </div>
              )}

              <form onSubmit={handleCanvasSubmit} className="flex flex-col space-y-2">
                <textarea 
                  value={canvasPrompt}
                  onChange={(e) => setCanvasPrompt(e.target.value)}
                  placeholder="Describe your vision..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                  rows={2}
                />
                <button 
                  type="submit"
                  disabled={win.canvasData?.isGenerating}
                  className={`w-full py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all ${win.canvasData?.isGenerating ? 'bg-slate-800 text-slate-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                >
                  {win.canvasData?.isGenerating ? 'Synthesizing...' : (win.canvasData?.imageUrl ? 'Evolve Scene' : 'Generate Aura')}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className={`w-full h-full ${isMobile ? 'p-4' : 'p-5'} text-slate-300 font-medium leading-relaxed`}>
            {win.type === 'browser' && activeTab ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-white/5 overflow-hidden">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <span className="text-[9px] text-slate-500 shrink-0">HTTPS://</span>
                    <span className="text-[9px] text-blue-400 font-mono tracking-tighter truncate">{activeTab.url}</span>
                  </div>
                  {activeTab.category && (
                    <span className="text-[7px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded shrink-0">
                      {activeTab.category}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 leading-relaxed italic">
                  {win.content}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">{win.content}</div>
            )}
          </div>
        )}
      </div>

      {showContextMenu && !isMobile && (
        <div className="fixed inset-0 z-[200]" onClick={() => setShowContextMenu(false)}>
          <div 
            style={{ 
              left: Math.min(window.innerWidth - 200, win.x + 20), 
              top: Math.min(window.innerHeight - 250, win.y + 20) 
            }} 
            className="absolute glass border border-white/10 shadow-2xl rounded-2xl py-2 w-48 text-[10px] text-white font-bold uppercase tracking-widest overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <button 
              className="w-full text-left px-5 py-3 hover:bg-white/10 transition-colors" 
              onClick={(e) => { e.stopPropagation(); onTogglePin(); setShowContextMenu(false); }}
            >
              {win.isPinned ? 'Unpin Surface' : 'Pin to Surface'}
            </button>
            <div className="h-px bg-white/5 mx-3 my-1" />
            <div className="px-5 py-2 text-[8px] text-slate-500">Surface Opacity</div>
            <div className="flex px-4 pb-2 space-x-1">
              {[1.0, 0.8, 0.6, 0.4].map(level => (
                <button
                  key={level}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateOpacity(level);
                    setShowContextMenu(false);
                  }}
                  className={`flex-1 py-1.5 rounded transition-all text-[9px] font-black ${win.opacity === level ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                >
                  {level * 100}%
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Window;
