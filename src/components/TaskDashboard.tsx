import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Clock, User, Filter, Plus, Calendar, Flag } from 'lucide-react';
import { Task, Lead } from '../types';
import { cn } from '../lib/utils';

interface TaskDashboardProps {
  tasks: Task[];
  leads: Lead[];
  onToggleTask: (id: string) => void;
  onAddTask: () => void;
}

export function TaskDashboard({ tasks, leads, onToggleTask, onAddTask }: TaskDashboardProps) {
  const [filter, setFilter] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  const filteredTasks = tasks.filter(t => filter === 'ALL' || t.status === filter);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif italic text-on-surface">Execution Command</h2>
          <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">
            {tasks.filter(t => t.status !== 'COMPLETED').length} Active Objectives
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-black/20 border border-white/5 rounded-sm p-1">
            {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all",
                  filter === f ? "bg-primary text-black" : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <button 
            onClick={onAddTask}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black text-[10px] font-bold uppercase tracking-widest rounded-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            New Mission
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const lead = leads.find(l => l.id === task.leadId);
            return (
              <motion.div
                layout
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] border border-white/10 rounded-xl p-6 flex items-start gap-6 group hover:border-primary/30 transition-all"
              >
                <button 
                  onClick={() => onToggleTask(task.id)}
                  className="mt-1 transition-transform active:scale-95"
                >
                  {task.status === 'COMPLETED' ? (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  ) : (
                    <Circle className="w-6 h-6 text-on-surface-variant hover:text-primary transition-colors" />
                  )}
                </button>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className={cn(
                      "text-lg font-serif italic transition-all",
                      task.status === 'COMPLETED' ? "text-on-surface-variant line-through" : "text-on-surface"
                    )}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-3">
                       <PriorityBadge priority={task.priority} />
                       <StatusBadge status={task.status} />
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{task.description}</p>
                  
                  <div className="flex items-center gap-6 pt-2">
                    {lead && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                        <img src={lead.avatar} alt="" className="w-4 h-4 rounded-full" />
                        <span className="text-[10px] text-on-surface-variant font-medium">Lead: {lead.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <Calendar className="w-3 h-3 text-primary opacity-60" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">{task.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <User className="w-3 h-3 text-primary opacity-60" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">{task.assignedTo}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-black/20 border border-white/5 rounded-2xl border-dashed">
            <Clock className="w-12 h-12 text-on-surface-variant mx-auto mb-4 opacity-20" />
            <p className="text-on-surface-variant font-serif italic">No objectives matching your current parameters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Task['status'] }) {
  const styles = {
    TODO: "bg-white/5 text-on-surface-variant border-white/10",
    IN_PROGRESS: "bg-primary/10 text-primary border-primary/20",
    COMPLETED: "bg-success/10 text-success border-success/20"
  };
  return (
    <span className={cn("px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border", styles[status])}>
      {status.replace('_', ' ')}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Task['priority'] }) {
  const styles = {
    High: "text-error border-error/20 bg-error/10",
    Medium: "text-primary border-primary/20 bg-primary/10",
    Low: "text-on-surface-variant border-white/10 bg-white/5"
  };

  return (
    <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border", styles[priority])}>
      <Flag className={cn("w-2 h-2", priority === 'High' ? "fill-error" : "fill-none")} />
      {priority}
    </div>
  );
}
