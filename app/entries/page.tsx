"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Loader2, CalendarIcon } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { useExpenseStore } from '@/lib/store'
import { EditModal } from "./edit-modal"
import { Expense } from "@/lib/api"
import { ImagePreview } from "@/components/ui/image-preview"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EXPENSE_CATEGORIES } from "@/lib/constants"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

const MotionDiv = motion.div
const MotionTr = motion.tr
const MotionButton = motion(Button)

export default function EntriesPage() {
  const { expenses, fetchExpenses, deleteExpense, updateExpense } = useExpenseStore()
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    startDate: '',
    endDate: ''
  })
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  useEffect(() => {
    fetchExpenses().finally(() => setIsLoading(false))
  }, [fetchExpenses])

  const handleEdit = (id: string) => {
    const expense = expenses.find(e => e.id === id)
    if (expense) {
      setEditingExpense(expense)
    }
  }

  const handleUpdate = async (updatedData: Partial<Expense>) => {
    if (editingExpense?.id) {
      await updateExpense(editingExpense.id, updatedData)
      setEditingExpense(null)
    }
  }

  const handleDelete = async (id: string) => {
    setExpenseToDelete(id)
  }

  const confirmDelete = async () => {
    if (expenseToDelete) {
      setDeletingId(expenseToDelete)
      try {
        await deleteExpense(expenseToDelete)
      } catch (error) {
        console.error('Failed to delete expense:', error)
      } finally {
        setDeletingId(null)
        setExpenseToDelete(null)
      }
    }
  }

  const handleDateSelect = (date: Date | undefined, type: 'start' | 'end') => {
    if (date) {
      // Setze die Zeit auf Mitternacht für konsistente Vergleiche
      const normalizedDate = new Date(date)
      normalizedDate.setHours(0, 0, 0, 0)
      setFilters(prev => ({
        ...prev,
        [`${type}Date`]: normalizedDate.toISOString().split('T')[0]
      }))
    }
  }

  const renderDateInput = (type: 'start' | 'end') => {
    const label = type === 'start' ? 'Von' : 'Bis'
    const value = filters[`${type}Date`]

    if (isDesktop) {
      return (
        <Input
          type="date"
          value={value}
          onChange={(e) => setFilters(prev => ({ ...prev, [`${type}Date`]: e.target.value }))}
          className="w-full transition-all duration-200 hover:shadow-md"
        />
      )
    }

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(new Date(value), "PPP", { locale: de }) : label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => handleDateSelect(date, type)}
            initialFocus
            locale={de}
          />
        </PopoverContent>
      </Popover>
    )
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description?.toLowerCase().includes(filters.search.toLowerCase()) ?? true
    const matchesCategory = filters.category === 'all' || filters.category === expense.category
    
    // Verbesserte Datumsfilterung
    const expenseDate = new Date(expense.date)
    expenseDate.setHours(0, 0, 0, 0) // Setze Zeit auf Mitternacht

    const matchesDateRange = (
      !filters.startDate || 
      new Date(filters.startDate) <= expenseDate
    ) && (
      !filters.endDate || 
      new Date(filters.endDate) >= expenseDate
    )
    
    return matchesSearch && matchesCategory && matchesDateRange
  })

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Erhöht von 0.1
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="container py-10"
    >
      <Card>
        <CardHeader>
          <MotionDiv
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <CardTitle>Ausgabenübersicht</CardTitle>
          </MotionDiv>
        </CardHeader>
        <CardContent>
          <MotionDiv
            variants={container}
            initial="hidden"
            animate="show"
            className="mb-6 grid gap-4 md:grid-cols-4"
          >
            <MotionDiv variants={item}>
              <Input
                placeholder="Suche nach Beschreibung..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full transition-all duration-200 hover:shadow-md"
              />
            </MotionDiv>
            <MotionDiv variants={item}>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie">
                    {filters.category === 'all' ? (
                      'Alle Kategorien'
                    ) : (
                      <div className="flex items-center gap-2">
                        {(() => {
                          const category = EXPENSE_CATEGORIES.find(c => c.value === filters.category)
                          if (category) {
                            const Icon = category.icon
                            return (
                              <>
                                <Icon className="h-4 w-4" />
                                {category.label}
                              </>
                            )
                          }
                          return 'Alle Kategorien'
                        })()}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <category.icon className="h-4 w-4" />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </MotionDiv>
            <MotionDiv variants={item}>
              {renderDateInput('start')}
            </MotionDiv>
            <MotionDiv variants={item}>
              {renderDateInput('end')}
            </MotionDiv>
          </MotionDiv>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Beleg</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Beschreibung</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {filteredExpenses.map((entry, index) => (
                  <MotionTr
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ 
                      duration: 0.6,
                      delay: index * 0.15, // Erhöht von 0.05
                      ease: "easeOut"
                    }}
                    whileHover={{ backgroundColor: "var(--accent)", scale: 1.01 }}
                    className="relative"
                  >
                    <TableCell>
                      <MotionDiv
                        whileHover={{ scale: 1.05 }}
                        className="h-12 w-12 relative rounded overflow-hidden cursor-pointer"
                        onClick={() => setSelectedImage(entry.image)}
                      >
                        <Image
                          src={entry.image}
                          alt="Beleg"
                          fill
                          className="object-cover"
                        />
                      </MotionDiv>
                    </TableCell>
                    <TableCell>
                      {new Date(entry.date).toLocaleDateString('de-DE', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const category = EXPENSE_CATEGORIES.find(c => c.value === entry.category)
                          if (category) {
                            const Icon = category.icon
                            return (
                              <>
                                <Icon className="h-4 w-4" />
                                {category.label}
                              </>
                            )
                          }
                          return entry.category
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="text-right">
                      {entry.amount.toFixed(2)} €
                    </TableCell>
                    <TableCell className="text-right">
                      <MotionDiv 
                        className="flex justify-end gap-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <MotionButton
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(entry.id)}
                          whileHover={{ scale: 1.1, rotate: 15 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </MotionButton>
                        <MotionDiv whileHover={{ scale: 1.1 }}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(entry.id)}
                            disabled={deletingId === entry.id}
                          >
                            {deletingId === entry.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </MotionDiv>
                      </MotionDiv>
                    </TableCell>
                  </MotionTr>
                ))}
              </AnimatePresence>
              {filteredExpenses.length === 0 && (
                <MotionTr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <TableCell colSpan={6} className="text-center py-8">
                    {expenses.length === 0 ? 'Keine Einträge vorhanden' : 'Keine Einträge gefunden'}
                  </TableCell>
                </MotionTr>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <EditModal
        expense={editingExpense}
        open={!!editingExpense}
        onOpenChange={(open) => !open && setEditingExpense(null)}
        onSave={handleUpdate}
      />
      <ImagePreview
        src={selectedImage || ''}
        alt="Beleg Vorschau"
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
      />
      <AlertDialog open={!!expenseToDelete} onOpenChange={(open) => !open && setExpenseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Der Beleg wird permanent gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MotionDiv>
  )
}
