import { collection, addDoc, getDoc, updateDoc, deleteDoc, doc, query, where, getDocs, writeBatch } from 'firebase/firestore';

import { db } from './firebaseConfig';

// Interfaces
export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
}

export interface Group {
  id: string;
  name: string;
  members: string[];
  createdBy: string;
  createdAt: Date;
  type: string;
  code: string;
}

export interface Expense {
  id: string;
  groupId: string;
  paidBy: { [userId: string]: number };
  totalAmount: number;
  description: string;
  date: Date;
  category?: string;
  splitMethod: 'equal' | 'custom';
}

export interface ExpenseShare {
  id: string;
  expenseId: string;
  userId: string;
  amount: number;
  isPaid: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'premium';
  startDate: Date;
  endDate: Date;
}

export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  settled: boolean;
  createdAt: Date;
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

export const searchUser = async (searchTerm: string): Promise<{ id: string; name: string } | null> => {
  const usersQuery = query(
    collection(db, 'Users'),
    where('fullName', '==', searchTerm)
  );
  const querySnapshot = await getDocs(usersQuery);
  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, name: userDoc.data().fullName };
  }
  return null;
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

export const getUserGroups = async (userId: string): Promise<Group[]> => {
  const groupsQuery = query(collection(db, 'Groups'), where('members', 'array-contains', userId));
  const querySnapshot = await getDocs(groupsQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
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

export const getGroupExpenses = async (groupId: string): Promise<Expense[]> => {
  const expensesQuery = query(collection(db, 'Expenses'), where('groupId', '==', groupId));
  const querySnapshot = await getDocs(expensesQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
};

// CRUD Operations for ExpenseShares
export const createExpenseShares = async (shares: Omit<ExpenseShare, 'id'>[]): Promise<void> => {
  const batch = writeBatch(db);
  shares.forEach(share => {
    const docRef = doc(collection(db, 'ExpenseShares'));
    batch.set(docRef, share);
  });
  await batch.commit();
};

export const getExpenseShare = async (expenseShareId: string): Promise<ExpenseShare | null> => {
  const docRef = doc(db, 'ExpenseShares', expenseShareId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as ExpenseShare : null;
};

export const updateExpenseShare = async (expenseShareId: string, data: Partial<ExpenseShare>): Promise<void> => {
  const docRef = doc(db, 'ExpenseShares', expenseShareId);
  await updateDoc(docRef, data);
};

export const deleteExpenseShare = async (expenseShareId: string): Promise<void> => {
  const docRef = doc(db, 'ExpenseShares', expenseShareId);
  await deleteDoc(docRef);
};

export const getExpenseShares = async (expenseId: string): Promise<ExpenseShare[]> => {
  const sharesQuery = query(collection(db, 'ExpenseShares'), where('expenseId', '==', expenseId));
  const querySnapshot = await getDocs(sharesQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpenseShare));
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

export const getUserSubscription = async (userId: string): Promise<Subscription | null> => {
  const subscriptionsQuery = query(collection(db, 'Subscriptions'), where('userId', '==', userId));
  const querySnapshot = await getDocs(subscriptionsQuery);
  const subscriptions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscription));
  return subscriptions.length > 0 ? subscriptions[0] : null;
};

// CRUD Operations for Settlements
export const createSettlement = async (settlement: Omit<Settlement, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'Settlements'), settlement);
  return docRef.id;
};

export const getGroupSettlements = async (groupId: string): Promise<Settlement[]> => {
  const settlementsQuery = query(collection(db, 'Settlements'), where('groupId', '==', groupId));
  const querySnapshot = await getDocs(settlementsQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Settlement));
};

export const updateSettlement = async (settlementId: string, data: Partial<Settlement>): Promise<void> => {
  const docRef = doc(db, 'Settlements', settlementId);
  await updateDoc(docRef, data);
};

export const calculateSettlements = async (groupId: string): Promise<Settlement[]> => {
  const expenses = await getGroupExpenses(groupId);
  const group = await getGroup(groupId);
  const allSettlements = await getGroupSettlements(groupId);
  
  if (!group) throw new Error('Group not found');

  const balances: { [userId: string]: number } = {};
  group.members.forEach(memberId => {
    balances[memberId] = 0;
  });

  // Calculate balances from expenses
  expenses.forEach(expense => {
    const totalAmount = expense.totalAmount;
    const perPersonAmount = totalAmount / group.members.length;

    group.members.forEach(memberId => {
      balances[memberId] -= perPersonAmount;
      if (expense.paidBy[memberId]) {
        balances[memberId] += expense.paidBy[memberId];
      }
    });
  });

  // Adjust balances based on settled amounts
  allSettlements.forEach(settlement => {
    if (settlement.settled) {
      balances[settlement.fromUserId] += settlement.amount;
      balances[settlement.toUserId] -= settlement.amount;
    }
  });

  const batch = writeBatch(db);
  const updatedSettlements: Settlement[] = [];
  const processedPairs: Set<string> = new Set();

  while (Object.values(balances).some(balance => Math.abs(balance) > 0.01)) {
    const debtor = Object.entries(balances).reduce((a, b) => a[1] < b[1] ? a : b)[0];
    const creditor = Object.entries(balances).reduce((a, b) => a[1] > b[1] ? a : b)[0];

    const amount = Math.min(Math.abs(balances[debtor]), balances[creditor]);

    const pairKey = `${debtor}-${creditor}`;
    if (!processedPairs.has(pairKey) && amount > 0.01) {
      const newSettlement: Omit<Settlement, 'id'> = {
        groupId,
        fromUserId: debtor,
        toUserId: creditor,
        amount,
        settled: false,
        createdAt: new Date(),
      };
      const settlementRef = doc(collection(db, 'Settlements'));
      batch.set(settlementRef, newSettlement);
      updatedSettlements.push({ ...newSettlement, id: settlementRef.id });
      processedPairs.add(pairKey);
    }

    balances[debtor] += amount;
    balances[creditor] -= amount;
  }

  await batch.commit();

  return updatedSettlements;
};
