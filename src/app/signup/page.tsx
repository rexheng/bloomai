import { AuthForm } from '@/components/auth/AuthForm';

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-sage-50 text-sage-900 font-sans">
      <main className="w-full max-w-md space-y-8">
        <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-sage-800">
                Bloom Companion
            </h1>
        </div>
        <AuthForm mode="signup" />
      </main>
    </div>
  );
}
