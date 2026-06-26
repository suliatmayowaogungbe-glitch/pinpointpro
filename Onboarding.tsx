
import React, { useState } from 'react';
import { IndicatorStyle, UserPreferences } from './types';
import { Pin } from 'lucide-react';

interface Props {
  onComplete: () => void;
  preferences: UserPreferences;
  setPreferences: (p: UserPreferences) => void;
}

const Onboarding: React.FC<Props> = ({ onComplete, preferences, setPreferences }) => {
  const [step, setStep] = useState(1);

  const next = () => setStep(s => s + 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800 border border-white/10 mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Open Source</span>
              <div className="w-1 h-1 rounded-full bg-slate-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">v1.0.0-beta</span>
            </div>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6 shadow-lg shadow-blue-500/5 animate-pulse">
              <Pin className="w-10 h-10 rotate-45" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Welcome to PinPoint Pro</h1>
            <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">Pin anything, stay focused. Elevate your productivity with context-aware window management.</p>
            <button 
              onClick={next}
              className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105 shadow-xl shadow-blue-600/20"
            >
              Get Started
            </button>
          </div>
        );
      case 2:
        return (
          <div className="max-w-md w-full animate-in slide-in-from-right duration-500">
            <h2 className="text-3xl font-bold mb-6 text-center">Quick Setup</h2>
            <div className="space-y-4">
              <div 
                className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all duration-300 shadow-xl relative group"
                onClick={next}
              >
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <h3 className="font-bold text-lg mb-1 text-slate-200 group-hover:text-blue-400 transition-colors">Use suggested shortcuts</h3>
                <p className="text-slate-400 text-xs mb-4">Optimized for Apple keyboards and macOS power users.</p>
                
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
                  <div className="flex flex-col space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pin Surface</span>
                    <div className="flex items-center space-x-1">
                      <kbd className="inline-flex items-center justify-center w-6 h-6 bg-slate-950 border border-white/10 rounded-md text-xs font-medium text-slate-300 shadow-md">⌘</kbd>
                      <span className="text-slate-600 font-bold text-xs">+</span>
                      <kbd className="inline-flex items-center justify-center w-6 h-6 bg-slate-950 border border-white/10 rounded-md text-xs font-mono text-slate-300 shadow-md">P</kbd>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ghost Search</span>
                    <div className="flex items-center space-x-1">
                      <kbd className="inline-flex items-center justify-center w-6 h-6 bg-slate-950 border border-white/10 rounded-md text-xs font-medium text-slate-300 shadow-md">⌘</kbd>
                      <span className="text-slate-600 font-bold text-xs">+</span>
                      <kbd className="inline-flex items-center justify-center w-6 h-6 bg-slate-950 border border-white/10 rounded-md text-xs font-mono text-slate-300 shadow-md">K</kbd>
                    </div>
                  </div>
                </div>
              </div>
              <div 
                className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all duration-300 shadow-xl group"
                onClick={next}
              >
                <h3 className="font-bold text-lg mb-1 text-slate-200 group-hover:text-white transition-colors">Customize my shortcuts</h3>
                <p className="text-slate-400 text-xs mb-4">Fine-tune keys to match your existing muscle memory.</p>
                
                <div className="flex items-center space-x-1.5 pt-2 border-t border-slate-800/60">
                  <kbd className="inline-flex items-center justify-center w-6 h-6 bg-slate-950 border border-white/5 rounded-md text-[10px] font-medium text-slate-500 shadow-sm">⌥</kbd>
                  <kbd className="inline-flex items-center justify-center w-6 h-6 bg-slate-950 border border-white/5 rounded-md text-[10px] font-medium text-slate-500 shadow-sm">⇧</kbd>
                  <kbd className="inline-flex items-center justify-center w-6 h-6 bg-slate-950 border border-white/5 rounded-md text-[10px] font-medium text-slate-500 shadow-sm">⌃</kbd>
                  <kbd className="inline-flex items-center justify-center px-2 h-6 bg-slate-950 border border-white/5 rounded-md text-[10px] font-mono text-slate-500 shadow-sm">Key</kbd>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold mb-4">You're all set!</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-sm mx-auto">
              PinPoint is now your new digital surface. Drag windows into folders to organize, or use the AI Assistant to clean up.
            </p>
            <div className="flex flex-col items-center space-y-4">
              <button 
                onClick={onComplete}
                className="bg-blue-600 hover:bg-blue-500 px-12 py-4 rounded-full font-black uppercase tracking-widest text-xs transition-all transform hover:scale-105 shadow-2xl shadow-blue-600/30"
              >
                Enter Workspace
              </button>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Proudly Open Source • MIT License</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950 p-6">
      <div className="mesh-blob w-[800px] h-[800px] top-[-200px] left-[-200px] opacity-10 bg-blue-500" />
      <div className="mesh-blob w-[600px] h-[600px] bottom-[-100px] right-[-100px] opacity-10 bg-purple-500" />
      {renderStep()}
    </div>
  );
};

export default Onboarding;
