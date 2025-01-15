"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  PieChart, Pie, ResponsiveContainer, Cell, Legend, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar
} from "recharts"
import { useExpenseStore } from "@/lib/store"
import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfYear, endOfYear, isWithinInterval, format,
  eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval,
} from 'date-fns'
import { de } from 'date-fns/locale'

type TimeRange = 'week' | 'month' | 'year'

const formatCategory = (category: string) => {
  const categoryMap: Record<string, string> = {
    travel: 'Reise',
    accommodation: 'Unterkunft',
    food: 'Verpflegung',
    other: 'Sonstiges'
  }
  return categoryMap[category] || category
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function ExpenseAnalytics() {
  const { expenses } = useExpenseStore()

  const getFilteredExpenses = (range: TimeRange) => {
    const now = new Date()
    let start: Date
    let end: Date

    switch (range) {
      case 'week':
        start = startOfWeek(now, { locale: de })
        end = endOfWeek(now, { locale: de })
        break
      case 'month':
        start = startOfMonth(now)
        end = endOfMonth(now)
        break
      case 'year':
        start = startOfYear(now)
        end = endOfYear(now)
        break
      default:
        start = startOfWeek(now, { locale: de })
        end = endOfWeek(now, { locale: de })
    }

    return expenses.filter(expense => 
      isWithinInterval(new Date(expense.date), { start, end })
    )
  }

  const getCategoryData = (range: TimeRange) => {
    const filtered = getFilteredExpenses(range)
    const categoryMap = new Map<string, number>()

    filtered.forEach(expense => {
      const current = categoryMap.get(expense.category) || 0
      categoryMap.set(expense.category, current + expense.amount)
    })

    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      name: formatCategory(category),
      value: Number(amount.toFixed(2))
    }))
  }

  const getTotalAmount = (range: TimeRange) => {
    return getFilteredExpenses(range)
      .reduce((sum, expense) => sum + expense.amount, 0)
      .toFixed(2)
  }

  // Neue Funktion für die Trendanalyse
  const getTrendData = (range: TimeRange) => {
    const now = new Date()
    let start: Date
    let end: Date

    switch (range) {
      case 'week':
        start = startOfWeek(now, { locale: de, weekStartsOn: 1 })
        end = endOfWeek(now, { locale: de, weekStartsOn: 1 })
        return eachDayOfInterval({ start, end }).map(date => ({
          date: format(date, 'EEEEEE', { locale: de }), // Kurzform des Wochentags
          amount: getAmountForDate(date)
        }))
      case 'month':
        start = startOfMonth(now)
        end = endOfMonth(now)
        return eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }).map(weekStart => ({
          date: `KW ${format(weekStart, 'w')}`,
          amount: expenses
            .filter(expense => {
              const expenseDate = new Date(expense.date)
              return isWithinInterval(expenseDate, {
                start: weekStart,
                end: endOfWeek(weekStart, { weekStartsOn: 1 })
              })
            })
            .reduce((sum, expense) => sum + expense.amount, 0)
        }))
      case 'year':
        start = startOfYear(now)
        end = endOfYear(now)
        return eachMonthOfInterval({ start, end }).map(monthStart => ({
          date: format(monthStart, 'MMM', { locale: de }),
          amount: expenses
            .filter(expense => {
              const expenseDate = new Date(expense.date)
              return isWithinInterval(expenseDate, {
                start: monthStart,
                end: endOfMonth(monthStart)
              })
            })
            .reduce((sum, expense) => sum + expense.amount, 0)
        }))
      default:
        return []
    }
  }

  // Hilfsfunktion zur Berechnung der Ausgaben pro Tag
  const getAmountForDate = (date: Date) => {
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date)
        return (
          expenseDate.getFullYear() === date.getFullYear() &&
          expenseDate.getMonth() === date.getMonth() &&
          expenseDate.getDate() === date.getDate()
        )
      })
      .reduce((sum, expense) => sum + expense.amount, 0)
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Ausgabenanalyse</CardTitle>
        <CardDescription>Überblick über Ihre Ausgaben nach Zeitraum</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="week" className="space-y-4">
          <TabsList>
            <TabsTrigger value="week">Diese Woche</TabsTrigger>
            <TabsTrigger value="month">Dieser Monat</TabsTrigger>
            <TabsTrigger value="year">Dieses Jahr</TabsTrigger>
          </TabsList>

          {(['week', 'month', 'year'] as TimeRange[]).map(range => (
            <TabsContent key={range} value={range} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Gesamtausgaben
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getTotalAmount(range)} €</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Durchschnitt pro Tag
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(parseFloat(getTotalAmount(range)) / getTrendData(range).length).toFixed(2)} €
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Größte Ausgabe
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.max(...getFilteredExpenses(range).map(e => e.amount), 0).toFixed(2)} €
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Anzahl Belege
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getFilteredExpenses(range).length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Ausgabenverteilung */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Ausgabenverteilung nach Kategorie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getCategoryData(range)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {getCategoryData(range).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`${value.toFixed(2)} €`, "Betrag"]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Neue Trend-Visualisierung */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ausgabentrend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getTrendData(range)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          interval={0} // Zeigt alle Labels an
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${value} €`}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`${value.toFixed(2)} €`, "Betrag"]}
                          labelFormatter={(label) => `${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Neue Balkendiagramm-Visualisierung */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ausgaben nach Kategorie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getCategoryData(range)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => [`${value.toFixed(2)} €`, "Betrag"]}
                        />
                        <Bar dataKey="value" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
