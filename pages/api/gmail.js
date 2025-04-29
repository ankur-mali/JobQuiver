import { google } from 'googleapis';
import { auth } from '@/lib/firebase-admin';

export default async function handler(req, res) {
  const { uid } = req.body;
  
  try {
    const user = await auth.getUser(uid);
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    );

    oAuth2Client.setCredentials({
      access_token: user.customClaims.googleAccessToken,
      refresh_token: user.customClaims.googleRefreshToken
    });

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    
    // Fetch recent emails
    const { data } = await gmail.users.messages.list({
      userId: 'me',
      q: 'from:(noreply@applytojob.com OR jobs@) after:2023-01-01'
    });

    const processedEmails = await Promise.all(
      data.messages.slice(0, 10).map(async (message) => {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id
        });
        return analyzeEmail(email.data);
      })
    );

    res.status(200).json(processedEmails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

function analyzeEmail(email) {
  const headers = email.payload.headers;
  const subject = headers.find(h => h.name === 'Subject').value;
  const from = headers.find(h => h.name === 'From').value;
  const body = email.snippet;

  const status = detectStatus(body);
  const company = from.match(/@(.*?)\./)[1];
  
  return {
    id: email.id,
    company,
    subject,
    status,
    date: new Date(parseInt(email.internalDate)),
    body
  };
}

function detectStatus(text) {
  const lowerText = text.toLowerCase();
  if (/reject|regret|unfortunately/.test(lowerText)) return 'rejected';
  if (/interview|schedule|call/.test(lowerText)) return 'interview';
  if (/document|resume|cv|reference/.test(lowerText)) return 'documents_requested';
  return 'application_received';
}
