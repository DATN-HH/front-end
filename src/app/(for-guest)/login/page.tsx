import { LoginForm } from '@/features/system/components/login-form';
import { Logo } from '@/components/common/logo';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <Logo className="h-12 w-auto" />
          <h1 className="text-2xl font-bold">Sign in to your account</h1>
          <p className="text-center text-sm text-muted-foreground">
            Enter your email and password to sign in
          </p>
        </div>
        <LoginForm />
        <div className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
