import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  LayoutDashboard, 
  GitBranch, 
  Workflow, 
  Database, 
  Key, 
  FileText, 
  HelpCircle, 
  LifeBuoy, 
  Plus,
  Box,
  CheckSquare,
  Mic,
  PieChart as PieIcon
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', active: false },
  { icon: PieIcon, label: 'Analytics', active: false },
  { icon: Mic, label: 'AI Call Agents', active: false },
  { icon: GitBranch, label: 'Automation Builder', active: false },
  { icon: CheckSquare, label: 'Tasks', active: false },
  { icon: Workflow, label: 'Lead Pipeline', active: true },
  { icon: Database, label: 'Data Sources', active: false },
  { icon: Key, label: 'API Keys', active: false },
  { icon: FileText, label: 'Audit Logs', active: false },
];

const footerItems = [
  { icon: FileText, label: 'Documentation' },
  { icon: LifeBuoy, label: 'Support' },
];

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-64 h-screen glass-sidebar flex flex-col pt-6 pb-8 px-4 fixed left-0 top-0 z-50">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 border border-primary rounded-full flex items-center justify-center shrink-0">
          <span className="text-primary font-serif text-xl italic">L</span>
        </div>
        <div>
          <h1 className="text-base font-serif tracking-widest uppercase text-on-surface">LEADFLOW</h1>
          <p className="text-[9px] text-primary font-medium tracking-[0.2em] uppercase">Private Client Group</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onViewChange(item.label)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 transition-colors group",
              activeView === item.label 
                ? "text-primary border-r-2 border-primary" 
                : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
            )}
          >
            <item.icon className={cn("w-5 h-5", activeView === item.label ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface")} />
            <span className={cn("text-[11px] uppercase tracking-widest font-medium", activeView === item.label && "text-primary")}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-6">
        <div className="space-y-2 px-1">
          {footerItems.map((item) => (
             <button
              key={item.label}
              onClick={() => onViewChange(item.label)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-1 transition-colors",
                activeView === item.label ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <item.icon className={cn("w-4 h-4", activeView === item.label && "text-primary")} />
              <span className="text-[10px] uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>

        <button 
          onClick={() => onViewChange('Automation Builder')}
          className="w-full bg-primary text-on-primary py-3 rounded-sm flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-[0.2em] transition-all hover:brightness-110 shadow-lg shadow-black/50"
        >
          <Plus className="w-4 h-4" />
          New Workflow
        </button>
      </div>
    </aside>
  );
}
