"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, Camera, Upload, CalendarIcon } from "lucide-react"
import { useRouter } from 'next/navigation'
import { useExpenseStore } from '@/lib/store'
import Image from 'next/image'
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const MotionDiv = motion.div

// Ersetze die isMobile-Funktion mit einer useIsMobile Hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

export default function UploadPage() {
  const router = useRouter()
  const addExpense = useExpenseStore(state => state.addExpense)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    image: '',
    date: new Date()
  })
  const [errors, setErrors] = useState({
    amount: '',
    category: '',
    description: '',
    image: '',
    date: ''
  })

  // Separate refs for camera and file inputs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Replace the single handleImageChange with:
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors = {
      amount: '',
      category: '',
      description: '',
      image: '',
      date: ''
    }

    if (!formData.amount) {
      newErrors.amount = 'Bitte geben Sie einen Betrag ein'
    }

    if (!formData.category) {
      newErrors.category = 'Bitte wählen Sie eine Kategorie aus'
    }

    if (!formData.date) {
      newErrors.date = 'Bitte wählen Sie ein Datum aus'
    }

    setErrors(newErrors)

    return !Object.values(newErrors).some(error => error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    if (!validateForm()) {
      setIsSubmitting(false)
      return
    }

    try {
      const newExpense = {
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        image: preview || '',
        date: formData.date.toISOString()
      }

      console.log('Submitting expense:', newExpense) // Debug log
      
      await addExpense(newExpense)
      router.push('/entries')
    } catch (error) {
      console.error('Failed to save expense:', error)
      alert('Fehler beim Speichern der Ausgabe')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isMobile = useIsMobile();

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container py-10"
    >
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Neue Ausgabe erfassen</CardTitle>
            <CardDescription>
              Fügen Sie eine neue Reiseausgabe mit Beleg hinzu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <MotionDiv
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="space-y-2"
              >
                <Label>Beleg hinzufügen</Label>
                
                {/* Hidden inputs */}
                <input 
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <input 
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {/* Button group */}
                <div className="flex gap-2">
                  {isMobile && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Foto aufnehmen
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Datei hochladen
                  </Button>
                </div>

                {/* Preview image */}
                {preview && (
                  <MotionDiv
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2"
                  >
                    <div className="relative h-48">
                      <Image 
                        src={preview} 
                        alt="Preview" 
                        fill
                        className="object-contain rounded"
                      />
                    </div>
                  </MotionDiv>
                )}
              </MotionDiv>

              <div className="space-y-2">
                <Label htmlFor="date">Datum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP", { locale: de }) : <span>Datum wählen</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => setFormData(prev => ({ ...prev, date: date || new Date() }))}
                      initialFocus
                      locale={de}
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Betrag (€)</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  min="0.01" 
                  step="0.01"
                  placeholder="0.00"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                />
                {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategorie</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="travel">Reise</SelectItem>
                    <SelectItem value="accommodation">Unterkunft</SelectItem>
                    <SelectItem value="food">Verpflegung</SelectItem>
                    <SelectItem value="other">Sonstiges</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea 
                  id="description" 
                  placeholder="Optionale Beschreibung der Ausgabe"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <MotionDiv whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird gespeichert...
                    </>
                  ) : (
                    'Ausgabe speichern'
                  )}
                </Button>
              </MotionDiv>
            </form>
          </CardContent>
        </Card>
      </div>
    </MotionDiv>
  )
}
