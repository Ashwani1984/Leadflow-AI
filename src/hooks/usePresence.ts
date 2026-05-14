import { useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export function usePresence() {
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        const presenceRef = doc(db, 'presence', user.uid);
        
        const setOnline = () => setDoc(presenceRef, {
          userId: user.uid,
          name: user.displayName || 'Anonymous',
          avatar: user.photoURL || '',
          isOnline: true,
          lastSeen: serverTimestamp()
        }, { merge: true });

        setOnline();

        // Handle tab visibility
        const handleVisibility = () => {
          if (document.visibilityState === 'visible') {
            setOnline();
          } else {
            setDoc(presenceRef, { isOnline: false, lastSeen: serverTimestamp() }, { merge: true });
          }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        
        return () => {
          document.removeEventListener('visibilitychange', handleVisibility);
          setDoc(presenceRef, { isOnline: false, lastSeen: serverTimestamp() }, { merge: true });
        };
      }
    });

    return () => unsub();
  }, []);
}
