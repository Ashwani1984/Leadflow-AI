import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Users, Zap, Clock, TrendingUp, Mic, Play, Pause, Settings, BarChart3, ShieldCheck, PieChart as PieIcon, Activity, ChevronDown, Globe, Volume2 } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { cn } from '../lib/utils';
import { VOICE_PROFILES, LANGUAGES, initialAgents } from '../constants';

const performanceData = [
  { time: '09:00', success: 85, calls: 120 },
  { time: '10:00', success: 88, calls: 150 },
  { time: '11:00', success: 92, calls: 180 },
  { time: '12:00', success: 89, calls: 140 },
  { time: '13:00', success: 94, calls: 160 },
  { time: '14:00', success: 91, calls: 190 },
  { time: '15:00', success: 96, calls: 210 },
];

const sentimentData = [
  { name: 'Positive', value: 65, color: '#D4AF37' },
  { name: 'Neutral', value: 25, color: 'rgba(212, 175, 55, 0.4)' },
  { name: 'Negative', value: 10, color: 'rgba(255, 255, 255, 0.05)' },
];

const handlingTimeData = [
  { name: '0-1m', value: 20 },
  { name: '1-2m', value: 45 },
  { name: '2-3m', value: 90 },
  { name: '3-4m', value: 55 },
  { name: '4m+', value: 25 },
];

interface AICallAgentViewProps {
  onStartDemoCall: (agent?: any) => void;
}

