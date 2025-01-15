"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useExpenseStore } from '@/lib/store';
import { useEffect, useReducer } from 'react';
import { motion } from 'framer-motion';
import { ExpenseAnalytics } from "@/components/dashboard/expense-analytics";
import { Loader2 } from "lucide-react";

const MotionDiv = motion.div;

const fallbackImageUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN88B8AAsUB4ZtvXtIAAAAASUVORK5CYII=";

const initialState = {
  expenses: [],
  isLoading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_SUCCESS':
      return {
        ...state,
        expenses: action.payload,
        isLoading: false,
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
}

export default function Home() {
  const { fetchExpenses } = useExpenseStore();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    fetchExpenses()
      .then((expenses) => {
        dispatch({ type: 'FETCH_SUCCESS', payload: expenses });
      })
      .catch((error) => {
        dispatch({ type: 'FETCH_ERROR', payload: error.message });
      });
  }, [fetchExpenses]);

  if (state.isLoading) {
    return (
      <div className="container py-10 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="container py-10 flex justify-center items-center min-h-[400px]">
        <p className="text-red-500">{state.error}</p>
      </div>
    );
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

      {state.expenses.length === 0 ? (
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
          {state.expenses.map((expense) => (
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
        </div>
      )}

      {state.expenses.length > 0 && <ExpenseAnalytics />}
    </div>
  );
}
