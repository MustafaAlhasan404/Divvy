import { collection, addDoc, getDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

import { db } from './firebaseConfig';

// Interfaces
interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
}

interface Group {
  id: string;
  name: string;
  members: string[];
  createdBy: string;
  createdAt: Date;
  code: string;
}

interface Expense {
  id: string;
  groupId: string;
  paidBy: string;
  amount: number;
  description: string;
  date: Date;
  category?: string;
}

interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  amount: number;
}

interface Settlement {
  id: string;
  groupId: string;
  fromUser: string;
  toUser: string;
  amount: number;
  date: Date;
  status: 'pending' | 'completed';
}

interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'premium';
  startDate: Date;
  endDate: Date;
}

// Helper function to generate group code
function generateGroupCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// CRUD Operations for Users
export const createUser = async (user: Omit<User, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'Users'), user);
  return docRef.id;
};

export const getUser = async (userId: string): Promise<User | null> => {
  const docRef = doc(db, 'Users', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as User : null;
};

export const updateUser = async (userId: string, data: Partial<User>): Promise<void> => {
  const docRef = doc(db, 'Users', userId);
  await updateDoc(docRef, data);
};

export const deleteUser = async (userId: string): Promise<void> => {
  const docRef = doc(db, 'Users', userId);
  await deleteDoc(docRef);
};

// CRUD Operations for Groups
export const createGroup = async (group: Omit<Group, 'id' | 'code'>): Promise<string> => {
  const groupWithCode = {
    ...group,
    code: generateGroupCode(),
  };
  const docRef = await addDoc(collection(db, 'Groups'), groupWithCode);
  return docRef.id;
};

export const getGroup = async (groupId: string): Promise<Group | null> => {
  const docRef = doc(db, 'Groups', groupId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Group : null;
};

export const updateGroup = async (groupId: string, data: Partial<Group>): Promise<void> => {
  const docRef = doc(db, 'Groups', groupId);
  await updateDoc(docRef, data);
};

export const deleteGroup = async (groupId: string): Promise<void> => {
  const docRef = doc(db, 'Groups', groupId);
  await deleteDoc(docRef);
};

// CRUD Operations for Expenses
export const createExpense = async (expense: Omit<Expense, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'Expenses'), expense);
  return docRef.id;
};

export const getExpense = async (expenseId: string): Promise<Expense | null> => {
  const docRef = doc(db, 'Expenses', expenseId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Expense : null;
};

export const updateExpense = async (expenseId: string, data: Partial<Expense>): Promise<void> => {
  const docRef = doc(db, 'Expenses', expenseId);
  await updateDoc(docRef, data);
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  const docRef = doc(db, 'Expenses', expenseId);
  await deleteDoc(docRef);
};

// CRUD Operations for ExpenseSplits
export const createExpenseSplit = async (expenseSplit: Omit<ExpenseSplit, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'ExpenseSplits'), expenseSplit);
  return docRef.id;
};

export const getExpenseSplit = async (expenseSplitId: string): Promise<ExpenseSplit | null> => {
  const docRef = doc(db, 'ExpenseSplits', expenseSplitId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as ExpenseSplit : null;
};

export const updateExpenseSplit = async (expenseSplitId: string, data: Partial<ExpenseSplit>): Promise<void> => {
  const docRef = doc(db, 'ExpenseSplits', expenseSplitId);
  await updateDoc(docRef, data);
};

export const deleteExpenseSplit = async (expenseSplitId: string): Promise<void> => {
  const docRef = doc(db, 'ExpenseSplits', expenseSplitId);
  await deleteDoc(docRef);
};

// CRUD Operations for Settlements
export const createSettlement = async (settlement: Omit<Settlement, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'Settlements'), settlement);
  return docRef.id;
};

export const getSettlement = async (settlementId: string): Promise<Settlement | null> => {
  const docRef = doc(db, 'Settlements', settlementId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Settlement : null;
};

export const updateSettlement = async (settlementId: string, data: Partial<Settlement>): Promise<void> => {
  const docRef = doc(db, 'Settlements', settlementId);
  await updateDoc(docRef, data);
};

export const deleteSettlement = async (settlementId: string): Promise<void> => {
  const docRef = doc(db, 'Settlements', settlementId);
  await deleteDoc(docRef);
};

// CRUD Operations for Subscriptions
export const createSubscription = async (subscription: Omit<Subscription, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'Subscriptions'), subscription);
  return docRef.id;
};

export const getSubscription = async (subscriptionId: string): Promise<Subscription | null> => {
  const docRef = doc(db, 'Subscriptions', subscriptionId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Subscription : null;
};

export const updateSubscription = async (subscriptionId: string, data: Partial<Subscription>): Promise<void> => {
  const docRef = doc(db, 'Subscriptions', subscriptionId);
  await updateDoc(docRef, data);
};

export const deleteSubscription = async (subscriptionId: string): Promise<void> => {
  const docRef = doc(db, 'Subscriptions', subscriptionId);
  await deleteDoc(docRef);
};
