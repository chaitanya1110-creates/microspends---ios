import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
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
  const result = await signInWithPopup(auth, googleProvider);
  if (result.user) {
    await syncUserDoc(result.user);
  }
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

// User Profile Firestore Sync
export async function syncUserDoc(user: FirebaseUser, currency?: string) {
  try {
    const userRef = doc(db, 'users', user.uid);
    const data: Record<string, any> = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Anonymous User',
      photoURL: user.photoURL || '',
      updatedAt: Date.now()
    };
    if (currency) {
      data.currency = currency;
    }
    await setDoc(userRef, data, { merge: true });
  } catch (err) {
    console.error('Failed to sync user doc to Firestore:', err);
  }
}

// Firestore Transactions CRUD
export async function fetchUserTransactions(userId: string): Promise<Transaction[]> {
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
        merchant: data.merchant,
        date: data.date,
        paymentMethod: data.paymentMethod,
        note: data.note,
        createdAt: data.createdAt || Date.now()
      });
    });
    return items;
  } catch (err) {
    console.error('Error fetching transactions from Firestore:', err);
    return [];
  }
}

export async function saveUserTransactionToFirestore(userId: string, tx: Transaction): Promise<void> {
  try {
    const txRef = doc(db, 'users', userId, 'transactions', tx.id);
    const payload: Record<string, any> = {
      id: tx.id,
      userId,
      title: tx.title,
      amount: tx.amount,
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
    console.error('Error saving transaction to Firestore:', err);
  }
}

export async function deleteUserTransactionFromFirestore(userId: string, txId: string): Promise<void> {
  try {
    const txRef = doc(db, 'users', userId, 'transactions', txId);
    await deleteDoc(txRef);
  } catch (err) {
    console.error('Error deleting transaction from Firestore:', err);
  }
}

// Firestore Subscriptions CRUD
export async function fetchUserSubscriptions(userId: string): Promise<Subscription[]> {
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
    console.error('Error fetching subscriptions from Firestore:', err);
    return [];
  }
}

export async function saveUserSubscriptionToFirestore(userId: string, sub: Subscription): Promise<void> {
  try {
    const subRef = doc(db, 'users', userId, 'subscriptions', sub.id);
    const payload: Record<string, any> = {
      id: sub.id,
      userId,
      name: sub.name,
      amount: sub.amount,
      billingCycle: sub.billingCycle,
      active: sub.active,
      category: sub.category || 'Bills & Utilities',
      nextDueDate: sub.nextDueDate || new Date().toISOString().split('T')[0]
    };
    if (sub.icon) payload.icon = sub.icon;

    await setDoc(subRef, payload, { merge: true });
  } catch (err) {
    console.error('Error saving subscription to Firestore:', err);
  }
}

export async function deleteUserSubscriptionFromFirestore(userId: string, subId: string): Promise<void> {
  try {
    const subRef = doc(db, 'users', userId, 'subscriptions', subId);
    await deleteDoc(subRef);
  } catch (err) {
    console.error('Error deleting subscription from Firestore:', err);
  }
}

// Firestore Advisor Insights Cache
export async function saveAdvisorInsightToFirestore(userId: string, insight: AdvisorInsight): Promise<void> {
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
    console.error('Error saving insight to Firestore:', err);
  }
}
