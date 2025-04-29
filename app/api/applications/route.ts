import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const querySnapshot = await getDocs(collection(db, 'users', userId, 'applications'));
  const applications = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate?.() || new Date(),
  }));

  return NextResponse.json(applications);
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { userId, company, position } = body;

  if (userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const docRef = await addDoc(collection(db, 'users', userId, 'applications'), {
    company,
    position,
    status: 'applied',
    date: new Date(),
  });

  return NextResponse.json({ id: docRef.id, company, position, status: 'applied' });
}

export async function PUT(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, userId, company, position, status } = body;

  if (userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const docRef = doc(db, 'users', userId, 'applications', id);
  await updateDoc(docRef, { company, position, status, date: new Date() });

  return NextResponse.json({ id, company, position, status });
}