import React from 'react';
import { motion } from 'motion/react';
import { 
  Book, 
  Code, 
  Terminal, 
  Shield, 
  Zap, 
  Cpu, 
  Globe, 
  Lock,
  ChevronRight,
  ExternalLink,
  Search
} from 'lucide-react';

export function DocumentationView() {
  const sections = [
    {
      title: "Core Infrastructure",
      icon: Cpu,
      items: [
        "System Architecture & Scalability",
        "Security & Encryption Protocols",
        "Global CDN Configuration",
        "Database Sharding Strategies"
      ]
    },
    {
      title: "AI Call Logic",
      icon: Zap,
      items: [
        "Natural Language Processing (NLP)",
        "Voice Synthesis Profiles",
        "Sentiment Analysis Real-time Tuning",
        "Autonomous Decision Trees"
      ]
    },
    {
      title: "Integration & API",
      icon: Code,
      items: [
        "RESTful API Documentation",
        "Webhook Event Payloads",
        "GitHub Repository Integration",
        "Available Client Library SDKs"
      ]
    },
    {
      title: "CI/CD & Deployment",
      icon: Globe,
      items: [
        "GitHub Actions Workflow",
        "Production Environment Sync",
        "Version Control Best Practices",
        "Automated Rollback Triggers"
      ]
    },
    {
      title: "Compliance & Security",
      icon: Shield,
      items: [
        "SOC2 Type II Compliance",
        "GDPR Data Privacy Standards",
        "Audit Log Management",
        "Access Control Lists (ACL)"
      ]
    }
  ];

  return (
    <div className="space-y-12 pb-20">
      <header className="flex items-end justify-between border-b border-white/10 pb-10">
        <div className="max-w-2xl">
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary mb-4 block">Central Knowledge Base</span>
          <h2 className="text-5xl font-serif text-on-surface mb-4 leading-tight italic">Technical <span className="font-light opacity-60">Documentation</span></h2>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-lg">
            Comprehensive guides and strategic manuals for the LeadFlow Autonomous Outreach cluster. Designed for technical leads and system architects.
          </p>
        </div>

        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Search manifests..."
            className="w-full bg-black/20 border border-white/10 rounded-sm py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-primary/40 text-on-surface"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 hover:bg-white/[0.04] transition-all group"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <section.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif italic text-on-surface">{section.title}</h3>
            </div>
            
            <div className="space-y-3">
              {section.items.map((item) => (
                <button 
                  key={item}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all text-left group/item"
                >
                  <span className="text-sm text-on-surface/70 group-hover/item:text-on-surface transition-colors">{item}</span>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover/item:text-primary transition-all group-hover/item:translate-x-1" />
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <section className="bg-black/40 border border-primary/20 rounded-3xl p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <Book className="w-48 h-48 text-primary" />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-primary mb-4 block">Quick Start Protocols</span>
            <h3 className="text-3xl font-serif italic text-on-surface mb-6">Deploying Your First Autonomous Cluster</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
              Learn how to initialize the LeadFlow SDK, authenticate with your restricted API keys, and deploy your first voice synthesis agent in under 5 minutes.
            </p>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-primary text-black text-[10px] font-bold uppercase tracking-widest rounded-sm hover:brightness-110 active:scale-95 transition-all">
                Read Tutorial
              </button>
              <button className="px-6 py-3 flex items-center gap-2 border border-white/10 text-on-surface text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-white/5 transition-all">
                API Reference <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <div className="bg-black/60 rounded-xl border border-white/5 p-6 font-mono text-[11px] text-on-surface/80">
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="ml-2 text-on-surface-variant italic">bash — deploy_node.sh</span>
            </div>
            <p className="text-primary mb-1">$ npm install @leadflow/sdk</p>
            <p className="opacity-60 mb-3"># Initializing strategic handshake...</p>
            <p className="text-on-surface mb-1"><span className="text-primary">const</span> sdk = <span className="text-primary">new</span> LeadFlow(&#123;</p>
            <p className="pl-4">apiKey: <span className="text-success">process.env.LF_SECURE_KEY</span>,</p>
            <p className="pl-4">clusterId: <span className="text-warning">'atl-01-vortex'</span></p>
            <p className="text-on-surface">&#125;);</p>
            <p className="text-on-surface mt-3">sdk.agents.deploy(<span className="text-warning">'SDR-ALPHA'</span>);</p>
            <p className="text-success mt-4">✓ Deployment stabilized. SDR ACTIVE.</p>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-center gap-6 py-10 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Version 4.8.2-Stable</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-white/20" />
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Last Update: May 2026</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-white/20" />
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Restricted Access Data</span>
        </div>
      </div>
    </div>
  );
}
