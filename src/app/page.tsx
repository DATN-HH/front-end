import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from '@/components/common/logo';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <Logo className="h-12 w-auto" />
          <h1 className="text-3xl font-bold">Welcome to Menu+</h1>
          <p className="text-center text-muted-foreground">
            Sign in to your account or create a new one to get started
          </p>
        </div>
        <div className="flex flex-col space-y-4">
          <Button asChild className="w-full">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/register">Create Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
