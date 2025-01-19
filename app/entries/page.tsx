"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Loader2, CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, forwardRef } from "react"
import { useExpenseStore } from '@/lib/store'
import { EditModal } from "./edit-modal"
import { Expense } from "@/lib/api"
import { ImagePreview } from "@/components/ui/image-preview"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
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
import { cn, formatDate } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Checkbox } from "@/components/ui/checkbox"

const MotionDiv = motion.create("div")
const MotionTr = motion.create("tr")
const MotionButton = motion.create(Button)

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
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);

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

  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const PaginationControls = () => {
    if (totalPages <= 1) return null

    return (
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }} // Added delay and increased duration
        className="flex justify-center items-center gap-2 mt-6"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <MotionButton
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(page)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {page}
          </MotionButton>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </MotionDiv>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4, // Increased from 0.2
        duration: 1.2, // Increased from 0.8
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
        duration: 0.8, // Increased from 0.6
        ease: "easeOut"
      }
    }
  }

  const handleSelectExpense = (id: string, checked: boolean) => {
    setSelectedExpenses(prev => 
      checked ? [...prev, id] : prev.filter(expId => expId !== id)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedExpenses(checked ? filteredExpenses.map(exp => exp.id) : []);
  };

  const handleDeleteSelected = async () => {
    setIsDeletingMultiple(true);
    try {
      // Sequentiell löschen um die Datenbank nicht zu überlasten
      for (const id of selectedExpenses) {
        await deleteExpense(id);
      }
      toast.success(`${selectedExpenses.length} Belege gelöscht`);
      setSelectedExpenses([]);
    } catch {
      toast.error('Fehler beim Löschen der Belege');
    } finally {
      setIsDeletingMultiple(false);
    }
  };

  const MobileExpenseCard = forwardRef<HTMLDivElement, { entry: Expense }>(
    ({ entry }, ref) => (
      <MotionDiv
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ 
          duration: 0.8, // Added explicit duration
          ease: "easeOut"
        }}
        className="mb-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Checkbox
                checked={selectedExpenses.includes(entry.id)}
                onCheckedChange={(checked) => 
                  handleSelectExpense(entry.id, checked as boolean)
                }
                className="mt-1"
              />
              <div 
                className="h-16 w-16 relative rounded overflow-hidden cursor-pointer flex-shrink-0"
                onClick={() => setSelectedImage(entry.image)}
              >
                <Image
                  src={entry.image}
                  alt="Beleg"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {(() => {
                        const category = EXPENSE_CATEGORIES.find(c => c.value === entry.category)
                        if (category) {
                          const Icon = category.icon
                          return (
                            <>
                              <Icon className="h-4 w-4" />
                              <span className="font-medium">{category.label}</span>
                            </>
                          )
                        }
                        return entry.category
                      })()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(entry.date)}
                    </p>
                  </div>
                  <p className="font-bold">{entry.amount.toFixed(2)} €</p>
                </div>
                {entry.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {entry.description}
                  </p>
                )}
                {entry.category === 'travel' && entry.kilometers && (
                  <p className="text-sm text-muted-foreground">
                    {entry.kilometers.toFixed(1)} km
                  </p>
                )}
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(entry.id)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(entry.id)}
                    disabled={deletingId === entry.id}
                  >
                    {deletingId === entry.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </MotionDiv>
    )
  )
  MobileExpenseCard.displayName = 'MobileExpenseCard'

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
      transition={{ duration: 1.2 }} // Increased from 0.8
      className="container py-10"
    >
      <Card>
        <CardHeader>
          <MotionDiv
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 1 }} // Increased delay and duration
          >
            <CardTitle>Ausgabenübersicht</CardTitle>
          </MotionDiv>
          {selectedExpenses.length > 0 && (
            <MotionDiv
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between mt-2 p-2 bg-muted rounded-lg"
            >
              <span className="text-sm">
                {selectedExpenses.length} Belege ausgewählt
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={isDeletingMultiple}
              >
                {isDeletingMultiple ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Ausgewählte löschen
                  </>
                )}
              </Button>
            </MotionDiv>
          )}
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

          {isMobile ? (
            <div className="mt-6">
              <AnimatePresence mode="popLayout">
                {paginatedExpenses.map((entry) => (
                  <MobileExpenseCard key={entry.id} entry={entry} />
                ))}
              </AnimatePresence>
              {filteredExpenses.length === 0 && (
                <MotionDiv
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center py-8"
                >
                  {expenses.length === 0 ? 'Keine Einträge vorhanden' : 'Keine Einträge gefunden'}
                </MotionDiv>
              )}
              <PaginationControls />
            </div>
          ) : (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30px]">
                      <Checkbox
                        checked={
                          filteredExpenses.length > 0 &&
                          selectedExpenses.length === filteredExpenses.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Beleg</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Beschreibung</TableHead>
                    <TableHead className="text-right">Betrag</TableHead>
                    <TableHead className="text-right">KM</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {paginatedExpenses.map((entry, index) => (
                      <MotionTr
                        key={entry.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ 
                          duration: 0.8, // Increased from 0.6
                          delay: index * 0.25, // Increased from 0.15
                          ease: "easeOut"
                        }}
                        className="relative"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedExpenses.includes(entry.id)}
                            onCheckedChange={(checked) => 
                              handleSelectExpense(entry.id, checked as boolean)
                            }
                          />
                        </TableCell>
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
                          {formatDate(entry.date)}
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
                          {entry.category === 'travel' && entry.kilometers ? 
                            `${entry.kilometers.toFixed(1)} km` : 
                            '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(entry.id)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
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
                          </div>
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
                      <TableCell colSpan={8} className="text-center py-8">
                        {expenses.length === 0 ? 'Keine Einträge vorhanden' : 'Keine Einträge gefunden'}
                      </TableCell>
                    </MotionTr>
                  )}
                </TableBody>
              </Table>
              <PaginationControls />
            </div>
          )}
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
