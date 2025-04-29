import { getApplications, saveApplication } from '@/lib/db';
import { auth } from 'firebase-admin';

export default async function handler(req, res) {
  const { method } = req;
  const { uid } = await auth().verifyIdToken(req.headers.authorization);

  switch (method) {
    case 'GET':
      const apps = await getApplications(uid);
      res.status(200).json(apps);
      break;
    case 'POST':
      const appId = await saveApplication(uid, req.body);
      res.status(201).json({ id: appId });
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
