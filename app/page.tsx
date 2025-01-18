"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useExpenseStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExpenseAnalytics } from "@/components/dashboard/expense-analytics";

const MotionDiv = motion.div;

const fallbackImageUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN88B8AAsUB4ZtvXtIAAAAASUVORK5CYII=";

export default function Home() {
  const { expenses, fetchExpenses } = useExpenseStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    console.log('Authentication state:', isAuthenticated); // Debug log
    if (isAuthenticated) {
      fetchExpenses();
    }
  }, [fetchExpenses, isAuthenticated]);

  // Sortiere die Ausgaben nach Datum (neueste zuerst) und nimm die ersten 3
  const latestExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Reisekosten Dashboard</h1>
        <Link href="/upload">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Neue Ausgabe
          </Button>
        </Link>
      </div>

      {expenses.length === 0 ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Keine Einträge vorhanden</CardTitle>
            <CardDescription>
              Fügen Sie Ihre erste Reiseausgabe hinzu
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Link href="/upload">
              <Button size="lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                Erste Ausgabe erfassen
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latestExpenses.map((expense) => (
            <MotionDiv
              key={expense.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
            >
              <Link href="/entries">
                <Card className="overflow-hidden cursor-pointer">
                  <div className="relative h-48 w-full">
                    <Image
                      src={expense.image || fallbackImageUrl}
                      alt="Beleg"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{expense.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString('de-DE', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </p>
                      </div>
                      <p className="font-bold">{expense.amount.toFixed(2)} €</p>
                    </div>
                    {expense.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {expense.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </MotionDiv>
          ))}
          {expenses.length > 3 && (
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link href="/entries">
                <Card className="overflow-hidden cursor-pointer h-full flex items-center justify-center">
                  <CardContent className="p-4 text-center">
                    <p className="text-lg font-medium">
                      Alle {expenses.length} Belege anzeigen
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Zur vollständigen Übersicht
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </MotionDiv>
          )}
        </div>
      )}

      {expenses.length > 0 && <ExpenseAnalytics />}
    </div>
  );
}
