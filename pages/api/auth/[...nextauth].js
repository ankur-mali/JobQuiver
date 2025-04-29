import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { FirestoreAdapter } from '@next-auth/firebase-adapter';
import { cert } from 'firebase-admin/app';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/gmail.readonly'
          ].join(' ')
        }
      }
    })
  ],
  adapter: FirestoreAdapter({
    credential: cert(JSON.parse(process.env.FIREBASE_CONFIG))
  }),
  callbacks: {
    async session({ session, token, user }) {
      session.user.id = user.id;
      return session;
    }
  }
});
