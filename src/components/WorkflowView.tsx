import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Plus, Zap, MessageSquare, Phone, Mail, Settings, Layout, X, Save } from 'lucide-react';
import { cn } from '../lib/utils';

const initialSteps = [
  { id: 1, icon: Zap, label: 'Lead Captured', type: 'trigger' },
  { id: 2, icon: MessageSquare, label: 'AI Initial Analysis', type: 'action' },
  { id: 3, icon: Phone, label: 'Smart Dialing', type: 'action' },
  { id: 4, icon: Mail, label: 'Personalized Follow-up', type: 'action' },
  { id: 5, icon: Layout, label: 'Automated Email Campaign', type: 'action' },
];

interface WorkflowViewProps {
  onRunTest?: () => void;
  onSimulateLead?: () => void;
  activeStepId: number | null;
}

export function WorkflowView({ onRunTest, onSimulateLead, activeStepId }: WorkflowViewProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState({
    subject: 'Welcome to our platform!',
    body: 'Hi {{name}},\n\nThank you for your interest in our services. Our team will reach out shortly.\n\nBest regards,\nThe AI Team'
  });

  return (
    <div className="p-4">
      <header className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-3xl font-serif italic text-on-surface">Global Funnel Alpha</h2>
          <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Status: <span className={cn("transition-colors", activeStepId ? "text-primary animate-pulse" : "text-on-surface-variant")}>{activeStepId ? 'Processing Lead...' : 'System Idle'}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onSimulateLead}
            className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest border border-white/10 rounded-sm text-on-surface hover:bg-white/5 transition-colors"
          >
            <Zap className="w-3 h-3 text-primary" />
            Capture Lead
          </button>
          <button 
            onClick={onRunTest}
            disabled={!!activeStepId}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all",
              activeStepId ? "bg-white/5 text-on-surface-variant cursor-not-allowed" : "bg-primary text-black hover:brightness-110"
            )}
          >
            <Play className="w-3 h-3" />
            {activeStepId ? 'Running...' : 'Run Test'}
          </button>
        </div>
      </header>

      <div className="relative flex flex-col items-center gap-12 py-10">
        {initialSteps.map((step, index) => {
          const isActive = activeStepId === step.id;
          const isCompleted = activeStepId && activeStepId > step.id;

          return (
            <React.Fragment key={step.id}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  if (step.id === 5) {
                    setIsEditorOpen(true);
                  } else {
                    const stepEl = document.getElementById(`step-${step.id}`);
                    if (stepEl) {
                      stepEl.classList.add('border-primary');
                      setTimeout(() => stepEl.classList.remove('border-primary'), 1000);
                    }
                  }
                }}
                id={`step-${step.id}`}
                className={cn(
                  "relative z-10 w-full max-w-md border p-6 rounded-2xl flex items-center gap-6 transition-all cursor-pointer group shadow-xl",
                  isActive ? "bg-primary/10 border-primary ring-1 ring-primary/50" : 
                  isCompleted ? "bg-white/[0.05] border-primary/30" : "bg-white/[0.03] border-white/10 hover:border-primary/50"
                )}
              >
                <div className={cn(
                  "w-14 h-14 border rounded-full flex items-center justify-center transition-all",
                  isActive ? "bg-primary/20 border-primary animate-pulse" : 
                  isCompleted ? "bg-primary/10 border-primary/40" : "bg-black/40 border-white/10 group-hover:bg-primary/10 group-hover:border-primary/30"
                )}>
                  <step.icon className={cn("w-6 h-6", isActive || isCompleted ? "text-primary" : "text-primary/60")} />
                </div>
                <div className="flex-1">
                  <p className={cn("text-[10px] uppercase tracking-[0.2em] font-bold mb-1", isActive ? "text-primary" : "text-on-surface-variant")}>{step.type}</p>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-serif italic text-on-surface">{step.label}</h4>
                    {step.id === 5 && <Settings className="w-3 h-3 text-primary animate-pulse" />}
                  </div>
                </div>
                <div className={cn(
                  "w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-mono transition-colors",
                  isActive || isCompleted ? "border-primary/40 text-primary" : "border-white/5 text-on-surface-variant"
                )}>
                  0{step.id}
                </div>
              </motion.div>
              
              {index < initialSteps.length - 1 && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 48 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className={cn(
                    "w-px transition-colors duration-500",
                    isCompleted ? "bg-primary" : "bg-gradient-to-b from-primary/50 to-transparent"
                  )}
                >
                   <div className={cn(
                     "w-1.5 h-1.5 rounded-full blur-[2px] transition-colors",
                     isCompleted ? "bg-primary" : "bg-primary/30"
                   )} />
                </motion.div>
              )}
            </React.Fragment>
          );
        })}

        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-12 h-12 bg-black/40 border border-dashed border-white/20 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/40 transition-all"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                <div>
                  <h3 className="text-xl font-serif italic text-on-surface">Email Campaign Editor</h3>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Step 05 Configuration</p>
                </div>
                <button onClick={() => setIsEditorOpen(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Email Subject</label>
                  <input 
                    type="text" 
                    value={emailTemplate.subject}
                    onChange={(e) => setEmailTemplate({ ...emailTemplate, subject: e.target.value })}
                    className="w-full bg-black/40 border border-white/5 rounded-sm py-3 px-4 text-xs focus:outline-none focus:border-primary/50 transition-all text-on-surface"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Template Body</label>
                    <span className="text-[9px] text-primary italic">Use {"{{name}}"} for variables</span>
                  </div>
                  <textarea 
                    rows={8}
                    value={emailTemplate.body}
                    onChange={(e) => setEmailTemplate({ ...emailTemplate, body: e.target.value })}
                    className="w-full bg-black/40 border border-white/5 rounded-sm py-3 px-4 text-xs focus:outline-none focus:border-primary/50 transition-all text-on-surface font-mono leading-relaxed"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setIsEditorOpen(false)}
                    className="flex-1 py-4 border border-white/10 text-on-surface text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setIsEditorOpen(false)}
                    className="flex-1 py-4 bg-primary text-black text-[10px] font-bold uppercase tracking-widest rounded-sm hover:brightness-110 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Template
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

