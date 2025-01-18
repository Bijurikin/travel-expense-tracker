"use client"

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, ResponsiveContainer } from "recharts"
// Remove TrendingUp, TrendingDown from imports
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useExpenseStore } from "@/lib/store"
import { startOfMonth, endOfMonth, subMonths, format, startOfWeek, endOfWeek, getISOWeek, eachDayOfInterval } from 'date-fns'
import { de } from 'date-fns/locale'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

type TimeFrame = 'week' | 'month' | '3months' | '6months' | '12months'

export function ExpenseAnalytics() {
  const { expenses } = useExpenseStore()
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('month')
  const isMobile = useMediaQuery("(max-width: 768px)")

  const getTimeFrameData = () => {
    const now = new Date()
    
    switch(timeFrame) {
      case 'week':
        const weekStart = startOfWeek(now, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
        // Für die Wochenansicht geben wir jeden Tag zurück
        return eachDayOfInterval({ start: weekStart, end: weekEnd }).map(day => ({
          start: day,
          end: day
        }))
      
      case 'month':
        const monthStart = startOfMonth(now)
        const monthEnd = endOfMonth(now)
        // Für die Monatsansicht geben wir die Wochen zurück
        const weeks = []
        let current = startOfWeek(monthStart, { weekStartsOn: 1 })
        
        while (current <= monthEnd) {
          const weekEnd = endOfWeek(current, { weekStartsOn: 1 })
          weeks.push({
            start: current > monthStart ? current : monthStart,
            end: weekEnd > monthEnd ? monthEnd : weekEnd
          })
          current = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000)
        }
        return weeks
      
      default:
        const monthCount = {
          '3months': 3,
          '6months': 6,
          '12months': 12
        }[timeFrame]

        return Array.from({ length: monthCount }).map((_, i) => {
          const date = subMonths(now, i)
          return {
            start: startOfMonth(date),
            end: endOfMonth(date)
          }
        }).reverse()
    }
  }

  const chartData = getTimeFrameData().map(({ start, end }) => {
    const periodTotal = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date)
        return expenseDate >= start && expenseDate <= end
      })
      .reduce((sum, expense) => sum + expense.amount, 0)

    return {
      month: timeFrame === 'week'
        ? format(start, 'EEEEEE', { locale: de }) // Kurzer Wochentag
        : timeFrame === 'month'
        ? `KW ${getISOWeek(start)}` // Kalenderwoche
        : format(start, 'MMM', { locale: de }), // Monat
      amount: Number(periodTotal.toFixed(2))
    }
  })

  // Remove these unused calculations
  // const currentMonth = chartData[chartData.length - 1]?.amount ?? 0
  // const previousMonth = chartData[chartData.length - 2]?.amount ?? 0
  // const trend = previousMonth ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0

  // Neue Berechnungen für Statistiken
  const calculateStats = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    // Monatliche Statistiken
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear
    })
    
    const monthlyTotal = currentMonthExpenses.reduce((sum, expense) => 
      sum + expense.amount, 0
    )

    // Jährliche Statistiken
    const currentYearExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getFullYear() === currentYear
    })

    const yearlyTotal = currentYearExpenses.reduce((sum, expense) => 
      sum + expense.amount, 0
    )

    const monthlyAverage = yearlyTotal / (currentMonth + 1)

    return {
      monthlyTotal: monthlyTotal.toFixed(2),
      yearlyTotal: yearlyTotal.toFixed(2),
      monthlyAverage: monthlyAverage.toFixed(2)
    }
  }

  const stats = calculateStats()

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-medium">Ausgabenentwicklung</CardTitle>
        <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value as TimeFrame)}>
          <SelectTrigger className="w-[140px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Diese Woche</SelectItem>
            <SelectItem value="month">Dieser Monat</SelectItem>
            <SelectItem value="3months">3 Monate</SelectItem>
            {!isMobile && (
              <>
                <SelectItem value="6months">6 Monate</SelectItem>
                <SelectItem value="12months">12 Monate</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Neue Statistik-Anzeige */}
          <div className="grid grid-cols-3 gap-4 pb-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Dieser Monat</p>
              <p className="text-2xl font-bold">{stats.monthlyTotal}€</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Dieses Jahr</p>
              <p className="text-2xl font-bold">{stats.yearlyTotal}€</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Monatsdurchschnitt</p>
              <p className="text-2xl font-bold">{stats.monthlyAverage}€</p>
            </div>
          </div>

          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 30, right: 15, left: 5, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  horizontal={true}
                  vertical={false}
                  stroke="var(--border)"
                  className="dark:opacity-20"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={12}
                  stroke="currentColor"
                  className="text-foreground"
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(value) => `${value}€`}
                  stroke="currentColor"
                  className="text-foreground"
                />
                <Bar 
                  dataKey="amount" 
                  fill="hsl(var(--chart-1))"
                  radius={[8, 8, 0, 0]}
                >
                  <LabelList
                    dataKey="amount"
                    position="top"
                    offset={15}
                    formatter={(value: number) => `${value}€`}
                    fill="currentColor"
                    className="text-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Remove the trend display div completely */}
        </div>
      </CardContent>
    </Card>
  )
}
