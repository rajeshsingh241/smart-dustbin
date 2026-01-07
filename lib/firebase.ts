import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { getDatabase, ref, onValue, set, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);

export const alertsCollection = collection(db, 'alerts');

export const listenToDustbinUpdates = (callback: (data: any) => void) => {
  const dustbinsRef = ref(realtimeDb, 'dustbins');
  return onValue(dustbinsRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

export const updateDustbinData = async (dustbinId: string, fillLevel: number) => {
  const dustbinRef = ref(realtimeDb, `dustbins/${dustbinId}`);
  const status = fillLevel >= 80 ? 'critical' : fillLevel >= 50 ? 'warning' : 'normal';
  
  await set(dustbinRef, {
    fillLevel,
    lastUpdated: new Date().toISOString(),
    status
  });
  
  return { success: true };
};

export const getAllDustbins = async () => {
  const dustbinsRef = ref(realtimeDb, 'dustbins');
  const snapshot = await get(dustbinsRef);
  
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

export const createAlert = async (alertData: any) => {
  return await addDoc(alertsCollection, {
    ...alertData,
    timestamp: new Date().toISOString(),
    status: 'sent'
  });
};

export const getAlerts = async () => {
  const q = query(alertsCollection, orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};