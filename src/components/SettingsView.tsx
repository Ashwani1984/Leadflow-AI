import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  RotateCw, 
  ShieldCheck, 
  AlertTriangle,
  Lock,
  Globe
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  status: 'ACTIVE' | 'REVOKED';
}

const INITIAL_KEYS: ApiKey[] = [
  {
    id: '1',
    name: 'Production - Global AI',
    key: 'sk_live_51M0...9x2a',
    created: 'Oct 12, 2023',
    lastUsed: '4 mins ago',
    status: 'ACTIVE'
  },
  {
    id: '2',
    name: 'Development - Staging',
    key: 'sk_test_24A...7b8c',
    created: 'Nov 01, 2023',
    lastUsed: '2 days ago',
    status: 'ACTIVE'
  },
  {
    id: '3',
    name: 'Legacy - V1 Connector',
    key: 'sk_live_12X...3y4z',
    created: 'Jan 15, 2023',
    lastUsed: '6 months ago',
    status: 'REVOKED'
  }
];

export function SettingsView() {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [showKeyId, setShowKeyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleShowKey = (id: string) => {
    setShowKeyId(showKeyId === id ? null : id);
  };

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const addKey = async () => {
    const newId = (Math.max(...keys.map(k => parseInt(k.id)), 0) + 1).toString();
    const newKey: ApiKey = {
      id: newId,
      name: `Integrations Key ${newId}`,
      key: `sk_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      lastUsed: 'Never',
      status: 'ACTIVE'
    };
    setKeys([newKey, ...keys]);
    const { logAction } = await import('../lib/audit');
    await logAction('API_KEY_CREATED', `Generated new integration key: ${newKey.name}`);
  };

  const revokeKey = async (id: string) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'REVOKED' } : k));
    const key = keys.find(k => k.id === id);
    const { logAction } = await import('../lib/audit');
    await logAction('API_KEY_REVOKED', `Revoked access for key: ${key?.name}`, 'WARNING');
  };

  const rotateKey = async (id: string) => {
    setKeys(prev => prev.map(k => {
      if (k.id === id) {
        return {
          ...k,
          key: `sk_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
          lastUsed: 'Just now'
        };
      }
      return k;
    }));
    const key = keys.find(k => k.id === id);
    const { logAction } = await import('../lib/audit');
    await logAction('API_KEY_ROTATED', `Rotated security credentials for key: ${key?.name}`);
  };

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between border-b border-white/10 pb-10">
        <div className="max-w-2xl">
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary mb-4 block">Security & Access</span>
          <h2 className="text-5xl font-serif text-on-surface mb-4 leading-tight italic">API <span className="font-light opacity-60">Credentials</span></h2>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-lg">
            Manage authentication tokens for programmatic access to the LeadFlow engine. All keys are encrypted at rest with AES-256.
          </p>
        </div>
        
        <button 
          onClick={addKey}
          className="flex items-center gap-2 px-8 py-3 bg-primary text-black text-[10px] font-bold uppercase tracking-widest rounded-sm hover:brightness-110 transition-colors shadow-lg shadow-primary/20"
        >
          <Lock className="w-3 h-3" />
          Generate New Key
        </button>
      </header>

      <div className="grid gap-4">
        {keys.map((key) => (
          <motion.div
            key={key.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.03] border border-white/10 rounded-xl p-6 flex items-center justify-between group hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-6">
              <div className={cn(
                "w-12 h-12 rounded-full border flex items-center justify-center transition-all",
                key.status === 'ACTIVE' ? "border-primary/20 bg-primary/5 text-primary" : "border-white/5 bg-white/5 text-on-surface-variant"
              )}>
                <Key className="w-5 h-5" />
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-on-surface font-serif italic text-lg leading-none">{key.name}</h4>
                  <span className={cn(
                    "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm border",
                    key.status === 'ACTIVE' ? "border-success/30 text-success bg-success/10" : "border-white/10 text-on-surface-variant bg-white/5"
                  )}>
                    {key.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">
                  <span>Created: {key.created}</span>
                  <span className="w-1 h-1 bg-white/10 rounded-full" />
                  <span>Last used: {key.lastUsed}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-black/40 border border-white/5 rounded-sm px-4 py-2 font-mono text-xs text-on-surface-variant">
                <span className="mr-4">{showKeyId === key.id ? key.key : '••••••••••••••••••••'}</span>
                <div className="flex items-center gap-2 border-l border-white/10 pl-4 ml-2">
                  <button 
                    onClick={() => toggleShowKey(key.id)}
                    className="hover:text-primary transition-colors"
                  >
                    {showKeyId === key.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button 
                    onClick={() => copyKey(key.id, key.key)}
                    className="hover:text-primary transition-colors"
                  >
                    {copiedId === key.id ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => rotateKey(key.id)}
                className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                title="Rotate Key"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => revokeKey(key.id)}
                className="p-2 text-on-surface-variant hover:text-error transition-colors"
                title="Revoke Key"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
          <ShieldCheck className="w-8 h-8 text-success opacity-60" />
          <h5 className="text-[10px] font-bold uppercase tracking-widest text-on-surface">Auto-Rotation</h5>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Every 90 days, active keys are automatically rotated to prevent long-term credential exposure.
          </p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
          <AlertTriangle className="w-8 h-8 text-warning opacity-60" />
          <h5 className="text-[10px] font-bold uppercase tracking-widest text-on-surface">Threat Detection</h5>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Our AI monitors API traffic for unusual patterns, automatically revoking keys if abnormal behavior is detected.
          </p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
          <Globe className="w-8 h-8 text-primary opacity-60" />
          <h5 className="text-[10px] font-bold uppercase tracking-widest text-on-surface">IP Whitelisting</h5>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Restrict API access to specific CIDR blocks or geography to harden your production environment.
          </p>
        </div>
      </div>
    </div>
  );
}
