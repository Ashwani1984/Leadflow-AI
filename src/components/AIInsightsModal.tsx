import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, MessageSquare, Mail, Copy, Check, Loader2, ListChecks, ArrowRight } from 'lucide-react';
import { Lead, Task } from '../types';
import { generateLeadInsights } from '../services/aiService';
import { cn } from '../lib/utils';

interface AIInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  tasks?: Task[];
}

interface Insights {
  talkingPoints: string[];
  emailSubject: string;
  emailBody: string;
}

export function AIInsightsModal({ isOpen, onClose, lead, tasks = [] }: AIInsightsModalProps) {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const leadTasks = tasks.filter(t => t.leadId === lead?.id);

  useEffect(() => {
    if (isOpen && lead) {
      handleGenerate();
    } else {
      setInsights(null);
    }
  }, [isOpen, lead]);

  const handleGenerate = async () => {
    if (!lead) return;
    setLoading(true);
    const result = await generateLeadInsights(lead);
    setInsights(result);
    setLoading(false);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
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
          className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-serif italic text-on-surface">AI Contact Intelligence</h3>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Personalized outreach strategy for {lead?.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8 scrollbar-hide">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-serif italic text-on-surface-variant animate-pulse">Analyzing prospect profile & generating hooks...</p>
              </div>
            ) : insights ? (
              <>
                <section className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Recommended Talking Points</h4>
                  </div>
                  <div className="grid gap-3">
                    {insights.talkingPoints.map((point, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-lg text-xs text-on-surface leading-relaxed flex items-start gap-3 group">
                        <span className="text-primary font-mono text-[10px] mt-1">0{i+1}</span>
                        <p>{point}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">AI-Crafted Email Draft</h4>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-black/40 border border-white/10 rounded-lg overflow-hidden">
                      <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
                        <span className="text-[10px] text-on-surface-variant">Subject: {insights.emailSubject}</span>
                        <button 
                          onClick={() => copyToClipboard(insights.emailSubject, 'subject')}
                          className="p-1 hover:text-primary transition-colors text-on-surface-variant"
                        >
                          {copiedField === 'subject' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <div className="p-4">
                        <pre className="text-xs text-on-surface whitespace-pre-wrap font-sans leading-relaxed">{insights.emailBody}</pre>
                        <div className="mt-4 flex justify-end">
                          <button 
                            onClick={() => copyToClipboard(insights.emailBody, 'body')}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold uppercase tracking-widest transition-all text-on-surface-variant hover:text-on-surface"
                          >
                            {copiedField === 'body' ? (
                              <><Check className="w-3 h-3" /> Copied</>
                            ) : (
                              <><Copy className="w-3 h-3" /> Copy Draft</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {leadTasks.length > 0 && (
                  <section className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                      <ListChecks className="w-4 h-4 text-primary" />
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Active Objectives</h4>
                    </div>
                    <div className="space-y-2">
                       {leadTasks.map(task => (
                         <div key={task.id} className="bg-black/20 border border-white/5 p-3 rounded-lg flex items-center justify-between group">
                           <div className="flex items-center gap-3">
                             <div className={cn(
                               "w-1.5 h-1.5 rounded-full",
                               task.status === 'COMPLETED' ? "bg-success" : "bg-primary animate-pulse"
                             )} />
                             <span className="text-[11px] text-on-surface">{task.title}</span>
                           </div>
                           <ArrowRight className="w-3 h-3 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all mr-2" />
                         </div>
                       ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-on-surface-variant font-serif italic">Failed to generate insights. Please try again.</p>
                <button onClick={handleGenerate} className="mt-4 text-primary text-xs uppercase tracking-widest font-bold underline">Retry AI Analysis</button>
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-white/5 hover:bg-white/10 text-on-surface text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors border border-white/10"
            >
              Close Intelligence View
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
