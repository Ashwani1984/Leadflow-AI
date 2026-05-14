import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, User, AlignLeft, Flag, CheckCircle2 } from 'lucide-react';
import { Task, Lead, Priority } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id'>) => void;
  leads: Lead[];
  selectedLeadId?: string;
}

export function TaskModal({ isOpen, onClose, onSubmit, leads, selectedLeadId }: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'Medium' as Priority,
    status: 'TODO' as Task['status'],
    assignedTo: 'AI Agent Alpha',
    leadId: selectedLeadId || (leads.length > 0 ? leads[0].id : '')
  });

  useEffect(() => {
    if (selectedLeadId) {
      setFormData(prev => ({ ...prev, leadId: selectedLeadId }));
    } else if (leads.length > 0 && !formData.leadId) {
      setFormData(prev => ({ ...prev, leadId: leads[0].id }));
    }
  }, [selectedLeadId, leads]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
            <div>
              <h3 className="text-xl font-serif italic text-on-surface">New Strategic Objective</h3>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Task Assignment & Tracking</p>
            </div>
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Task Objective</label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50" />
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-black/40 border border-white/5 rounded-sm py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-primary/50 transition-all text-on-surface"
                    placeholder="e.g. Schedule Follow-up Call"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Mission Description</label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-4 w-4 h-4 text-primary opacity-50" />
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-black/40 border border-white/5 rounded-sm py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-primary/50 transition-all text-on-surface resize-none"
                    placeholder="Provide context and requirements..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Strategic Priority</label>
                  <div className="relative">
                    <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50" />
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                      className="w-full bg-black/40 border border-white/5 rounded-sm py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-primary/50 transition-all text-on-surface appearance-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Assigned Lead</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50" />
                    <select
                      disabled={!!selectedLeadId}
                      value={formData.leadId}
                      onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                      className="w-full bg-black/40 border border-white/5 rounded-sm py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-primary/50 transition-all text-on-surface appearance-none disabled:opacity-50"
                    >
                      {leads.map(lead => (
                        <option key={lead.id} value={lead.id}>{lead.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Due Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50" />
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full bg-black/40 border border-white/5 rounded-sm py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-primary/50 transition-all text-on-surface"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Execution Agent</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50" />
                    <input
                      type="text"
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      className="w-full bg-black/40 border border-white/5 rounded-sm py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-primary/50 transition-all text-on-surface"
                      placeholder="Assignee name..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 border border-white/10 text-on-surface text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-white/5 transition-colors"
              >
                Abort
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-primary text-black text-[10px] font-bold uppercase tracking-widest rounded-sm hover:brightness-110 transition-colors shadow-lg shadow-primary/20"
              >
                Confirm Mission
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
