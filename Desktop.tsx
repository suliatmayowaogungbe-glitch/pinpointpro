
import React, { useMemo, useState } from 'react';
import { WindowState, UserPreferences, ColorTheme, TodoItem, Priority } from './types';
import Window from './Window';
import Affirmations from './Affirmations';
import FocusTaskBoard from './FocusTaskBoard';
import DesktopFolder from './DesktopFolder';

interface Props {
  windows: WindowState[];
  todos: TodoItem[];
  activeWindowId: string | null;
  focusMode: boolean;
  preferences: UserPreferences;
  focusTimerActive: boolean;
  setActiveWindowId: (id: string | null) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  togglePin: (id: string) => void;
  updateWindowOpacity: (id: string, opacity: number) => void;
  onDetachTab: (windowId: string, tabId: string) => void;
  onSwitchTab?: (windowId: string, tabId: string) => void;
  onUpdateTabCategory?: (windowId: string, tabId: string, category: string) => void;
  onAddTab?: (windowId: string) => void;
  onCloseTab?: (windowId: string, tabId: string) => void;
  onGenerateGlance: (id: string) => void;
  onGenerateCanvas?: (id: string, prompt: string) => void;
  onApplyWallpaper?: (imageUrl: string) => void;
  onSmartStack?: (id: string) => void;
  onToggleTodo: (id: string) => void;
  onAddTodo: (text: string, priority: Priority) => void;
  onDeleteTodo: (id: string) => void;
  onGroupWindows: (sourceId: string, targetId: string) => void;
  onRemoveFromFolder: (id: string) => void;
  isMobile: boolean;
  globalWallpaper: string | null;
  onCloseWindow?: (id: string) => void;
  onSnapWindow?: (id: string, snapType: 'left' | 'right' | 'top' | 'bottom' | 'none') => void;
  onToggleCollapseWindow?: (id: string) => void;
}

