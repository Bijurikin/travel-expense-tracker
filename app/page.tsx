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
import { pageVariants, staggerContainer, staggerItem } from "@/components/ui/animations";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const MotionDiv = motion.div;

const fallbackImageUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN88B8AAsUB4ZtvXtIAAAAASUVORK5CYII=";

export default function Home() {
  const { expenses, isLoading, fetchExpenses } = useExpenseStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
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

  // Add loading state handling
  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="container py-10"
    >
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
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
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
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {latestExpenses.map((expense) => (
            <motion.div
              key={expense.id}
              variants={staggerItem}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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
                        <div className="flex items-center gap-2">
                          {(() => {
                            const category = EXPENSE_CATEGORIES.find(c => c.value === expense.category)
                            if (category) {
                              const Icon = category.icon
                              return (
                                <>
                                  <Icon className="h-4 w-4" />
                                  <p className="font-semibold">{category.label}</p>
                                </>
                              )
                            }
                            return expense.category
                          })()}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(expense.date)}
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
            </motion.div>
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
        </motion.div>
      )}

      {expenses.length > 0 && <ExpenseAnalytics />}
    </motion.div>
  );
}
