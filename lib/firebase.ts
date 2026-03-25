import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
  getDoc,
  DocumentData,
} from "firebase/firestore";
import {
  getDatabase,
  ref,
  onValue,
  set,
  get,
  DatabaseReference,
} from "firebase/database";

// Type definitions
export interface UserData {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface DustbinData {
  id: string;
  fillLevel: number;
  lastUpdated: string;
  status: "normal" | "warning" | "critical";
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  zone?: string;
  capacity?: number;
}

export interface AlertData {
  id?: string;
  dustbinId: string;
  location?: string;
  message: string;
  severity?: "low" | "medium" | "high";
  timestamp: string;
  status: string;
  sentTo?: string[];
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);

export const alertsCollection = collection(db, "alerts");

// ========== USER FUNCTIONS ==========
export const createUser = async (
  userData: UserData,
): Promise<{ success: boolean; userId?: string }> => {
  try {
    // Create document in Firestore 'users' collection
    await setDoc(doc(db, "users", userData.id), {
      email: userData.email,
      name: userData.name,
      role: userData.role || "user",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    });
    return { success: true, userId: userData.id };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const getUser = async (
  userId: string,
): Promise<(UserData & { createdAt?: string; lastLogin?: string }) | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as UserData & {
        createdAt: string;
        lastLogin: string;
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};

// ========== DUSTBIN FUNCTIONS ==========
export const createDustbin = async (
  dustbinData: DustbinData,
): Promise<{ success: boolean }> => {
  const dustbinRef = ref(realtimeDb, `dustbins/${dustbinData.id}`);
  await set(dustbinRef, dustbinData);
  return { success: true };
};

export const listenToDustbinUpdates = (
  callback: (data: Record<string, DustbinData> | null) => void,
) => {
  const dustbinsRef = ref(realtimeDb, "dustbins");
  return onValue(dustbinsRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

export const updateDustbinData = async (
  dustbinId: string,
  fillLevel: number,
): Promise<{ success: boolean }> => {
  const dustbinRef = ref(realtimeDb, `dustbins/${dustbinId}`);
  const status: "normal" | "warning" | "critical" =
    fillLevel >= 80 ? "critical" : fillLevel >= 50 ? "warning" : "normal";

  await set(dustbinRef, {
    fillLevel,
    lastUpdated: new Date().toISOString(),
    status,
  });

  return { success: true };
};

export const getAllDustbins = async (): Promise<Record<
  string,
  DustbinData
> | null> => {
  const dustbinsRef = ref(realtimeDb, "dustbins");
  const snapshot = await get(dustbinsRef);

  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

// ========== ALERT FUNCTIONS ==========
export const createAlert = async (
  alertData: Omit<AlertData, "id" | "timestamp" | "status">,
): Promise<string> => {
  const docRef = await addDoc(alertsCollection, {
    ...alertData,
    timestamp: new Date().toISOString(),
    status: "sent",
  });
  return docRef.id;
};

export const getAlerts = async (): Promise<AlertData[]> => {
  const q = query(alertsCollection, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as AlertData,
  );
};
