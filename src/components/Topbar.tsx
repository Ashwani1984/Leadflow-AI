import React from 'react';
import { Bell, Settings, Search, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface TopbarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onDeploy?: () => void;
  onUpgrade?: () => void;
}

export function Topbar({ activeView, onViewChange, onDeploy, onUpgrade }: TopbarProps) {
  return (
    <header className="h-24 border-b border-white/10 flex items-center justify-between px-10 bg-black/40 backdrop-blur-md fixed top-0 right-0 left-64 z-10">
      <div className="flex items-center gap-10">
        <nav className="flex items-center gap-10">
          {['Dashboard', 'Workflows', 'Leads', 'Automations', 'Analytics'].map((item) => (
            <button
              key={item}
              onClick={() => onViewChange(item)}
              className={cn(
                "text-[11px] uppercase tracking-[0.2em] font-medium transition-colors",
                activeView === item ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-4">
          <button 
            onClick={onUpgrade}
            className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest border border-white/10 rounded-sm text-on-surface hover:bg-white/5 transition-colors"
          >
            Upgrade
          </button>
          <button 
            onClick={() => {
              if (onDeploy) onDeploy();
              const btn = document.activeElement as HTMLButtonElement;
              if (btn) {
                const originalText = btn.innerText;
                btn.innerText = 'DEPLOYING...';
                setTimeout(() => { btn.innerText = originalText; }, 2000);
              }
            }}
            className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest bg-primary text-black rounded-sm hover:brightness-110 transition-colors"
          >
            Deploy AI
          </button>
        </div>
        
        <div className="flex items-center gap-6 ml-4 pl-6 border-l border-white/10">
          <div className="text-right hidden md:block">
            <p className="text-[9px] uppercase tracking-wider text-on-surface-variant">Membership</p>
            <p className="text-sm font-serif italic text-primary">Elite Onyx</p>
          </div>
          <div className="w-12 h-12 rounded-full border border-white/20 bg-gradient-to-b from-gray-700 to-gray-900 overflow-hidden">
             <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" 
                className="w-full h-full object-cover opacity-80"
                alt="User"
              />
          </div>
        </div>
      </div>
    </header>
  );
}
