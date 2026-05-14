/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { StatCard } from './components/StatCard';
import { LeadTable } from './components/LeadTable';
import { WorkflowView } from './components/WorkflowView';
import { LeadModal } from './components/LeadModal';
import { AIInsightsModal } from './components/AIInsightsModal';
import { TaskDashboard } from './components/TaskDashboard';
import { TaskModal } from './components/TaskModal';
import { DataSourceView } from './components/DataSourceView';
import { SettingsView } from './components/SettingsView';
import { AuditLogView } from './components/AuditLogView';
import { AnalyticsView } from './components/AnalyticsView';
import { DocumentationView } from './components/DocumentationView';
import { ChatWindow } from './components/Chat/ChatWindow';
import { AICallAgentModal } from './components/AICallAgentModal';
import { AICallAgentView } from './components/AICallAgentView';
import { PricingModal } from './components/PricingModal';
import { usePresence } from './hooks/usePresence';
import { motion, AnimatePresence } from 'motion/react';
import { Lead, Task } from './types';
import { db, auth } from './lib/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  getDocFromServer,
  setDoc 
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

const chartData = [
  { value: 10 }, { value: 15 }, { value: 8 }, { value: 20 }, { value: 12 }, { value: 25 }, { value: 18 }
];

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [activeView, setActiveView] = useState('Leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [insightsLead, setInsightsLead] = useState<Lead | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAICallOpen, setIsAICallOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [aiCallLead, setAICallLead] = useState<Lead | null>(null);
  const [aiCallAgent, setAICallAgent] = useState<any>(null);
  const [selectedTaskLeadId, setSelectedTaskLeadId] = useState<string | undefined>(undefined);
  
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  usePresence();

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.error("Auth error:", err);
        }
      } else {
        setIsAuthReady(true);
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    const leadsQuery = query(collection(db, 'leads'), orderBy('dateAdded', 'desc'));
    const unsubLeads = onSnapshot(leadsQuery, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
      setLeads(leadsData);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'leads'));

    const tasksQuery = query(collection(db, 'tasks'));
    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(tasksData);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'tasks'));

    return () => {
      unsubLeads();
      unsubTasks();
    };
  }, [isAuthReady]);

  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.industry.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leads, searchQuery]);

  const handleSaveLead = async (data: Omit<Lead, 'id' | 'dateAdded' | 'avatar'>) => {
    try {
      if (editingLead) {
        await updateDoc(doc(db, 'leads', editingLead.id), data);
        showNotification('Lead profile updated successfully');
        setEditingLead(null);
        const { logAction } = await import('./lib/audit');
        await logAction('LEAD_UPDATED', `Strategic update for lead: ${data.name}`);
      } else {
        const randomPhotoId = [
          '1535713875002-d1d0cf377fde',
          '1494790108377-be9c29b29330',
          '1599566150163-29194dcaad36',
          '1531427186611-ecfd6d936c79',
          '1517841905240-472988babdf9'
        ][Math.floor(Math.random() * 5)];

        const newLead: Omit<Lead, 'id'> = {
          ...data,
          priority: data.priority || 'Medium',
          status: 'PENDING',
          dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          avatar: `https://images.unsplash.com/photo-${randomPhotoId}?w=100&h=100&fit=crop`
        };
        const docRef = await addDoc(collection(db, 'leads'), newLead);
        showNotification('Lead successfully added to pipeline');
        const { logAction } = await import('./lib/audit');
        await logAction('LEAD_CREATED', `New high-value lead captured: ${newLead.name}`);
        // Trigger automatic AI call deployment for the new lead
        setTimeout(() => startAICall({ id: docRef.id, ...newLead } as Lead), 800);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'leads');
    }
  };

  const addLead = () => {
    setEditingLead(null);
    setIsLeadModalOpen(true);
  };

  const editLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsLeadModalOpen(true);
  };

  const showInsights = (lead: Lead) => {
    setInsightsLead(lead);
    setIsInsightsOpen(true);
  };

  const deleteLead = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'leads', id));
      showNotification('Lead removed from database');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `leads/${id}`);
    }
  };

  const runWorkflowSimulation = () => {
    showNotification('Starting Automated Workflow...');
    setActiveWorkflowStep(1);
    
    // Select a random pending lead
    const pendingLeads = leads.filter(l => l.status === 'PENDING');
    if (pendingLeads.length === 0) {
      showNotification('No pending leads to process');
      setActiveWorkflowStep(null);
      return;
    }

    const leadToProcess = pendingLeads[Math.floor(Math.random() * pendingLeads.length)];
    
    const updateLeadStatus = async (status: Lead['status']) => {
      try {
        await updateDoc(doc(db, 'leads', leadToProcess.id), { status });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `leads/${leadToProcess.id}`);
      }
    };

    setTimeout(async () => {
      setActiveWorkflowStep(2);
      await updateLeadStatus('AI ANALYZING');
      showNotification('Step 2: AI Analysis initiated');
    }, 1000);

    setTimeout(async () => {
      setActiveWorkflowStep(3);
      await updateLeadStatus('CALLING');
      showNotification('Step 3: Smart Dialing in progress');
    }, 3000);

    setTimeout(() => {
      setActiveWorkflowStep(4);
      showNotification('Step 4: Personalized Follow-up ready');
    }, 5000);

    setTimeout(() => {
      setActiveWorkflowStep(5);
      showNotification('Step 5: Automated Email Campaign triggered');
    }, 7000);

    setTimeout(async () => {
      await updateLeadStatus('COMPLETED');
      showNotification('Workflow Complete: Lead fully processed');
      setActiveWorkflowStep(null);
    }, 9000);
  };

  const simulateInboundLead = async () => {
    const industries = ['Fintech', 'SaaS', 'HealthTech', 'E-commerce', 'EdTech'];
    const names = ['Sarah Chen', 'Marc Andreessen', 'Elon Muskoid', 'Jane Foster', 'Peter Parker'];
    const priorities: Lead['priority'][] = ['Low', 'Medium', 'High'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    
    const newLead: Omit<Lead, 'id'> = {
      name: randomName,
      email: `${randomName.toLowerCase().replace(' ', '.')}@gmail.com`,
      status: 'PENDING',
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      industry: industries[Math.floor(Math.random() * industries.length)],
      website: `${randomName.toLowerCase().replace(' ', '')}.io`,
      phone: `+1555${Math.floor(1000000 + Math.random() * 9000000)}`,
      dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=100&h=100&fit=crop`
    };
    
    try {
      await addDoc(collection(db, 'leads'), newLead);
      showNotification('System: New Inbound Lead Captured! [Source: Webform Alpha]');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'leads');
    }
  };

  const handleCreateTask = async (data: Omit<Task, 'id'>) => {
    try {
      await addDoc(collection(db, 'tasks'), data);
      showNotification('Action item assigned and stabilized');
      setSelectedTaskLeadId(undefined);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'tasks');
    }
  };

  const addTaskToLead = (lead: Lead) => {
    setSelectedTaskLeadId(lead.id);
    setIsTaskModalOpen(true);
  };

  const startAICall = async (lead: Lead, agent?: any) => {
    setAICallLead(lead);
    setAICallAgent(agent || null);
    setIsAICallOpen(true);
    try {
      await updateDoc(doc(db, 'leads', lead.id), { status: 'CALLING' });
      showNotification(`AI Voice Agent ${agent?.name || ''} deployed for ${lead.name}`);
      const { logAction } = await import('./lib/audit');
      await logAction('CALL_INITIATED', `Autonomous call sequence started for ${lead.name} using ${agent?.name || 'Standard'} protocol`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `leads/${lead.id}`);
    }
  };

  const toggleTaskStatus = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const nextStatus: Task['status'] = task.status === 'COMPLETED' ? 'TODO' : 
                     task.status === 'TODO' ? 'IN_PROGRESS' : 'COMPLETED';

    try {
      await updateDoc(doc(db, 'tasks', id), { status: nextStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${id}`);
    }
  };

  const renderContent = () => {
    if (!isAuthReady) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-surface text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
          <h2 className="text-2xl font-serif text-on-surface italic mb-2">Leadflow AI</h2>
          <p className="text-on-surface-variant text-sm uppercase tracking-widest font-bold">Synchronizing Secure Protocols...</p>
        </div>
      );
    }

    if (activeView === 'Workflows' || activeView === 'Automation Builder' || activeView === 'Automations') {
      return (
        <WorkflowView 
          onRunTest={runWorkflowSimulation} 
          activeStepId={activeWorkflowStep} 
          onSimulateLead={simulateInboundLead}
        />
      );
    }

    if (activeView === 'Tasks' || activeView === 'Strategic Objectives') {
      return (
        <TaskDashboard 
          tasks={tasks} 
          leads={leads} 
          onToggleTask={toggleTaskStatus} 
          onAddTask={() => setIsTaskModalOpen(true)} 
        />
      );
    }

    if (activeView === 'Data Sources') {
      return <DataSourceView />;
    }

    if (activeView === 'API Keys') {
      return <SettingsView />;
    }

    if (activeView === 'AI Call Agents') {
      return <AICallAgentView onStartDemoCall={(agent) => leads[0] && startAICall(leads[0], agent)} />;
    }

    if (activeView === 'Audit Logs') {
      return <AuditLogView />;
    }

    if (activeView === 'Documentation') {
      return <DocumentationView />;
    }

    if (activeView === 'Analytics') {
      return <AnalyticsView />;
    }

    if (activeView !== 'Leads' && activeView !== 'Lead Pipeline' && activeView !== 'Dashboard' && activeView !== 'Overview') {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[60vh] text-center"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary mb-4 block">Module Initializing</span>
          <h2 className="text-4xl font-serif text-on-surface mb-2 italic">The {activeView} Portal</h2>
          <p className="text-on-surface-variant text-sm max-w-sm">Access to this high-security partition is being provisioned for your identity. Please standby.</p>
        </motion.div>
      );
    }

    return (
      <>
        <header className="mb-12 flex items-start justify-between">
          <div className="max-w-2xl">
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary mb-4 block">Dashboard Overview</span>
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-serif text-on-surface mb-4 leading-tight"
            >
              Lead Pipeline <span className="italic font-light opacity-60">& Management</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-on-surface-variant text-sm leading-relaxed max-w-lg"
            >
              Real-time management of identified prospects and AI-driven engagement status. Your automated systems are currently performing within target parameters.
            </motion.p>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-6 flex flex-col items-end">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-none">Lead Volume (7D)</span>
              <span className="text-[10px] font-bold text-primary leading-none">+14.2% Growth</span>
            </div>
            <div className="flex items-baseline gap-6">
              <div className="flex items-end gap-1.5 h-10">
                {[20, 45, 30, 60, 40, 80, 50].map((h, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-primary/40 rounded-full" 
                    style={{ height: `${h}%` }} 
                  />
                ))}
              </div>
              <div className="text-right">
                <div className="text-3xl font-light text-on-surface leading-tight tracking-tight">{leads.length.toLocaleString()} <span className="text-xs uppercase text-on-surface-variant">total</span></div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <StatCard 
              label="Total Leads" 
              value="12,845" 
              subValue="/ mo" 
              type="leads"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <StatCard 
              label="Conversion Rate" 
              value="18.4%" 
              trend="+2.1%"
              type="conversion"
              chartData={chartData}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <StatCard 
              label="Active AI Calls" 
              value="42" 
              type="calls"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <StatCard 
              label="Avg. Response Time" 
              value="0.8s" 
              type="response"
            />
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <LeadTable 
            leads={filteredLeads} 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddLead={addLead}
            onEditLead={editLead}
            onDeleteLead={deleteLead}
            onShowInsights={showInsights}
            onAddTaskToLead={addTaskToLead}
            onStartAICall={startAICall}
          />
        </motion.div>
      </>
    );
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <main className="flex-1 ml-64 pt-24">
        <Topbar 
          activeView={activeView} 
          onViewChange={setActiveView} 
          onDeploy={() => showNotification('AI Engine Deployment Initialized')}
          onUpgrade={() => setIsPricingOpen(true)}
        />
        
        <div className="p-10 max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-primary text-black px-8 py-3 rounded-sm font-bold text-[10px] uppercase tracking-[0.2em] shadow-2xl border border-black/10"
            >
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        <LeadModal 
          isOpen={isLeadModalOpen} 
          onClose={() => {
            setIsLeadModalOpen(false);
            setEditingLead(null);
          }} 
          onSubmit={handleSaveLead} 
          initialData={editingLead}
        />

        <AIInsightsModal 
          isOpen={isInsightsOpen}
          onClose={() => {
            setIsInsightsOpen(false);
            setInsightsLead(null);
          }}
          lead={insightsLead}
          tasks={tasks}
        />

        <TaskModal 
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTaskLeadId(undefined);
          }}
          onSubmit={handleCreateTask}
          leads={leads}
          selectedLeadId={selectedTaskLeadId}
        />

        <AICallAgentModal 
          isOpen={isAICallOpen}
          onClose={() => {
            setIsAICallOpen(false);
            setAICallLead(null);
            setAICallAgent(null);
          }}
          lead={aiCallLead}
          agent={aiCallAgent}
        />

        <PricingModal 
          isOpen={isPricingOpen}
          onClose={() => setIsPricingOpen(false)}
        />

        <ChatWindow />
      </main>
    </div>
  );
}

