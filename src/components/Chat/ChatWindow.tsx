import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  X, 
  Users, 
  Circle, 
  LogIn,
  MessageCircle,
  MoreVertical,
  Paperclip,
  Smile
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { cn } from '../../lib/utils';

enum FirestoreOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: string;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: string, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function ChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [presence, setPresence] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [user, setUser] = useState(auth.currentUser);
  const [showUsers, setShowUsers] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'), limit(50));
    const unsubMessages = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, FirestoreOperation.LIST, 'messages');
    });

    const unsubPresence = onSnapshot(collection(db, 'presence'), (snapshot) => {
      setPresence(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, FirestoreOperation.LIST, 'presence');
    });

    return () => {
      unsubMessages();
      unsubPresence();
    };
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    try {
      const text = inputText;
      setInputText('');
      await addDoc(collection(db, 'messages'), {
        text,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorAvatar: user.photoURL || '',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, FirestoreOperation.CREATE, 'messages');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[300]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-[400px] h-[600px] bg-surface/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-black/20 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <div 
                  onClick={() => setShowUsers(!showUsers)}
                  className="cursor-pointer hover:bg-white/5 px-2 py-1 rounded-lg transition-all"
                >
                  <h3 className="text-sm font-serif italic text-on-surface">Global Funnel Intelligence</h3>
                  <p className="text-[9px] uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
                    <Circle className={cn("w-1.5 h-1.5 fill-success text-success", presence.some(p => p.isOnline) && "animate-pulse")} />
                    {presence.filter(p => p.isOnline).length} Agents Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user ? (
                  <button 
                    onClick={() => signOut(auth)}
                    className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors"
                    title="Sign Out"
                  >
                    <img src={user.photoURL || ''} alt="" className="w-5 h-5 rounded-full border border-white/10" />
                  </button>
                ) : (
                  <button 
                    onClick={handleLogin}
                    className="text-[9px] font-bold uppercase tracking-widest text-primary flex items-center gap-2"
                  >
                    <LogIn className="w-3 h-3" />
                    Join
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-hidden flex relative">
              {/* Users List Overlay */}
              <AnimatePresence>
                {showUsers && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute inset-0 bg-surface/98 z-50 flex flex-col p-6 overflow-y-auto"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-primary" />
                        <h4 className="text-sm font-serif italic text-on-surface">Active Intelligence Agents</h4>
                      </div>
                      <button 
                        onClick={() => setShowUsers(false)}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-on-surface-variant" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Online Now ({presence.filter(p => p.isOnline).length})</span>
                        <div className="grid gap-3">
                          {presence.filter(p => p.isOnline).map(p => (
                            <div key={p.id} className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl p-3 hover:border-primary/20 transition-all group">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <img src={p.avatar} alt="" className="w-10 h-10 rounded-full border border-primary/20 group-hover:border-primary transition-all p-0.5" />
                                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-[#1a1a1a] rounded-full" />
                                </div>
                                <div>
                                  <p className="text-[11px] font-bold text-on-surface">{p.name}</p>
                                  <p className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold">Active Protocol</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 opacity-50">
                        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Recently Active</span>
                        <div className="grid gap-3">
                          {presence.filter(p => !p.isOnline).slice(0, 5).map(p => (
                            <div key={p.id} className="flex items-center justify-between border border-white/5 rounded-xl p-3">
                              <div className="flex items-center gap-3">
                                <img src={p.avatar} alt="" className="w-10 h-10 rounded-full opacity-50 grayscale" />
                                <div>
                                  <p className="text-[11px] font-bold text-on-surface">{p.name}</p>
                                  <p className="text-[8px] text-on-surface-variant uppercase tracking-widest font-bold">
                                    Last seen {p.lastSeen?.toDate ? p.lastSeen.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className="flex-1 flex flex-col p-4">
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar"
                >
                  {messages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={cn(
                        "flex items-start gap-2 max-w-[85%]",
                        msg.authorId === user?.uid ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      <img src={msg.authorAvatar} alt="" className="w-6 h-6 rounded-full border border-white/5 shrink-0 mt-1" />
                      <div className="space-y-1">
                        <div className={cn(
                          "px-3 py-2 rounded-2xl text-[11px] leading-relaxed",
                          msg.authorId === user?.uid 
                            ? "bg-primary text-black" 
                            : "bg-white/5 border border-white/5 text-on-surface"
                        )}>
                          {msg.text}
                        </div>
                        <p className={cn(
                          "text-[8px] uppercase tracking-widest text-on-surface-variant font-bold px-1",
                          msg.authorId === user?.uid ? "text-right" : "text-left"
                        )}>
                          {msg.authorName.split(' ')[0]} • {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
                      <MessageSquare className="w-12 h-12 mb-4" />
                      <p className="text-sm font-serif italic italic">Establish the objective. Start the conversation.</p>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <form 
                  onSubmit={handleSendMessage}
                  className="mt-4 flex items-center gap-2"
                >
                  <div className="flex-1 relative">
                    <input 
                      disabled={!user}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={user ? "Signal message..." : "Join to participate..."}
                      className="w-full bg-black/40 border border-white/5 rounded-full py-2.5 px-4 pr-10 text-[11px] focus:outline-none focus:border-primary/50 transition-all text-on-surface"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                       <Smile className="w-3.5 h-3.5 text-on-surface-variant cursor-pointer hover:text-primary transition-colors" />
                    </div>
                  </div>
                  <button 
                    disabled={!user || !inputText.trim()}
                    className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-20 disabled:grayscale"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </form>
              </div>

              {/* Sidebar/Presence */}
              <div className="w-16 border-l border-white/5 p-2 bg-black/10 overflow-y-auto hidden sm:block">
                 <div className="flex flex-col items-center gap-3">
                   {presence.filter(p => p.isOnline).map(p => (
                     <div key={p.id} className="relative group">
                       <img 
                         src={p.avatar} 
                         alt={p.name} 
                         className="w-8 h-8 rounded-full border border-primary/20 hover:border-primary transition-all p-0.5" 
                       />
                       <Circle className="absolute bottom-0 right-0 w-2 h-2 fill-success text-black border border-black rounded-full" />
                       <div className="absolute left-0 top-1/2 -translate-x-[110%] -translate-y-1/2 px-2 py-1 bg-black text-white text-[8px] font-bold uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-white/10">
                         {p.name}
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full bg-primary text-black flex items-center justify-center shadow-2xl transition-all relative",
          isOpen ? "rotate-90 scale-90" : "hover:scale-110 active:scale-95"
        )}
      >
        <MessageSquare className="w-6 h-6" />
        {messages.length > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce border-2 border-surface">
            {messages.length > 9 ? '9+' : messages.length}
          </span>
        )}
      </button>
    </div>
  );
}
