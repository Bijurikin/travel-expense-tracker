"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Loader2 } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { useExpenseStore } from '@/lib/store'
import { EditModal } from "./edit-modal"
import { Expense } from "@/lib/api"
import { ImagePreview } from "@/components/ui/image-preview"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const MotionDiv = motion.div
const MotionTr = motion.tr

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
    setDeletingId(id)
    try {
      await deleteExpense(id)
    } catch (error) {
      console.error('Failed to delete expense:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(filters.search.toLowerCase())
    const matchesCategory = filters.category === 'all' || expense.category === filters.category
    const matchesDateRange = (!filters.startDate || new Date(expense.date) >= new Date(filters.startDate)) &&
                           (!filters.endDate || new Date(expense.date) <= new Date(filters.endDate))
    
    return matchesSearch && matchesCategory && matchesDateRange
  })

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container py-10"
    >
      <Card>
        <CardHeader>
          <CardTitle>Ausgabenübersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <div>
              <Input
                placeholder="Suche nach Beschreibung..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  <SelectItem value="travel">Reise</SelectItem>
                  <SelectItem value="accommodation">Unterkunft</SelectItem>
                  <SelectItem value="food">Verpflegung</SelectItem>
                  <SelectItem value="other">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>

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
                {filteredExpenses.map((entry) => (
                  <MotionTr
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
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
                    <TableCell>{entry.category}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="text-right">
                      {entry.amount.toFixed(2)} €
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <MotionDiv whileHover={{ scale: 1.1 }}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(entry.id)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </MotionDiv>
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
    </MotionDiv>
  )
}
