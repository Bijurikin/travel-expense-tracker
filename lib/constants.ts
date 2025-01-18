import { Plane, Hotel, Utensils, MoreHorizontal } from "lucide-react"

export const EXPENSE_CATEGORIES = [
  { value: 'travel', label: 'Reise', icon: Plane },
  { value: 'accommodation', label: 'Unterkunft', icon: Hotel },
  { value: 'food', label: 'Verpflegung', icon: Utensils },
  { value: 'other', label: 'Sonstiges', icon: MoreHorizontal }
] as const

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]['value']
