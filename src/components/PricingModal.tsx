import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Zap, Shield, Crown, Globe, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const plans = [
  {
    name: 'Onyx Starter',
    price: '$0',
    id: 'starter',
    description: 'Entry-level neural processing for emerging startups.',
    features: [
      '50 AI Calls / month',
      'Basic Persona Simulation',
      'Standard Lead Pipeline',
      'Community Intelligence'
    ],
    cta: 'Current Plan',
    current: true,
    accent: 'border-white/10'
  },
  {
    name: 'Neural Pro',
    price: '$299',
    id: 'pro',
    description: 'High-velocity lead acquisition for growing squads.',
    features: [
      'Unlimited AI Calls',
      'Advanced Multilingual Support',
      'Custom Voice Models',
      'Live Sentiment Analytics',
      'Priority Queueing',
      'CRM Integration Bridge'
    ],
    cta: 'Upgrade to Pro',
    premium: true,
    accent: 'border-primary/50 bg-primary/5'
  },
  {
    name: 'Elite Enterprise',
    price: 'Custom',
    id: 'enterprise',
    description: 'Sovereign intelligence deployment for market leaders.',
    features: [
      'White-label Voice Protocols',
      'Dedicated Neural Instance',
      '24/7 Security Operations',
      'Custom Workflow Automations',
      'On-premise Data Isolation',
      'Executive Strategy Suite'
    ],
    cta: 'Contact Sales',
    accent: 'border-white/10'
  }
];

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [view, setView] = useState<'plans' | 'upgrading' | 'contact' | 'success'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const handlePlanAction = (plan: any) => {
    if (plan.current) return;
    setSelectedPlan(plan);
    if (plan.id === 'pro') {
      setView('upgrading');
      setTimeout(() => setView('success'), 3000);
    } else if (plan.id === 'enterprise') {
      setView('contact');
    }
  };

  const handleClose = () => {
    setView('plans');
    setSelectedPlan(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-6xl bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-12 pb-6 border-b border-white/5 flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-primary mb-4 block">Membership Protocols</span>
                <h2 className="text-4xl font-serif text-on-surface mb-3 italic">
                  {view === 'plans' && <>Upgrade Your <span className="font-light opacity-60">Neural Capacity</span></>}
                  {view === 'upgrading' && <>Initialising <span className="font-light opacity-60">Pro Protocol</span></>}
                  {view === 'contact' && <>Contact <span className="font-light opacity-60">Strategy Command</span></>}
                  {view === 'success' && <>Protocol <span className="font-light opacity-60">Deployment Confirmed</span></>}
                </h2>
                <p className="text-on-surface-variant text-sm max-w-lg">
                  {view === 'plans' && "Scale your automated sales fleet with enhanced processing power, custom voice protocols, and deep intelligence analytics."}
                  {view === 'upgrading' && "Syncing with global neural network... Please stand by for regional instance allocation."}
                  {view === 'contact' && "Request a custom strategy evaluation for your enterprise deployment. Our command will reach out within 14 minutes."}
                  {view === 'success' && "Your account has been upgraded to Neural Pro. All limits have been lifted, and advanced analytics are now active."}
                </p>
              </div>
              <button 
                onClick={handleClose}
                className="p-3 hover:bg-white/5 rounded-full transition-colors group"
              >
                <X className="w-6 h-6 text-on-surface-variant group-hover:text-on-surface" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-12 overflow-y-auto max-h-[70vh]">
              {view === 'plans' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {plans.map((plan, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={cn(
                        "flex flex-col p-8 rounded-3xl border transition-all duration-500 hover:translate-y-[-8px]",
                        plan.accent
                      )}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className={cn(
                          "text-[10px] uppercase tracking-[0.2em] font-bold",
                          plan.premium ? "text-primary" : "text-white/40"
                        )}>
                          {plan.name}
                        </h3>
                        {plan.premium && (
                          <div className="bg-primary/20 p-2 rounded-lg">
                            <Zap className="w-3 h-3 text-primary fill-primary" />
                          </div>
                        )}
                      </div>

                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-light text-on-surface tracking-tighter">{plan.price}</span>
                          {plan.price !== 'Custom' && <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">/ Mo</span>}
                        </div>
                        <p className="text-xs text-on-surface-variant mt-3 leading-relaxed">
                          {plan.description}
                        </p>
                      </div>

                      <div className="flex-1 space-y-4 mb-8">
                        {plan.features.map((feature, j) => (
                          <div key={j} className="flex items-start gap-3">
                            <div className={cn(
                              "mt-1 p-0.5 rounded-full border",
                              plan.premium ? "border-primary/30 text-primary" : "border-white/10 text-white/20"
                            )}>
                              <Check className="w-2.5 h-2.5" />
                            </div>
                            <span className="text-[11px] text-on-surface/80 leading-snug">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handlePlanAction(plan)}
                        className={cn(
                          "w-full py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
                          plan.current 
                            ? "bg-white/5 text-white/40 cursor-default" 
                            : plan.premium
                              ? "bg-primary text-black hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                              : "bg-white/10 text-on-surface hover:bg-white/20"
                        )}
                      >
                        {plan.cta}
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {view === 'upgrading' && (
                <div className="flex flex-col items-center justify-center py-20 space-y-8">
                  <div className="relative">
                    <Loader2 className="w-24 h-24 text-primary animate-spin opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Zap className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold">Neural Handshake Active</p>
                    <p className="text-on-surface-variant text-sm font-mono">Allocating GPU clusters for your region...</p>
                  </div>
                </div>
              )}

              {view === 'contact' && (
                <div className="max-w-2xl mx-auto py-10 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">Company Entity</label>
                      <input type="text" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all" placeholder="Enter formal organization name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">Fleet Size</label>
                      <select className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                        <option>10-50 Agents</option>
                        <option>50-200 Agents</option>
                        <option>200+ Global Units</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">Deployment Objectives</label>
                    <textarea rows={4} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all resize-none" placeholder="Describe your scale requirements..." />
                  </div>
                  <button 
                    onClick={() => {
                       setView('success');
                       setSelectedPlan({ name: 'Elite Enterprise' });
                    }}
                    className="w-full py-4 bg-primary text-black rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:brightness-110 flex items-center justify-center gap-2"
                  >
                    Transmit Strategy Request <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {view === 'success' && (
                <div className="flex flex-col items-center justify-center py-20 space-y-8">
                  <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center border border-success/30">
                    <Check className="w-12 h-12 text-success" />
                  </div>
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-serif italic text-on-surface">Activation Successful</h3>
                    <p className="text-on-surface-variant text-sm max-w-md mx-auto">
                      {selectedPlan?.id === 'pro' 
                        ? "The Neural Pro protocols are now live on your account. All data restrictions have been removed."
                        : "Your enterprise strategy request has been transmitted. An elite strategist will be assigned to your account shortly."}
                    </p>
                    <button 
                      onClick={handleClose}
                      className="mt-4 px-10 py-3 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                      Return to Command
                    </button>
                  </div>
                </div>
              )}

              {/* Trust Badge (Only show on main plans view) */}
              {view === 'plans' && (
                <div className="mt-16 flex items-center justify-between p-8 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-10">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] uppercase tracking-[0.3em] text-on-surface-variant font-bold">Security Standard</span>
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-mono text-on-surface tracking-tight font-bold">Quantum-Resistant Encryption</span>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] uppercase tracking-[0.3em] text-on-surface-variant font-bold">Latency SLA</span>
                      <div className="flex items-center gap-2">
                         <Zap className="w-3.5 h-3.5 text-primary" />
                         <span className="text-[10px] font-mono text-on-surface tracking-tight font-bold">&lt; 150ms Global Response</span>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] uppercase tracking-[0.3em] text-on-surface-variant font-bold">Deployment</span>
                      <div className="flex items-center gap-2">
                         <Globe className="w-3.5 h-3.5 text-primary" />
                         <span className="text-[10px] font-mono text-on-surface tracking-tight font-bold">Multi-Region Redundancy</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold max-w-[200px] text-right italic opacity-50">
                     All prices are in USD. Standard Neural Surcharge may apply for extreme-volume instances.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

