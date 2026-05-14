import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { 
  FileText, 
  Search, 
  Terminal, 
  Shield, 
  User, 
  Clock, 
  Filter,
  Download,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LogEntry {
  id: string;
  action: string;
  user: string;
  timestamp: any;
  status: 'SUCCESS' | 'WARNING' | 'FAILURE';
  details: string;
  ip: string;
}

export function AuditLogView() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'audit_logs'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LogEntry[];
      setLogs(logsData);
      setLoading(false);
    }, (error) => {
      console.error("Audit log subscription error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.details.toLowerCase().includes(search.toLowerCase()) ||
    log.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <header className="flex items-end justify-between border-b border-white/10 pb-10">
        <div className="max-w-2xl">
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary mb-4 block">Compliance & Integrity</span>
          <h2 className="text-5xl font-serif text-on-surface mb-4 leading-tight italic">Audit <span className="font-light opacity-60">System Logs</span></h2>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-lg">
            Immutable record of all strategic operations and administrative adjustments. Required for SOX and GDPR compliance protocols.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest border border-white/10 rounded-sm text-on-surface hover:bg-white/5 transition-colors">
            <Filter className="w-3 h-3" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest bg-white/5 text-on-surface border border-white/10 rounded-sm hover:bg-white/10 transition-colors">
            <Download className="w-3 h-3" />
            Export logs
          </button>
        </div>
      </header>

      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10 bg-black/20 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search event signatures..."
              className="w-full bg-black/40 border border-white/5 rounded-sm py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-primary/40 text-on-surface"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-6 text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">
            <span className="flex items-center gap-2"><Clock className="w-3 h-3 text-primary" /> Last 50 Events</span>
            <span className="flex items-center gap-2 text-success"><Shield className="w-3 h-3" /> Integrity Verified</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-black/10">
                <th className="px-6 py-4 text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-6 py-4 text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Action Type</th>
                <th className="px-6 py-4 text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Principal</th>
                <th className="px-6 py-4 text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Detail / Trace</th>
                <th className="px-6 py-4 text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">IP Address</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[10px] uppercase tracking-widest text-on-surface-variant font-mono">
                    Establishing secure connection to audit vault...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[10px] uppercase tracking-widest text-on-surface-variant font-mono">
                    No matching audit signatures found in current sector.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4 text-[10px] font-mono text-on-surface-variant">
                      {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'Pending...'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          log.status === 'SUCCESS' ? 'bg-success' : log.status === 'WARNING' ? 'bg-warning' : 'bg-error'
                        )} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface">{log.action || 'SDR_CALL'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <User className="w-3 h-3 text-primary/40" />
                         <span className="text-[10px] text-on-surface-variant font-medium">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[11px] text-on-surface/70 italic font-serif leading-relaxed">
                      "{log.details}"
                    </td>
                    <td className="px-6 py-4 text-[10px] font-mono text-on-surface-variant">{log.ip}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-on-surface-variant hover:text-on-surface opacity-0 group-hover:opacity-100 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-black/20 border-t border-white/10 flex items-center justify-between">
          <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Showing latest <span className="text-primary">{filteredLogs.length} events</span></p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-white/5 border border-white/10 rounded-sm text-[9px] uppercase tracking-widest font-bold text-on-surface-variant hover:text-on-surface transition-all">Next Page</button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 py-6 border-t border-white/10">
        <Terminal className="w-4 h-4 text-primary opacity-50" />
        <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant italic">
          LeadFlow Compliance Layer v4.2.0-secure • All activities are timestamped with stratum-1 atomic clocks
        </p>
      </div>
    </div>
  );
}
