'use client';

import { NeonAuthUIProvider, SignInForm } from '@neondatabase/auth-ui';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <NeonAuthUIProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Connexion à Omni
          </h1>
          <SignInForm />
          <p className="mt-4 text-center text-gray-400">
            Pas de compte?{' '}
            <Link href="/sign-up" className="text-emerald-400 hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </NeonAuthUIProvider>
  );
}
