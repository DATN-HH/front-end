import { RegisterForm } from '@/components/register-form';
import { Logo } from '@/components/logo';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <Logo className="h-12 w-auto" />
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-center text-sm text-muted-foreground">
            Fill in your details to create a new account
          </p>
        </div>
        <RegisterForm />
        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
