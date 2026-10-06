import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Transaction, Subscription, AdvisorInsight } from './types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firestore Database with designated database ID
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// MANDATORY VALIDATION: Test connection to Firestore on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Authentication helpers
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      await syncUserDoc(result.user);
    }
    return result.user;
  } catch (err: any) {
    console.error('Google Sign In error:', err);
    throw err;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    if (result.user) {
      await syncUserDoc(result.user);
    }
    return result.user;
  } catch (err: any) {
    console.error('Email Sign In error:', err);
    throw err;
  }
}

export async function signUpWithEmail(email: string, password: string): Promise<FirebaseUser> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (result.user) {
      await syncUserDoc(result.user);
    }
    return result.user;
  } catch (err: any) {
    console.error('Email Sign Up error:', err);
    throw err;
  }
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

// User Profile Firestore Sync
export async function syncUserDoc(user: FirebaseUser, currency?: string) {
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const data: Record<string, any> = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Icarus Member',
      photoURL: user.photoURL || '',
      updatedAt: Date.now()
    };
    if (currency) {
      data.currency = currency;
    }
    await setDoc(userRef, data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Firestore Transactions CRUD
export async function fetchUserTransactions(userId: string): Promise<Transaction[]> {
  const path = `users/${userId}/transactions`;
  try {
    const colRef = collection(db, 'users', userId, 'transactions');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const items: Transaction[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      items.push({
        id: data.id || docSnap.id,
        title: data.title,
        amount: Number(data.amount) || 0,
        type: data.type,
        category: data.category,
        merchant: data.merchant || data.title,
        date: data.date,
        paymentMethod: data.paymentMethod || 'Apple Pay',
        note: data.note || '',
        createdAt: data.createdAt || Date.now()
      });
    });
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function saveUserTransactionToFirestore(userId: string, tx: Transaction): Promise<void> {
  const path = `users/${userId}/transactions/${tx.id}`;
  try {
    const txRef = doc(db, 'users', userId, 'transactions', tx.id);
    const payload: Record<string, any> = {
      id: tx.id,
      userId,
      title: tx.title,
      amount: Number(tx.amount) || 0,
      type: tx.type,
      category: tx.category,
      date: tx.date,
      createdAt: tx.createdAt || Date.now()
    };
    if (tx.merchant) payload.merchant = tx.merchant;
    if (tx.paymentMethod) payload.paymentMethod = tx.paymentMethod;
    if (tx.note) payload.note = tx.note;

    await setDoc(txRef, payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteUserTransactionFromFirestore(userId: string, txId: string): Promise<void> {
  const path = `users/${userId}/transactions/${txId}`;
  try {
    const txRef = doc(db, 'users', userId, 'transactions', txId);
    await deleteDoc(txRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Firestore Subscriptions CRUD
export async function fetchUserSubscriptions(userId: string): Promise<Subscription[]> {
  const path = `users/${userId}/subscriptions`;
  try {
    const colRef = collection(db, 'users', userId, 'subscriptions');
    const snapshot = await getDocs(colRef);
    const items: Subscription[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      items.push({
        id: data.id || docSnap.id,
        name: data.name || data.title || 'Subscription',
        amount: Number(data.amount || data.cost) || 0,
        billingCycle: data.billingCycle || data.cycle || 'monthly',
        category: data.category || 'Bills & Utilities',
        nextDueDate: data.nextDueDate || data.renewsOn || new Date().toISOString().split('T')[0],
        active: data.active !== undefined ? Boolean(data.active) : true,
        icon: data.icon || 'shield'
      });
    });
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function saveUserSubscriptionToFirestore(userId: string, sub: Subscription): Promise<void> {
  const path = `users/${userId}/subscriptions/${sub.id}`;
  try {
    const subRef = doc(db, 'users', userId, 'subscriptions', sub.id);
    const payload: Record<string, any> = {
      id: sub.id,
      userId,
      name: sub.name,
      amount: Number(sub.amount) || 0,
      billingCycle: sub.billingCycle,
      active: sub.active,
      category: sub.category || 'Bills & Utilities',
      nextDueDate: sub.nextDueDate || new Date().toISOString().split('T')[0]
    };
    if (sub.icon) payload.icon = sub.icon;

    await setDoc(subRef, payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteUserSubscriptionFromFirestore(userId: string, subId: string): Promise<void> {
  const path = `users/${userId}/subscriptions/${subId}`;
  try {
    const subRef = doc(db, 'users', userId, 'subscriptions', subId);
    await deleteDoc(subRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Firestore Advisor Insights Cache
export async function saveAdvisorInsightToFirestore(userId: string, insight: AdvisorInsight): Promise<void> {
  const path = `users/${userId}/insights/latest`;
  try {
    const insightRef = doc(db, 'users', userId, 'insights', 'latest');
    const payload = {
      id: 'latest',
      userId,
      score: insight.score,
      grade: insight.grade,
      headline: insight.headline,
      summary: insight.summary,
      createdAt: Date.now()
    };
    await setDoc(insightRef, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
