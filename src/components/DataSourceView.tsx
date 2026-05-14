import React from 'react';
import { motion } from 'motion/react';
import { 
  Database, 
  Linkedin, 
  Globe, 
  Link as LinkIcon, 
  Slack, 
  Github,
  FileJson, 
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';

interface DataSource {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'MAINTENANCE';
  type: string;
  lastSync?: string;
  coverage?: string;
}

const SOURCES: DataSource[] = [
  {
    id: 'linkedin-api',
    name: 'LinkedIn Sales Navigator',
    description: 'Direct pipeline for professional networking and prospect identification.',
    icon: Linkedin,
    status: 'CONNECTED',
    type: 'Professional Network',
    lastSync: '12 mins ago',
    coverage: 'Global / Enterprise'
  },
  {
    id: 'clearbit-enrichment',
    name: 'Clearbit Enrichment',
    description: 'Advanced firmographic data and real-time email verification.',
    icon: Database,
    status: 'CONNECTED',
    type: 'Data Enrichment',
    lastSync: '2 hours ago',
    coverage: 'Fortune 500'
  },
  {
    id: 'web-scraper-alpha',
    name: 'Web Scraper Alpha',
    description: 'Custom crawler for tracking real-time industry website changes.',
    icon: Globe,
    status: 'MAINTENANCE',
    type: 'Web Intelligence',
    lastSync: 'Never',
    coverage: 'SaaS / Tech'
  },
  {
    id: 'google-maps-api',
    name: 'Google Maps Places',
    description: 'Local business intelligence and geographic lead segmentation.',
    icon: Search,
    status: 'CONNECTED',
    type: 'Local Intelligence',
    lastSync: 'Active',
    coverage: 'International'
  },
  {
    id: 'slack-hooks',
    name: 'Slack Internal Sync',
    description: 'Automated notification and internal collaboration bridge.',
    icon: Slack,
    status: 'DISCONNECTED',
    type: 'Communication',
    coverage: 'Team Internal'
  },
  {
    id: 'custom-webhook',
    name: 'Custom JSON Webhook',
    description: 'Programmable endpoint for ingesting external proprietary data.',
    icon: FileJson,
    status: 'DISCONNECTED',
    type: 'Custom Ingest',
    coverage: 'Protocol Specific'
  },
  {
    id: 'github-repo',
    name: 'GitHub Repository Sync',
    description: 'Intelligence extraction from technical repositories and contribution patterns.',
    icon: Github,
    status: 'DISCONNECTED',
    type: 'Code Intelligence',
    coverage: 'Enterprise'
  }
];

export function DataSourceView() {
  const [sources, setSources] = React.useState(SOURCES);

  const toggleConnection = async (id: string) => {
    const source = sources.find(s => s.id === id);
    if (!source) return;

    const isConnecting = source.status !== 'CONNECTED';
    const newStatus = isConnecting ? 'CONNECTED' : 'DISCONNECTED';

    setSources(prev => prev.map(s => s.id === id ? { 
      ...s, 
      status: newStatus,
      lastSync: isConnecting ? 'Just now' : s.lastSync 
    } : s));

    const { logAction } = await import('../lib/audit');
    await logAction(
      isConnecting ? 'DATA_SOURCE_CONNECTED' : 'DATA_SOURCE_DISCONNECTED',
      `${isConnecting ? 'Established secure handshake with' : 'Terminated connection to'} ${source.name}`,
      isConnecting ? 'SUCCESS' : 'WARNING'
    );
  };

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between border-b border-white/10 pb-10">
        <div className="max-w-2xl">
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary mb-4 block">Intelligent Ingestion</span>
          <h2 className="text-5xl font-serif text-on-surface mb-4 leading-tight italic">Data <span className="font-light opacity-60">Sources</span></h2>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-lg">
            Manage your high-fidelity signals. CONNECT and synchronize external platforms to feed the LeadFlow AI core with real-time intelligence.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest border border-white/10 rounded-sm text-on-surface hover:bg-white/5 transition-colors">
            <RefreshCw className="w-3 h-3" />
            Sync All
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest bg-primary text-black rounded-sm hover:brightness-110 transition-colors shadow-lg shadow-primary/20">
            <Plus className="w-3 h-3" />
            Add Provider
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.map((source, index) => (
          <motion.div
            key={source.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-primary/40 transition-all flex flex-col h-full overflow-hidden"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center group-hover:border-primary/30 transition-all">
                <source.icon className="w-6 h-6 text-primary" />
              </div>
              <StatusBadge status={source.status} />
            </div>

            <div className="space-y-1 mb-4 flex-1">
              <h3 className="text-lg font-serif italic text-on-surface flex items-center gap-2 group-hover:text-primary transition-colors">
                {source.name}
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-medium">{source.type}</p>
              <p className="text-xs text-on-surface-variant leading-relaxed mt-4">
                {source.description}
              </p>
            </div>

            <div className="space-y-3 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Coverage</span>
                <span className="text-[10px] text-on-surface font-medium">{source.coverage}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Last Sync</span>
                <span className="text-[10px] text-primary/80 font-mono italic">{source.lastSync || 'N/A'}</span>
              </div>
            </div>

            <button 
              onClick={() => toggleConnection(source.id)}
              className={cn(
              "mt-6 w-full py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all",
              source.status === 'CONNECTED' 
                ? "bg-white/5 border border-white/10 text-on-surface hover:bg-white/10" 
                : "bg-primary text-black hover:brightness-110"
            )}>
              {source.status === 'CONNECTED' ? 'Disconnect Source' : 'Connect Provider'}
            </button>
            
            {/* Background Glow */}
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/10 transition-all" />
          </motion.div>
        ))}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 flex items-center gap-8">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center shrink-0 border border-primary/30">
          <LinkIcon className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="text-xl font-serif italic text-on-surface mb-1">Custom API Bridging</h4>
          <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            Require a specialized connection? Our engineers can build custom adapters for your proprietary internal systems or unusual database architectures.
          </p>
        </div>
        <button className="px-8 py-3 glass hover:bg-white/5 text-on-surface font-bold text-[10px] uppercase tracking-widest rounded-sm border border-white/10 transition-all">
          Request Adapter
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: DataSource['status'] }) {
  const styles = {
    CONNECTED: "text-success border-success/20 bg-success/10",
    DISCONNECTED: "text-on-surface-variant border-white/10 bg-white/5",
    ERROR: "text-error border-error/20 bg-error/10",
    MAINTENANCE: "text-primary border-primary/20 bg-primary/10"
  };

  const icons = {
    CONNECTED: CheckCircle2,
    DISCONNECTED: AlertCircle,
    ERROR: AlertCircle,
    MAINTENANCE: RefreshCw
  };

  const Icon = icons[status];

  return (
    <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-sm text-[9px] font-bold tracking-widest border uppercase", styles[status])}>
      <Icon className={cn("w-2.5 h-2.5", status === 'MAINTENANCE' && 'animate-spin')} />
      {status}
    </div>
  );
}
