"use client";

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    } else {
      setIsVerified(true);
    }
  }, [router]);

  if (!isVerified) {
    // Optional: Show a loading skeleton or spinner while checking auth
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <Skeleton className="w-full max-w-md h-64 rounded-lg" />
      </div>
    );
  }

  return <>{children}</>;
}
