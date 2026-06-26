
import React, { useState, useEffect, useRef } from 'react';
import { WindowState } from './types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  windows: WindowState[];
  onSelect: (windowId: string) => void;
  onClose: () => void;
}

const GhostSearch: React.FC<Props> = ({ windows, onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string, title: string, relevance: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Corrected GoogleGenAI initialization to follow guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = windows.map(w => `ID: ${w.id}, Title: ${w.title}, Content: ${w.content}`).join('\n---\n');
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `I have several open windows with this content:
        ${context}
        
        The user is searching for: "${query}"
        
        Analyze which windows are most relevant. Return a valid JSON array of objects with "id" and "relevance" (a 5-word summary of why it's relevant). Only return the JSON.`,
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(response.text || '[]');
      const resultsWithTitles = parsed.map((res: any) => ({
        ...res,
        title: windows.find(w => w.id === res.id)?.title || 'Unknown Window'
      }));
      setResults(resultsWithTitles);
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-32 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full max-w-xl glass rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-top-4"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSearch} className="p-6 border-b border-white/5">
          <div className="flex items-center space-x-4">
            <span className="text-xl opacity-40">🔍</span>
            <input 
              ref={inputRef}
              type="text" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search across your workspace..."
              className="flex-1 bg-transparent border-none outline-none text-lg font-medium placeholder:text-slate-600"
            />
            {loading && <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />}
          </div>
        </form>

        <div className="max-h-96 overflow-auto py-2 no-scrollbar">
          {results.length > 0 ? (
            results.map(res => (
              <button 
                key={res.id}
                onClick={() => onSelect(res.id)}
                className="w-full text-left px-6 py-4 hover:bg-white/5 flex items-center justify-between group transition-colors"
              >
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">{res.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">{res.relevance}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-600 group-hover:text-white transition-colors">Select ↵</span>
              </button>
            ))
          ) : query && !loading ? (
            <div className="px-6 py-8 text-center text-slate-500 italic text-xs">
              Press Enter to ask AI to find it...
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold">
              Ghost Search active
            </div>
          )}
        </div>

        <div className="bg-white/[0.02] px-6 py-3 border-t border-white/5 flex justify-between items-center">
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Powered by Gemini Contextual Engine</span>
          <span className="text-[9px] font-bold text-slate-600">ESC to cancel</span>
        </div>
      </div>
    </div>
  );
};

export default GhostSearch;
