"use client"

import { Expense } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { EXPENSE_CATEGORIES } from "@/lib/constants"

interface EditModalProps {
  expense: Expense | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (expense: Partial<Expense>) => Promise<void>
}

export function EditModal({ expense, open, onOpenChange, onSave }: EditModalProps) {
  const [formData, setFormData] = useState<Partial<Expense>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        kilometers: expense.kilometers
      })
    }
  }, [expense])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to update expense:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ausgabe bearbeiten</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Betrag (€)</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.amount || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategorie</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategorie wählen">
                  {formData.category && (
                    <div className="flex items-center gap-2">
                      {(() => {
                        const category = EXPENSE_CATEGORIES.find(c => c.value === formData.category)
                        if (category) {
                          const Icon = category.icon
                          return (
                            <>
                              <Icon className="h-4 w-4" />
                              {category.label}
                            </>
                          )
                        }
                      })()}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
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
          </div>

          {formData.category === 'travel' && (
            <div className="space-y-2">
              <Label htmlFor="kilometers">Kilometer (optional)</Label>
              <Input
                id="kilometers"
                type="number"
                min="0"
                step="0.1"
                value={formData.kilometers || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  kilometers: e.target.value ? parseFloat(e.target.value) : undefined 
                }))}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                'Speichern'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
