"use client"

import { useEffect } from 'react';
import { useExpenseStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { isLoading, fetchExpenses } = useExpenseStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      fetchExpenses();
    }
  }, [fetchExpenses, isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1>Dashboard</h1>
      {/* Add your dashboard content here */}
    </div>
  );
}
