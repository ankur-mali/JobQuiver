import { getFirestore } from 'firebase-admin/firestore';
import { auth } from 'firebase-admin';

export async function saveApplication(userId, appData) {
  const db = getFirestore();
  const docRef = await db.collection('users')
    .doc(userId)
    .collection('applications')
    .add({
      ...appData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  return docRef.id;
}

export async function getApplications(userId) {
  const db = getFirestore();
  const snapshot = await db.collection('users')
    .doc(userId)
    .collection('applications')
    .orderBy('createdAt', 'desc')
    .get();
    
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
