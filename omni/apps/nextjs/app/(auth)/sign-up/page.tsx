'use client';

import { NeonAuthUIProvider, SignUpForm } from '@neondatabase/auth-ui';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <NeonAuthUIProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Créer un compte Omni
          </h1>
          <SignUpForm />
          <p className="mt-4 text-center text-gray-400">
            Déjà un compte?{' '}
            <Link href="/sign-in" className="text-emerald-400 hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </NeonAuthUIProvider>
  );
}