const Desktop: React.FC<Props> = ({ 
  windows, 
  todos,
  activeWindowId, 
  focusMode, 
  preferences, 
  focusTimerActive,
  setActiveWindowId, 
  updateWindowPosition,
  togglePin,
  updateWindowOpacity,
  onDetachTab,
  onSwitchTab,
  onUpdateTabCategory,
  onAddTab,
  onCloseTab,
  onGenerateGlance,
  onGenerateCanvas,
  onApplyWallpaper,
  onSmartStack,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  onGroupWindows,
  onRemoveFromFolder,
  isMobile,
  globalWallpaper,
  onCloseWindow,
  onSnapWindow,
  onToggleCollapseWindow
}) => {
  const [draggedWindowId, setDraggedWindowId] = useState<string | null>(null);

  const desktopItems = useMemo(() => {
    return windows.filter(w => !w.parentId && !w.isClosed);
  }, [windows]);

  const activeDraggedWindow = useMemo(() => {
    return windows.find(w => w.id === draggedWindowId);
  }, [windows, draggedWindowId]);

  const activeSnapZone = useMemo(() => {
    if (!activeDraggedWindow || isMobile || preferences.snapZonesEnabled === false) return 'none';
    
    const threshold = 60;
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (activeDraggedWindow.x < threshold) {
      return 'left';
    }
    if (activeDraggedWindow.x + activeDraggedWindow.width > width - threshold) {
      return 'right';
    }
    if (activeDraggedWindow.y < threshold + 32) {
      return 'top';
    }
    if (activeDraggedWindow.y + activeDraggedWindow.height > height - threshold) {
      return 'bottom';
    }
    return 'none';
  }, [activeDraggedWindow, isMobile]);

  const handleDragEnd = (id: string) => {
    if (activeSnapZone !== 'none' && onSnapWindow) {
      onSnapWindow(id, activeSnapZone);
    }
    setDraggedWindowId(null);
  };

  const sortedItems = [...desktopItems].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return 1;
    if (!a.isPinned && b.isPinned) return -1;
    if (a.id === activeWindowId) return 1;
    if (b.id === activeWindowId) return -1;
    return 0;
  });

  const themeColors = useMemo(() => {
    const t = preferences.colorTheme;
    const colors: Record<ColorTheme, string[]> = {
      nebula: ['#3b82f6', '#9333ea', '#6366f1', '#ec4899'],
      sunrise: ['#f97316', '#ef4444', '#f59e0b', '#db2777'],
      ocean: ['#06b6d4', '#0891b2', '#10b981', '#3b82f6'],
      emerald: ['#10b981', '#059669', '#84cc16', '#06b6d4'],
    };
    return colors[t];
  }, [preferences.colorTheme]);

  return (
    <div 
      className={`w-full h-full pt-8 relative bg-slate-950 ${isMobile ? 'overflow-y-auto no-scrollbar pb-24' : 'overflow-hidden'}`}
      onClick={() => setActiveWindowId(null)}
      style={{
        '--accent-1': themeColors[0],
        '--accent-2': themeColors[1],
        '--accent-3': themeColors[2],
      } as React.CSSProperties}
    >
      {/* Dynamic Background Layer */}
      {globalWallpaper ? (
        <div 
          className="absolute inset-0 z-0 animate-in fade-in duration-1000"
          style={{
            backgroundImage: `url(${globalWallpaper})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(40px) brightness(0.4)',
            opacity: focusMode ? 0.3 : 0.6,
            transform: 'scale(1.1)'
          }}
        />
      ) : (
        <>
          <div className={`mesh-blob ${isMobile ? 'w-[300px] h-[300px]' : 'w-[600px] h-[600px]'} top-[-100px] left-[-100px]`} style={{ animationDelay: '0s', backgroundColor: themeColors[0] }} />
          <div className={`mesh-blob ${isMobile ? 'w-[400px] h-[400px]' : 'w-[800px] h-[800px]'} bottom-[-200px] right-[-100px]`} style={{ animationDelay: '-5s', backgroundColor: themeColors[1] }} />
        </>
      )}

      {!isMobile && <Affirmations />}

      <div className={`relative z-20 w-full h-full flex ${isMobile ? 'flex-col p-4 space-y-8' : ''}`}>
        {!focusMode && (
          <div className={isMobile ? 'w-full' : 'w-72'}>
            <FocusTaskBoard todos={todos} onToggleTodo={onToggleTodo} onAddTodo={onAddTodo} onDeleteTodo={onDeleteTodo} isMobile={isMobile} />
          </div>
        )}

        <div className={`flex-1 relative ${isMobile ? 'space-y-4' : ''}`}>
          {sortedItems.map(item => (
            item.type === 'folder' ? (
              <DesktopFolder 
                key={item.id}
                folder={item}
                childrenWindows={windows.filter(w => w.parentId === item.id)}
                isActive={activeWindowId === item.id}
                onActivate={() => setActiveWindowId(item.id)}
                onMove={updateWindowPosition}
                onOpenChild={(id) => {
                  onRemoveFromFolder(id);
                  setActiveWindowId(id);
                }}
              />
            ) : (
              <Window 
                key={item.id}
                window={item}
                isActive={item.id === activeWindowId}
                focusMode={focusMode}
                preferences={preferences}
                focusTimerActive={focusTimerActive}
                onActivate={() => setActiveWindowId(item.id)}
                onMove={(x, y) => updateWindowPosition(item.id, x, y)}
                onTogglePin={(timer) => togglePin(item.id)}
                onUpdateOpacity={(o) => updateWindowOpacity(item.id, o)}
                onDetachTab={(tabId) => onDetachTab(item.id, tabId)}
                onSwitchTab={(tabId) => onSwitchTab?.(item.id, tabId)}
                onUpdateTabCategory={(tabId, cat) => onUpdateTabCategory?.(item.id, tabId, cat)}
                onAddTab={() => onAddTab?.(item.id)}
                onCloseTab={(tabId) => onCloseTab?.(item.id, tabId)}
                onGenerateGlance={() => onGenerateGlance(item.id)}
                onGenerateCanvas={onGenerateCanvas}
                onApplyWallpaper={onApplyWallpaper}
                onSmartStack={onSmartStack}
                onDroppedOn={(targetId) => onGroupWindows(item.id, targetId)}
                isMobile={isMobile}
                onClose={() => onCloseWindow?.(item.id)}
                onToggleCollapse={() => onToggleCollapseWindow?.(item.id)}
                onDragStart={() => setDraggedWindowId(item.id)}
                onDragEnd={() => handleDragEnd(item.id)}
              />
            )
          ))}
        </div>
      </div>

      {/* Snap Zone Visual Indicators */}
      {draggedWindowId && activeSnapZone !== 'none' && (
        <div className="absolute inset-0 pointer-events-none z-40 animate-in fade-in duration-200">
          <div 
            className={`absolute transition-all duration-300 ease-out border backdrop-blur-sm shadow-2xl rounded-2xl
              ${activeSnapZone === 'left' ? 'left-4 top-12 bottom-4 w-[calc(50%-1.5rem)]' : ''}
              ${activeSnapZone === 'right' ? 'right-4 top-12 bottom-4 w-[calc(50%-1.5rem)]' : ''}
              ${activeSnapZone === 'top' ? 'left-4 right-4 top-12 h-[calc(100%-4rem)]' : ''}
              ${activeSnapZone === 'bottom' ? 'left-4 right-4 bottom-4 h-[calc(50%-1.5rem)]' : ''}
            `}
            style={{
              backgroundColor: `${themeColors[0]}15`,
              borderColor: `${themeColors[0]}40`,
              boxShadow: `inset 0 0 40px ${themeColors[0]}20, 0 20px 50px rgba(0,0,0,0.5)`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent animate-pulse rounded-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center space-y-2">
              <span className="text-xl md:text-2xl drop-shadow-lg">
                {activeSnapZone === 'left' ? '⬅️' : activeSnapZone === 'right' ? '➡️' : activeSnapZone === 'top' ? '🔼' : '🔽'}
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 drop-shadow-md bg-slate-950/40 px-3 py-1 rounded-full border border-white/5">
                {activeSnapZone === 'top' ? 'Maximize' : `Snap ${activeSnapZone}`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Desktop;
