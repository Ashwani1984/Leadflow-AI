import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Sparkles, ArrowUpDown, ArrowUp, ArrowDown, Flag, CheckSquare, Phone, MessageCircle, Mic, Mail } from 'lucide-react';
import { Lead, Priority } from '../types';
import { cn } from '../lib/utils';

interface LeadTableProps {
  leads: Lead[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddLead: () => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onShowInsights: (lead: Lead) => void;
  onAddTaskToLead: (lead: Lead) => void;
  onStartAICall: (lead: Lead) => void;
}

export function LeadTable({ leads, searchQuery, onSearchChange, onAddLead, onEditLead, onDeleteLead, onShowInsights, onAddTaskToLead, onStartAICall }: LeadTableProps) {
  const [sortField, setSortField] = useState<'priority' | 'dateAdded' | 'name' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const priorityOrder: Record<Priority, number> = {
    High: 3,
    Medium: 2,
    Low: 1
  };

  const sortedLeads = useMemo(() => {
    if (!sortField) return leads;

    return [...leads].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'priority') {
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortField === 'dateAdded') {
        comparison = new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [leads, sortField, sortDirection]);

  const toggleSort = (field: 'priority' | 'dateAdded' | 'name') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Status', 'Priority', 'Industry', 'Website', 'Phone', 'Date Added'];
    const csvData = sortedLeads.map(l => [
      `"${l.name}"`,
      `"${l.email}"`,
      `"${l.status}"`,
      `"${l.priority}"`,
      `"${l.industry}"`,
      `"${l.website}"`,
      `"${l.phone || ''}"`,
      `"${l.dateAdded}"`
    ].join(','));
    
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SortIcon = ({ field }: { field: 'priority' | 'dateAdded' | 'name' }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />;
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden mt-12 shadow-2xl">
      <div className="p-8 border-b border-white/10 flex flex-wrap items-center justify-between gap-6 bg-black/20">
        <div className="flex items-center gap-6">
          <h3 className="font-serif italic text-xl pr-6 border-r border-white/10">Active Pipeline</h3>
          <div className="relative">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input 
              type="text" 
              placeholder="Search records..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 bg-black/40 border border-white/5 rounded-sm text-xs w-64 focus:outline-none focus:border-primary/50 transition-all placeholder:text-on-surface-variant"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest border border-white/10 rounded-sm text-on-surface hover:bg-white/5 transition-colors">
            <Filter className="w-3 h-3" />
            Filters
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest border border-white/10 rounded-sm text-on-surface hover:bg-white/5 transition-colors"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
          <button 
            onClick={onAddLead}
            className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest bg-primary text-black rounded-sm hover:brightness-110 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Lead
          </button>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 bg-black/10">
              <th 
                className="px-8 py-5 text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em] cursor-pointer hover:text-on-surface transition-colors"
                onClick={() => toggleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Contact Information
                  <SortIcon field="name" />
                </div>
              </th>
              <th className="px-8 py-5 text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Current State</th>
              <th 
                className="px-8 py-5 text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em] cursor-pointer hover:text-on-surface transition-colors"
                onClick={() => toggleSort('priority')}
              >
                <div className="flex items-center gap-2">
                  Priority
                  <SortIcon field="priority" />
                </div>
              </th>
              <th className="px-8 py-5 text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Industry Verticals</th>
              <th className="px-8 py-5 text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Resource URL</th>
              <th 
                className="px-8 py-5 text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em] cursor-pointer hover:text-on-surface transition-colors"
                onClick={() => toggleSort('dateAdded')}
              >
                <div className="flex items-center gap-2">
                  Timestamp
                  <SortIcon field="dateAdded" />
                </div>
              </th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {sortedLeads.length > 0 ? (
              sortedLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full border border-white/10 p-0.5">
                        <img src={lead.avatar} className="w-full h-full rounded-full grayscale hover:grayscale-0 transition-all duration-500" alt="" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-on-surface tracking-tight">{lead.name}</div>
                        <div className="text-[10px] uppercase tracking-tighter text-on-surface-variant font-mono opacity-60">{lead.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-8 py-5">
                    <PriorityBadge priority={lead.priority} />
                  </td>
                  <td className="px-8 py-5 text-[11px] font-medium text-on-surface/80 uppercase tracking-wider">{lead.industry}</td>
                  <td className="px-8 py-5 text-[10px] font-serif italic text-primary/60">{lead.website}</td>
                  <td className="px-8 py-5 text-[11px] text-on-surface-variant">{lead.dateAdded}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onShowInsights(lead)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-full transition-all"
                        title="AI Insights"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onStartAICall(lead)}
                        className="p-2 text-primary/80 hover:text-primary transition-colors"
                        title="Start AI Voice Call Automation"
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                      {lead.phone && (
                        <>
                          <a 
                            href={`tel:${lead.phone}`}
                            className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                            title={`Call ${lead.name}`}
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                          <a 
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-on-surface-variant hover:text-success transition-colors"
                            title={`WhatsApp ${lead.name}`}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </>
                      )}
                      <button 
                        onClick={() => onAddTaskToLead(lead)}
                        className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                        title="Add Task"
                      >
                        <CheckSquare className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          window.location.href = `mailto:${lead.email}?subject=Collaboration Inquiry&body=Hi ${lead.name},\n\nI'd like to discuss how we can help ${lead.industry} thrive.`;
                        }}
                        className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                        title="Send Email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onEditLead(lead)}
                        className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteLead(lead.id)}
                        className="p-2 text-on-surface-variant hover:text-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-8 py-20 text-center text-on-surface-variant text-xs">
                  No records found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-8 border-t border-white/10 flex items-center justify-between bg-black/20">
        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant italic">
          Database Records <span className="text-on-surface px-2">{sortedLeads.length}</span> active prospects in pipeline
        </span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Lead['status'] }) {
  const styles = {
    'AI ANALYZING': "text-primary border-primary/20 bg-primary/10",
    'CALLING': "text-primary border-primary/20 bg-primary/10",
    'COMPLETED': "text-on-surface border-white/20 bg-white/5",
    'PENDING': "text-on-surface-variant border-white/10 bg-white/5",
  };

  let customStyle = styles[status];
  let dotColor = "bg-current";

  if (status === 'AI ANALYZING') {
    customStyle = "text-primary border-primary/30 bg-primary/10 border font-serif italic lowercase tracking-wider normal-case";
    dotColor = "bg-primary animate-pulse";
  } else if (status === 'CALLING') {
    customStyle = "text-primary border-primary/30 bg-primary/10 border font-serif italic lowercase tracking-wider normal-case";
    dotColor = "bg-primary";
  } else if (status === 'COMPLETED') {
    customStyle = "text-on-surface/80 border-white/10 bg-white/5 border uppercase";
    dotColor = "bg-white/40";
  } else {
    customStyle = "text-on-surface-variant border-white/5 bg-white/[0.02] border uppercase";
    dotColor = "bg-white/20";
  }

  return (
    <div className={cn("inline-flex items-center gap-2 px-4 py-1 rounded-sm text-[10px] font-medium tracking-widest border", customStyle)}>
      <div className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
      {status}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const styles = {
    High: "text-error border-error/20 bg-error/10",
    Medium: "text-primary border-primary/20 bg-primary/10",
    Low: "text-on-surface-variant border-white/10 bg-white/5"
  };

  return (
    <div className={cn("inline-flex items-center gap-2 px-4 py-1 rounded-sm text-[10px] font-bold tracking-widest border border-white/5 uppercase", styles[priority])}>
      <Flag className={cn("w-2.5 h-2.5", priority === 'High' ? "fill-error" : "fill-none")} />
      {priority}
    </div>
  );
}
