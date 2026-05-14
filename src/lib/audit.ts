import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function logAction(action: string, details: string, status: 'SUCCESS' | 'WARNING' | 'FAILURE' = 'SUCCESS') {
  try {
    await addDoc(collection(db, 'audit_logs'), {
      action,
      details,
      status,
      user: auth.currentUser?.email || 'Anonymous',
      timestamp: serverTimestamp(),
      ip: '192.168.1.1' // Mock IP for UI
    });
  } catch (error) {
    console.error('Failed to log action:', error);
  }
}
