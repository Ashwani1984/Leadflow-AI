import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mic, Phone, PhoneOff, User, Terminal, Sparkles, Loader2, Volume2, Waves, MessageCircle } from 'lucide-react';
import { Lead } from '../types';
import { generateCallStrategy, simulateLeadResponse } from '../services/aiCallService';
import { cn } from '../lib/utils';
import { VOICE_PROFILES } from '../constants';

interface AICallAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  agent?: {
    name: string;
    voice: string;
    language: string;
  } | null;
}

interface TranscriptEntry {
  role: 'agent' | 'lead';
  text: string;
  timestamp: string;
  sentiment?: string;
}

export function AICallAgentModal({ isOpen, onClose, lead, agent }: AICallAgentModalProps) {
  const [status, setStatus] = useState<'idle' | 'strategizing' | 'calling' | 'connected' | 'completed'>('idle');
  const [strategy, setStrategy] = useState<any>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSentiment, setCurrentSentiment] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>(agent?.language || 'en-US');
  const [voice, setVoice] = useState<string>('');
  const [secondaryVoice, setSecondaryVoice] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [isAutoSim, setIsAutoSim] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (agent) {
      setLanguage(agent.language);
    }
  }, [agent]);

  useEffect(() => {
    // Initialize Web Speech API Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = agent?.language || 'en-US';

      recognition.onresult = (event: any) => {
        const transcriptText = event.results[0][0].transcript;
        handleVoiceInput(transcriptText);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [agent]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleVoiceInput = (text: string) => {
    setManualInput(text);
    // Automatically submit voice input after a brief moment
    setTimeout(() => {
      submitLeadText(text);
    }, 500);
  };

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      if (voices.length > 0) {
        if (agent) {
          const profile = VOICE_PROFILES.find(p => p.id === agent.voice);
          const preferred = voices.find(v => v.lang === agent.language && (v.name.includes(profile?.name || '') || (profile?.gender === 'Female' && v.name.includes('Samantha')))) || 
                           voices.find(v => v.lang === agent.language) || 
                           voices[0];
          setVoice(preferred.name);
        } else {
          if (!voice) {
            const engDefault = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.default)) || voices.find(v => v.lang.startsWith('en')) || voices[0];
            setVoice(engDefault.name);
          }
        }
        
        if (!secondaryVoice) {
          const hindiDefault = voices.find(v => v.lang.startsWith('hi')) || voices[0];
          setSecondaryVoice(hindiDefault.name);
        }
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [agent]);

  useEffect(() => {
    if (isOpen && lead) {
      startAutomation();
    } else {
      resetState();
    }
  }, [isOpen, lead]);

  useEffect(() => {
     // Stop any pending speech on close
     if (!isOpen) {
       window.speechSynthesis.cancel();
     }
  }, [isOpen]);

  const speak = (text: string) => {
    if (isMuted) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Heuristic: If text contains Devanagari characters, it's likely Hindi
    const isHindiText = /[\u0900-\u097F]/.test(text);
    const targetVoiceName = (isHindiText && secondaryVoice) ? secondaryVoice : voice;

    const selectedVoice = voices.find(v => v.name === targetVoiceName);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else {
      // Fallback: Attempt language matching
      const targetLang = language.toLowerCase();
      const voiceMatch = voices.find(v => v.lang.toLowerCase().includes(targetLang.slice(0, 2)));
      if (voiceMatch) utterance.voice = voiceMatch;
    }

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const resetState = () => {
    setStatus('idle');
    setStrategy(null);
    setTranscript([]);
    setCurrentSentiment(null);
  };

  const startAutomation = async () => {
    if (!lead) return;
    
    setStatus('strategizing');
    const strat = await generateCallStrategy(lead, language);
    if (strat?.error === 'QUOTA_EXCEEDED') {
      addTranscript('agent', "System: AI Deployment failed due to resource limits (Quota Exceeded). Please try again in 1 minute.");
      setStatus('completed');
      return;
    }
    setStrategy(strat);
    
    await new Promise(r => setTimeout(r, 1500));
    setStatus('calling');
    
    await new Promise(r => setTimeout(r, 2000));
    setStatus('connected');
    
    if (strat) {
      handleConversationTurn(strat.opening);
    }
  };

  const generateFollowUp = async () => {
    if (!lead) return;
    setIsGeneratingEmail(true);
    const { generateEmailFollowUp } = await import('../services/aiCallService');
    const draft = await generateEmailFollowUp(lead, transcript);
    setEmailDraft(draft);
    setIsGeneratingEmail(false);
  };

  const handleConversationTurn = async (agentSpeech: string) => {
    addTranscript('agent', agentSpeech);
    speak(agentSpeech);

    if (transcript.length > 10) {
      setTimeout(() => {
        const finalWord = strategy?.closing || "Thank you for the discussion. We will follow up. Goodbye.";
        addTranscript('agent', finalWord);
        speak(finalWord);
        setTimeout(() => {
          setStatus('completed');
          generateFollowUp();
        }, 2000);
      }, 3000);
      return;
    }

    setTimeout(async () => {
      if (!isAutoSim) return; // Wait for manual input if auto-sim is interrupted
      
      setIsAIThinking(true);
      const leadResponse = await simulateLeadResponse(agentSpeech, lead!, language);
      setCurrentSentiment(leadResponse.sentiment);
      addTranscript('lead', leadResponse.text, leadResponse.sentiment);
      
      setTimeout(async () => {
        const nextAgentMessage = await import('../services/aiCallService').then(m => 
          m.generateAgentResponse(lead!, transcript, leadResponse.text, language)
        );
        setIsAIThinking(false);
        handleConversationTurn(nextAgentMessage);
      }, 2000);
    }, 4000);
  };

  const handleManualResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim() || isAIThinking) return;
    submitLeadText(manualInput);
  };

  const submitLeadText = async (userInput: string) => {
    setManualInput('');
    setIsAutoSim(false); // Switch to manual interaction
    addTranscript('lead', userInput, "Neutral");
    
    setIsAIThinking(true);
    const nextAgentMessage = await import('../services/aiCallService').then(m => 
      m.generateAgentResponse(lead!, transcript, userInput, language)
    );
    setIsAIThinking(false);
    handleConversationTurn(nextAgentMessage);
  };

  const addTranscript = (role: 'agent' | 'lead', text: string, sentiment?: string) => {
    setTranscript(prev => [...prev, {
      role,
      text,
      sentiment,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  if (!isOpen || !lead) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-surface border border-white/10 rounded-2xl shadow-2xl flex flex-col h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center">
                <Mic className={cn("w-6 h-6 text-primary", status === 'connected' && "animate-pulse")} />
              </div>
              <div>
                <h3 className="text-xl font-serif italic text-on-surface">AI Agent Deployment</h3>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1.5">
                     <div className={cn("w-2 h-2 rounded-full", status === 'connected' ? 'bg-success animate-pulse' : 'bg-on-surface-variant')} />
                     <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant font-mono">
                       {status.toUpperCase()}
                     </span>
                   </div>
                   <span className="text-white/10">|</span>
                   <span className="text-[10px] text-primary/60 font-mono tracking-tighter">SID: VX-9902-TR</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Selection */}
              <div className="hidden lg:flex flex-col gap-1">
                <span className="text-[7px] uppercase tracking-widest text-on-surface-variant font-bold">Region/Lang</span>
                <input 
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="e.g. Hindi and English"
                  className="bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-[9px] uppercase tracking-widest font-bold text-on-surface outline-none w-32 focus:border-primary/40 transition-all font-mono"
                />
              </div>

              {/* Voice Pairings */}
              <div className="hidden xl:flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[7px] uppercase tracking-widest text-on-surface-variant font-bold">English Voice</span>
                  <select 
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    className="bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-[8px] uppercase tracking-widest font-bold text-on-surface outline-none max-w-[140px] font-mono"
                  >
                    {availableVoices.filter(v => v.lang.startsWith('en')).map((v, i) => (
                      <option key={i} value={v.name}>{v.name.slice(0, 20)} ({v.lang})</option>
                    ))}
                    <optgroup label="Other Voices">
                      {availableVoices.filter(v => !v.lang.startsWith('en') && !v.lang.startsWith('hi')).map((v, i) => (
                        <option key={i} value={v.name}>{v.name.slice(0, 20)} ({v.lang})</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[7px] uppercase tracking-widest text-on-surface-variant font-bold">Hindi Voice</span>
                  <select 
                    value={secondaryVoice}
                    onChange={(e) => setSecondaryVoice(e.target.value)}
                    className="bg-black/40 border border-white/5 rounded-lg px-2 py-1.5 text-[8px] uppercase tracking-widest font-bold text-on-surface outline-none max-w-[140px] font-mono"
                  >
                    {availableVoices.filter(v => v.lang.startsWith('hi')).map((v, i) => (
                      <option key={i} value={v.name}>{v.name.slice(0, 20)} ({v.lang})</option>
                    ))}
                    {availableVoices.filter(v => v.lang.startsWith('hi')).length === 0 && (
                      <option value="">No Hindi Voice Found</option>
                    )}
                    <optgroup label="System Defaults">
                       {availableVoices.filter(v => !v.lang.startsWith('hi')).map((v, i) => (
                         <option key={i} value={v.name}>{v.name.slice(0, 20)} ({v.lang})</option>
                       ))}
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>

            {/* Sentiment Indicator */}
            {currentSentiment && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full"
              >
                <div className="flex flex-col items-end">
                  <span className="text-[8px] uppercase tracking-widest text-on-surface-variant font-bold">Emotional State</span>
                  <span className={cn(
                    "text-[10px] font-bold uppercase",
                    currentSentiment === 'Skeptical' ? 'text-warning' : 
                    currentSentiment === 'Frustrated' ? 'text-error' : 
                    currentSentiment === 'Interested' || currentSentiment === 'Positive' ? 'text-success' : 
                    'text-on-surface'
                  )}>{currentSentiment}</span>
                </div>
                <div className="flex gap-1 h-4 items-end">
                   {[...Array(5)].map((_, i) => (
                     <motion.div 
                        key={i}
                        animate={{ 
                          height: currentSentiment === 'Interested' ? [4, 16, 4] : [4, 8, 4],
                          backgroundColor: currentSentiment === 'Interested' ? "#85ffb4" : "#ffffff20"
                        }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                        className="w-1 rounded-full"
                     />
                   ))}
                </div>
              </motion.div>
            )}

            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full text-on-surface-variant hover:text-on-surface transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Column: Call Interface */}
            <div className="flex-1 p-8 flex flex-col border-r border-white/5">
              <div className="flex-1 flex flex-col items-center justify-center space-y-12">
                {/* Visualizer */}
                <div className="relative">
                  <div className="flex items-center justify-center gap-1 h-24">
                     {[...Array(24)].map((_, i) => (
                       <motion.div
                         key={i}
                         animate={{
                           height: status === 'connected' ? [12, Math.random() * 80 + 10, 12] : 4
                         }}
                         transition={{
                           duration: 0.5,
                           repeat: Infinity,
                           delay: i * 0.05
                         }}
                         className="w-1.5 bg-primary/40 rounded-full"
                       />
                     ))}
                  </div>
                  {status === 'strategizing' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/50 backdrop-blur-sm rounded-2xl">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                      <p className="text-[10px] uppercase font-bold tracking-widest text-primary font-mono italic">Calibrating Strategy...</p>
                    </div>
                  )}
                </div>

                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <img src={lead.avatar} className="w-24 h-24 rounded-full border-2 border-white/10 p-1 mx-auto" alt="" />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center">
                       <User className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-2xl font-serif italic text-on-surface">{lead.name}</h4>
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest font-medium opacity-60">
                      {lead.industry} • {lead.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                   <button 
                     className={cn(
                       "w-12 h-12 rounded-full border flex items-center justify-center transition-all",
                       isMuted ? "bg-error/20 border-error/40 text-error" : "bg-white/5 border-white/10 text-on-surface-variant hover:border-primary/40"
                     )}
                     onClick={() => setIsMuted(!isMuted)}
                     title="Toggle Mute"
                   >
                     <Volume2 className="w-5 h-5" />
                   </button>
                   
                   <a 
                     href={`tel:${lead.phone}`}
                     className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/40 transition-all bg-white/5"
                     title="Standard Voice Call"
                   >
                     <Phone className="w-5 h-5" />
                   </a>

                   <a 
                     href={`https://wa.me/${lead.phone?.replace(/[^0-9]/g, '')}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-success hover:border-success/40 transition-all bg-white/5"
                     title="WhatsApp Voice Call"
                   >
                     <MessageCircle className="w-5 h-5" />
                   </a>

                   <button 
                     onClick={onClose}
                     className="px-8 py-3 bg-error text-white rounded-full flex items-center gap-3 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-error/20"
                   >
                     <PhoneOff className="w-4 h-4" />
                     <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Terminate</span>
                   </button>
                </div>
              </div>

              {/* Strategy Brief */}
              {strategy && (
                <div className="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <h5 className="text-[10px] uppercase font-bold tracking-widest text-primary">Live Call Strategy</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[9px] text-on-surface-variant uppercase font-bold tracking-tighter opacity-60">Objective</p>
                      <p className="text-xs text-on-surface italic font-serif leading-tight">Lead Qualification & Funnel Transition</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-on-surface-variant uppercase font-bold tracking-tighter opacity-60">Tone</p>
                      <p className="text-xs text-on-surface italic font-serif leading-tight">Consultative, Professional</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Console/Transcript */}
            <div className="w-96 bg-black/40 flex flex-col overflow-hidden">
               <div className="p-4 border-b border-white/5 bg-black/20 flex items-center gap-2 text-on-surface-variant">
                 <Terminal className="w-3.5 h-3.5" />
                 <span className="text-[10px] uppercase tracking-widest font-bold">Session Transcript</span>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col font-mono text-[11px] leading-relaxed">
                 {transcript.map((entry, i) => (
                   <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "space-y-1 p-3 rounded-lg border",
                      entry.role === 'agent' ? "bg-primary/5 border-primary/10 mr-4" : "bg-white/5 border-white/5 ml-4"
                    )}
                   >
                     <div className="flex items-center justify-between mb-1 opacity-60">
                        <span className={cn(
                          "uppercase text-[8px] font-bold",
                          entry.role === 'agent' ? "text-primary" : "text-on-surface"
                        )}>{entry.role === 'agent' ? 'AI Agent' : lead.name.split(' ')[0]}</span>
                        <span>{entry.timestamp}</span>
                     </div>
                     <p className={cn(
                       entry.role === 'agent' ? "text-on-surface" : "text-on-surface-variant italic"
                     )}>
                       {entry.text}
                     </p>
                   </motion.div>
                 ))}
                 <div ref={transcriptEndRef} />
                 
                 {status === 'connected' && isAIThinking && (
                   <div className="flex gap-1 items-center italic text-primary/40 opacity-50 px-2">
                     <Waves className="w-3 h-3 animate-pulse" />
                     <span>AI Agent is thinking...</span>
                   </div>
                 )}
                 {status === 'connected' && !isAIThinking && transcript[transcript.length-1]?.role === 'agent' && (
                   <div className="flex gap-1 items-center italic text-primary/40 opacity-50 px-2">
                     <Waves className="w-3 h-3 animate-pulse" />
                     <span>Waiting for lead response...</span>
                   </div>
                 )}
               </div>
                             <div className="p-4 bg-black/40 border-t border-white/5 space-y-4">
                 <form onSubmit={handleManualResponse} className="relative group">
                    <input 
                      type="text"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="Type your response as the lead..."
                      disabled={status !== 'connected' || isAIThinking}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-12 py-2.5 text-[10px] text-on-surface outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
                    />
                    <button 
                      type="button"
                      onClick={toggleListening}
                      disabled={status !== 'connected' || isAIThinking}
                      className={cn(
                        "absolute left-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all",
                        isListening ? "bg-error/20 text-error animate-pulse" : "text-on-surface-variant hover:text-primary"
                      )}
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      type="submit"
                      disabled={!manualInput.trim() || isAIThinking}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:text-primary/80 disabled:opacity-30"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                 </form>

                 {status === 'completed' && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="bg-primary/10 border border-primary/20 rounded-xl p-4 space-y-3"
                   >
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <MessageCircle className="w-4 h-4 text-primary" />
                         <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Post-Call Summary</span>
                       </div>
                       <button 
                         onClick={() => {
                           if (emailDraft) {
                             window.location.href = `mailto:${lead.email}?subject=${encodeURIComponent(emailDraft.split('\n')[0].replace('Subject: ', ''))}&body=${encodeURIComponent(emailDraft.split('\n').slice(1).join('\n'))}`;
                           }
                         }}
                         disabled={isGeneratingEmail || !emailDraft}
                         className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-primary hover:underline disabled:opacity-50"
                       >
                         {isGeneratingEmail ? <Loader2 className="w-3 h-3 animate-spin" /> : "Send Draft"}
                       </button>
                     </div>
                     <div className="text-[10px] text-on-surface-variant line-clamp-3 bg-black/20 p-2 rounded border border-white/5 font-mono">
                        {isGeneratingEmail ? "AI is reviewing transcript..." : (emailDraft || "Reviewing conversation data...")}
                     </div>
                   </motion.div>
                 )}

                 <div>
                   <div className="flex items-center gap-2 mb-2">
                     <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                     <p className="text-[10px] text-success font-bold uppercase tracking-widest">Post-Call Logic Armed</p>
                   </div>
                   <p className="text-[9px] text-on-surface-variant italic leading-tight">
                     Upon termination, AI will summarize and auto-assign follow-up tasks to the relevant funnel manager.
                   </p>
                 </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