export function AICallAgentView({ onStartDemoCall }: AICallAgentViewProps) {
  const [fleet, setFleet] = useState(initialAgents);
  const [previewingId, setPreviewingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  useEffect(() => {
    // Some browsers need a kick to load voices
    window.speechSynthesis.getVoices();
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const updateAgent = (id: number, updates: any) => {
    setFleet(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    if (updates.voice) {
      const voiceName = VOICE_PROFILES.find(v => v.id === updates.voice)?.name;
      setNotification(`Neural calibration: Voice profile switched to ${voiceName}`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const toggleStatus = (id: number) => {
    setFleet(prev => prev.map(a => 
      a.id === id ? { ...a, status: a.status === 'Active' ? 'Paused' : 'Active' } : a
    ));
  };

  const startPreview = (id: number) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    setPreviewingId(id);
    
    const agent = fleet.find(a => a.id === id);
    const voiceProfile = VOICE_PROFILES.find(v => v.id === agent?.voice);
    
    if (voiceProfile && agent) {
      const isHindi = agent.language === 'hi-IN';
      const sampleText = isHindi ? voiceProfile.sample.hi : voiceProfile.sample.en;
      const utterance = new SpeechSynthesisUtterance(sampleText);
      
      // Try to find a matching voice on the system
      const voices = window.speechSynthesis.getVoices();
      
      // Prioritize voice by language first, then by gender/name
      const preferredVoice = voices.find(v => v.lang === agent.language) || 
                            voices.find(v => 
                              v.name.includes(voiceProfile.name) || 
                              (voiceProfile.gender === 'Female' && (v.name.includes('Female') || v.name.includes('Google हिन्दी') || v.name.includes('Samantha'))) ||
                              (voiceProfile.gender === 'Male' && (v.name.includes('Male') || v.name.includes('Alex')))
                            );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.lang = agent.language;
      utterance.pitch = voiceProfile.tone === 'Energetic' ? 1.2 : 1.0;
      utterance.rate = voiceProfile.tone === 'Professional' ? 0.9 : 1.0;

      utterance.onend = () => setPreviewingId(null);
      utterance.onerror = () => setPreviewingId(null);

      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPreviewingId(null), 4000);
    }
  };

  const handleDeployAgent = async (newAgent: any) => {
    const id = Math.max(...fleet.map(a => a.id), 0) + 1;
    setFleet(prev => [...prev, { ...newAgent, id, status: 'Active', tasks: 0, conversion: '0%' }]);
    setNotification(`Strategic asset deployed: ${newAgent.name}`);
    setTimeout(() => setNotification(null), 3000);
    setIsDeployModalOpen(false);
    
    const { logAction } = await import('../lib/audit');
    await logAction('AGENT_DEPLOYED', `New AI Voice Agent "${newAgent.name}" stabilized in current cluster`);
  };

  return (
    <div className="space-y-12 pb-20 relative">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-32 left-1/2 z-50 px-6 py-3 bg-black/80 border border-primary/30 text-primary text-[10px] uppercase font-bold tracking-widest rounded-full backdrop-blur-xl shadow-2xl"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
      <header className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary mb-4 block">Neural Voice Systems</span>
          <h2 className="text-5xl font-serif text-on-surface mb-4 leading-tight">
            AI Call <span className="italic font-light opacity-60">Automation Agents</span>
          </h2>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-2xl">
            Manage and monitor your autonomous voice agents. These systems utilize Gemini 3.1 Flash for real-time natural language processing and ultra-low latency response synthesis.
          </p>
        </div>
        <button 
          onClick={() => onStartDemoCall()}
          className="flex items-center gap-3 px-8 py-4 bg-primary text-black text-xs font-bold uppercase tracking-widest rounded-sm hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/10"
        >
          <Play className="w-4 h-4 fill-black" />
          Run Demo Call
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatItem icon={Zap} label="Calls Dispatched" value="1,284" trend="+12%" />
        <StatItem icon={Clock} label="Avg. Call Duration" value="2m 14s" trend="-5s" />
        <StatItem icon={TrendingUp} label="Total Conversion" value="14.2%" trend="+0.8%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Agent Fleet Table */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
              <h3 className="text-xs uppercase tracking-widest font-bold text-on-surface">Active Agent Fleet</h3>
              <button 
                onClick={() => setIsDeployModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2 text-[10px] font-bold uppercase tracking-widest bg-primary text-black rounded-sm hover:brightness-110 transition-colors"
              >
                Deploy New Agent
              </button>
            </div>
            <div className="divide-y divide-white/5">
              {fleet.map((agent) => (
                <div key={agent.id} className="p-6 flex flex-col items-stretch lg:flex-row lg:items-center justify-between gap-6 group hover:bg-white/[0.02] transition-colors relative overflow-hidden">
                  {/* Preview Soundwave Overlay */}
                  <AnimatePresence>
                    {previewingId === agent.id && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-primary/[0.03] flex items-center justify-center pointer-events-none"
                      >
                        <div className="flex items-center gap-1.5 h-12">
                          {[...Array(12)].map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{ 
                                height: [4, Math.random() * 40 + 10, 4],
                              }}
                              transition={{ 
                                repeat: Infinity, 
                                duration: 0.5 + Math.random(),
                                delay: i * 0.1
                              }}
                              className="w-1 bg-primary/40 rounded-full"
                            />
                          ))}
                        </div>
                        <div className="ml-6 text-[10px] font-mono text-primary uppercase tracking-[0.2em] font-bold">
                           Previewing {agent.voice} Protocol...
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-4 min-w-[240px]">
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-black/40 relative">
                      <Mic className={cn("w-5 h-5", agent.status === 'Active' ? "text-primary animate-pulse" : "text-on-surface-variant")} />
                      {previewingId === agent.id && (
                        <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-on-surface">{agent.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-widest",
                          agent.status === 'Active' ? "text-success" : "text-on-surface-variant/40"
                        )}>{agent.status}</span>
                        <span className="text-white/10 text-[9px]">|</span>
                        <div className="flex items-center gap-1.5 text-[9px] text-on-surface-variant font-mono opacity-60">
                          <Globe className="w-2.5 h-2.5" />
                          {LANGUAGES.find(l => l.id === agent.language)?.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Voice Customization */}
                    <div className="space-y-1.5 col-span-2 lg:col-span-1">
                      <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold opacity-40">Neural Voice</p>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 group/select">
                          <select 
                            value={agent.voice}
                            onChange={(e) => updateAgent(agent.id, { voice: e.target.value })}
                            className="w-full bg-white/[0.03] border border-white/5 rounded px-2 py-1.5 text-[11px] text-on-surface-variant font-mono appearance-none cursor-pointer focus:border-primary/40 outline-none transition-all pr-6"
                          >
                            {VOICE_PROFILES.map(v => (
                              <option key={v.id} value={v.id} className="bg-surface text-on-surface">
                                {v.name} ({v.tone})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-on-surface-variant pointer-events-none group-hover/select:text-primary transition-colors" />
                        </div>
                        <button 
                          onClick={() => startPreview(agent.id)}
                          disabled={previewingId === agent.id}
                          className={cn(
                            "p-2 rounded border border-white/5 transition-all outline-none",
                            previewingId === agent.id 
                              ? "text-primary border-primary/20 bg-primary/10" 
                              : "text-on-surface-variant hover:text-primary hover:bg-white/5"
                          )}
                          title="Preview Voice Sample"
                        >
                          <Volume2 className={cn("w-3.5 h-3.5", previewingId === agent.id && "animate-pulse")} />
                        </button>
                      </div>
                    </div>

                    {/* Language Settings */}
                    <div className="space-y-1.5 col-span-2 lg:col-span-1">
                      <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold opacity-40">Language Protocol</p>
                      <div className="relative group/select">
                        <select 
                          value={agent.language}
                          onChange={(e) => updateAgent(agent.id, { language: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/5 rounded px-2 py-1.5 text-[11px] text-on-surface-variant font-mono appearance-none cursor-pointer focus:border-primary/40 outline-none transition-all pr-6"
                        >
                          {LANGUAGES.map(l => (
                            <option key={l.id} value={l.id} className="bg-surface text-on-surface">
                              {l.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-on-surface-variant pointer-events-none group-hover/select:text-primary transition-colors" />
                      </div>
                    </div>

                    <div className="text-right hidden lg:block">
                      <p className="text-[9px] text-on-surface-variant uppercase font-bold tracking-tighter opacity-40">Conversion</p>
                      <p className="text-xs text-primary font-mono font-bold mt-1">{agent.conversion}</p>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => onStartDemoCall(agent)}
                         className="p-2.5 rounded border border-white/5 text-on-surface-variant hover:text-primary hover:bg-white/5 transition-all"
                         title="Start Demo Call with this Agent"
                       >
                         <Mic className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => toggleStatus(agent.id)}
                         className={cn(
                           "p-2.5 rounded flex items-center justify-center transition-all",
                           agent.status === 'Active' ? "bg-error/10 text-error hover:bg-error/20" : "bg-success/10 text-success hover:bg-success/20"
                         )}
                       >
                         {agent.status === 'Active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Success Rate Chart */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-serif italic text-on-surface">Neural Success Rate</h3>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Real-time Call Resolution Trends</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-primary" />
                   <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Resolution %</span>
                 </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#D4AF37', fontSize: '12px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="success" 
                    stroke="#D4AF37" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorSuccess)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Sentiment Chart */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-6">
               <PieIcon className="w-5 h-5 text-primary" />
               <h3 className="text-xs uppercase tracking-widest font-bold text-on-surface">Emotional Spectrum</h3>
             </div>
             <div className="h-[200px] w-full mb-6">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={sentimentData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {sentimentData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="space-y-3">
               {sentimentData.map((item, i) => (
                 <div key={i} className="flex items-center justify-between px-3 py-2 bg-white/[0.02] rounded-lg border border-white/5">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                     <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">{item.name}</span>
                   </div>
                   <span className="text-xs font-mono text-on-surface">{item.value}%</span>
                 </div>
               ))}
             </div>
          </div>

          {/* Handling Time Breakdown */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-6">
               <Activity className="w-5 h-5 text-primary" />
               <h3 className="text-xs uppercase tracking-widest font-bold text-on-surface">Durational Velocity</h3>
             </div>
             <div className="h-[180px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={handlingTimeData}>
                   <Bar 
                    dataKey="value" 
                    fill="#D4AF37" 
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                   />
                   <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }}
                  />
                 </BarChart>
               </ResponsiveContainer>
             </div>
             <p className="text-[9px] uppercase tracking-widest text-center text-on-surface-variant font-bold mt-4 opacity-50">
               Frequency Distribution by Duration
             </p>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-6">
             <div className="flex items-center gap-3">
               <ShieldCheck className="w-5 h-5 text-primary" />
               <h3 className="text-xs uppercase tracking-widest font-bold text-on-surface">Agent Integrity</h3>
             </div>
             <div className="space-y-4">
                <ProgressItem label="Latency Optimization" value={98} />
                <ProgressItem label="Transcript Accuracy" value={95} />
                <ProgressItem label="Compliance Check" value={100} />
             </div>
          </div>
        </div>
      </div>

      <DeployAgentModal 
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onDeploy={handleDeployAgent}
      />
    </div>
  );
}

interface DeployAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (agent: any) => void;
}

function DeployAgentModal({ isOpen, onClose, onDeploy }: DeployAgentModalProps) {
  const [name, setName] = useState('');
  const [voice, setVoice] = useState(VOICE_PROFILES[0].id);
  const [language, setLanguage] = useState(LANGUAGES[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onDeploy({ name, voice, language });
    setName('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-white/5">
              <span className="text-[10px] uppercase tracking-[0.3em] text-primary mb-2 block">System Protocol</span>
              <h3 className="text-2xl font-serif text-on-surface italic">Deploy <span className="font-light opacity-60">New Unit</span></h3>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">Agent Designation</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Outreach Commander v4"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:border-primary outline-none transition-all placeholder:text-white/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">Voice Profile</label>
                  <select 
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                  >
                    {VOICE_PROFILES.map(v => (
                      <option key={v.id} value={v.id} className="bg-[#0a0a0a]">{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">Language</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.id} value={l.id} className="bg-[#0a0a0a]">{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-on-surface hover:bg-white/5 transition-all"
                >
                  Abort
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-primary text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:brightness-110 shadow-lg shadow-primary/10 transition-all"
                >
                  Confirm Deployment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function StatItem({ icon: Icon, label, value, trend }: any) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
       <div className="flex items-center justify-between mb-4">
         <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-black/40">
           <Icon className="w-5 h-5 text-primary" />
         </div>
         <span className={cn(
           "text-[10px] font-bold px-2 py-0.5 rounded-full border",
           trend.startsWith('+') ? "text-success border-success/20 bg-success/10" : "text-on-surface-variant border-white/10 bg-white/5"
         )}>{trend}</span>
       </div>
       <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant opacity-60">{label}</p>
       <p className="text-3xl font-light text-on-surface mt-1">{value}</p>
    </div>
  );
}

function ProgressItem({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[9px] uppercase tracking-tighter text-on-surface-variant">
        <span>{label}</span>
        <span className="text-on-surface">{value}%</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className="h-full bg-primary/60"
        />
      </div>
    </div>
  );
}
