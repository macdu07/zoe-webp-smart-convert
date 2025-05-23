"use client";
import AuthGuard from '@/components/auth/AuthGuard';
import ConversionPage from '@/components/core/ConversionPage';

export default function Home() {
  return (
    <AuthGuard>
      <ConversionPage />
    </AuthGuard>
  );
}
