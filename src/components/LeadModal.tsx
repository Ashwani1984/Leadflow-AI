import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Globe, Briefcase, Activity, Sparkles, Loader2, Flag, Phone } from 'lucide-react';
import { Lead, Priority } from '../types';
import { suggestLeadPriority } from '../services/aiService';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lead: Omit<Lead, 'id' | 'dateAdded' | 'avatar'>) => void;
  initialData?: Lead | null;
}

export function LeadModal({ isOpen, onClose, onSubmit, initialData }: LeadModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    industry: '',
    website: '',
    phone: '',
    status: 'PENDING' as Lead['status'],
    priority: 'Medium' as Priority
  });
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionReason, setSuggestionReason] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        industry: initialData.industry,
        website: initialData.website,
        phone: initialData.phone || '',
        status: initialData.status,
        priority: initialData.priority || 'Medium'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        industry: '',
        website: '',
        phone: '',
        status: 'PENDING',
        priority: 'Medium'
      });
      setSuggestionReason('');
    }
  }, [initialData, isOpen]);

  const handleSuggestPriority = async () => {
    if (!formData.name || !formData.email) return;
    setIsSuggesting(true);
    const result = await suggestLeadPriority({
      name: formData.name,
      email: formData.email,
      industry: formData.industry,
      website: formData.website,
      status: formData.status
    });
    if (result) {
      setFormData(prev => ({ ...prev, priority: result.priority }));
      setSuggestionReason(result.reason);
    }
    setIsSuggesting(false);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    setFormData({
      name: '',
      email: '',
      industry: '',
      website: '',
      status: 'PENDING'
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
            <h3 className="text-xl font-serif italic text-on-surface">
              {initialData ? 'Update Prospect Profile' : 'Add New Pipeline Lead'}
            </h3>
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50" />
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/5 rounded-sm py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-primary/50 transition-all text-on-surface placeholder:text-on-surface-variant/30"
                    placeholder="Enter prospect name..."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50" />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-black/40 border border-white/5 rounded-sm py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-primary/50 transition-all text-on-surface placeholder:text-on-surface-variant/30"
                    placeholder="prospect@company.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-black/40 border border-white/5 rounded-sm py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-primary/50 transition-all text-on-surface placeholder:text-on-surface-variant/30"
                    placeholder="+CountryCode-Number (e.g. +91 98XXX...)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Industry</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50" />
                    <input
                      required
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full bg-black/40 border border-white/5 rounded-sm py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-primary/50 transition-all text-on-surface placeholder:text-on-surface-variant/30"
                      placeholder="e.g. Fintech"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50" />
                    <input
                      required
                      type="text"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full bg-black/40 border border-white/5 rounded-sm py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-primary/50 transition-all text-on-surface placeholder:text-on-surface-variant/30"
                      placeholder="company.com"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Status</label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50" />
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Lead['status'] })}
                      className="w-full bg-black/40 border border-white/5 rounded-sm py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-primary/50 transition-all text-on-surface appearance-none"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="AI ANALYZING">AI ANALYZING</option>
                      <option value="CALLING">CALLING</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Priority</label>
                    <button
                      type="button"
                      onClick={handleSuggestPriority}
                      disabled={isSuggesting || !formData.name}
                      className="text-[9px] uppercase font-bold text-primary hover:text-primary/70 transition-colors disabled:opacity-30 flex items-center gap-1"
                    >
                      {isSuggesting ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                      AI Suggest
                    </button>
                  </div>
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
              </div>

              {suggestionReason && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-primary/10 border border-primary/20 p-3 rounded-lg flex items-start gap-3"
                >
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] text-on-surface/80 leading-relaxed italic">
                    <span className="font-bold text-primary">AI Insight:</span> {suggestionReason}
                  </p>
                </motion.div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-white/10 text-on-surface text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-primary text-black text-[10px] font-bold uppercase tracking-widest rounded-sm hover:brightness-110 transition-colors shadow-lg shadow-primary/20"
              >
                {initialData ? 'Apply Changes' : 'Confirm Add'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
