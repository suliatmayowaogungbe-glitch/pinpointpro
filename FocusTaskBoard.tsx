
import React, { useState } from 'react';
import { TodoItem, Priority } from './types';

interface Props {
  todos: TodoItem[];
  onToggleTodo: (id: string) => void;
  onAddTodo: (text: string, priority: Priority) => void;
  onDeleteTodo: (id: string) => void;
  isMobile?: boolean;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#3b82f6',
  low: '#64748b',
};

const FocusTaskBoard: React.FC<Props> = ({ todos, onToggleTodo, onAddTodo, onDeleteTodo, isMobile }) => {
  const [newText, setNewText] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newText.trim()) {
      onAddTodo(newText, newPriority);
      setNewText('');
    }
  };

  const sortedTodos = [...todos].sort((a, b) => {
    const weights: Record<Priority, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return weights[b.priority] - weights[a.priority];
  });

  return (
    <div className={`${isMobile ? 'w-full px-0' : 'w-72 h-full p-8'} flex flex-col space-y-6 animate-in slide-in-from-left duration-700`}>
      <div>
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">Intentions</h2>
        <div className="h-0.5 w-6 bg-blue-500/40 rounded-full" />
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input 
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add intention..."
          className="w-full bg-transparent border-b border-white/10 py-2 text-xs focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600 font-medium"
        />
        <div className="flex space-x-2 mt-3">
          {(['critical', 'high', 'medium', 'low'] as Priority[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setNewPriority(p)}
              className={`w-3 h-3 rounded-full transition-all ${newPriority === p ? 'scale-125 ring-2 ring-white/20' : 'opacity-20 hover:opacity-100'}`}
              style={{ backgroundColor: PRIORITY_COLORS[p] }}
            />
          ))}
        </div>
      </form>

      <div className={`space-y-4 ${isMobile ? '' : 'flex-1 overflow-auto no-scrollbar pb-10'}`}>
        {sortedTodos.map(todo => {
          const isCritical = todo.priority === 'critical' && !todo.completed;
          
          return (
            <div 
              key={todo.id}
              onClick={() => onToggleTodo(todo.id)}
              className={`relative group cursor-pointer transition-all duration-500 p-2 rounded-lg hover:bg-white/5 ${todo.completed ? 'opacity-20' : 'opacity-100'}`}
            >
              <div className="flex items-start space-x-3">
                <div 
                  className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${isCritical ? 'animate-pulse' : ''}`} 
                  style={{ backgroundColor: PRIORITY_COLORS[todo.priority] }}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium leading-relaxed ${todo.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                    {todo.text}
                  </p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteTodo(todo.id); }}
                  className={`${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} text-slate-600 hover:text-white transition-opacity`}
                >
                  <span className="text-[12px] md:text-[10px]">✕</span>
                </button>
              </div>
            </div>
          );
        })}
        {sortedTodos.length === 0 && (
          <p className="text-[10px] text-slate-600 italic">No tasks active.</p>
        )}
      </div>
    </div>
  );
};

export default FocusTaskBoard;
