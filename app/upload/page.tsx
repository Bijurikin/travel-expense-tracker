"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, Camera, Upload, CalendarIcon, CheckCircle, AlertCircle, Info, X } from "lucide-react"
import { useRouter } from 'next/navigation'
import { useExpenseStore } from '@/lib/store'
import Image from 'next/image'
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { EXPENSE_CATEGORIES } from "@/lib/constants"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

const MotionDiv = motion.div

const AnalyzingIndicator = () => (
  <div className="relative p-4 border rounded-lg bg-muted/50">
    <div className="flex items-center gap-4">
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full bg-primary"
          initial={{ opacity: 0.25, scale: 1 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-primary"
          initial={{ opacity: 0.25, scale: 1 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.75
          }}
        />
        <div className="relative z-10 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
        </div>
      </div>
      <div className="flex-1">
        <motion.h4
          className="text-sm font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Beleg wird analysiert
        </motion.h4>
        <p className="text-sm text-muted-foreground">
          KI extrahiert Informationen...
        </p>
      </div>
    </div>
  </div>
);

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

interface ExpenseError {
  message: string;
  code?: string;
}

interface ReceiptData {
  amount: number | null;
  date: Date | null;
  description: string | null;
  category: string | null;
}

interface GeminiAPIError extends Error {
  details?: {
    domain?: string;
    reason?: string;
  };
}

function getMimeTypeFromBase64(base64String: string): string {
  const match = base64String.match(/^data:(.*?);base64,/);
  return match ? match[1] : "application/octet-stream";
}

const analyzeReceipt = async (fileBase64: string): Promise<ReceiptData | null> => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('API Key fehlt oder ist ungültig.');
    toast.error('API Konfigurationsfehler', {
      description: 'API-Schlüssel fehlt oder ist ungültig. Bitte prüfen.'
    });
    return null;
  }

  const mimeType = getMimeTypeFromBase64(fileBase64);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const categoriesInfo = EXPENSE_CATEGORIES.map(cat => 
      `${cat.value}: ${cat.label}`
    ).join(', ');

    const base64Data = fileBase64.split(',')[1];

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType
        }
      },
      `Analysiere diesen Beleg im Detail und extrahiere folgende Informationen:

      1. Gesamtbetrag:
         - Suche nach Begriffen wie "Gesamt", "Total", "zu zahlen", "Endbetrag"
         - Verwende immer den Endbetrag inklusive aller Steuern und Gebühren
         - Gib nur die Zahl ohne Währungssymbol zurück

      2. Datum:
         - Finde das Belegdatum
         - Gib es im Format YYYY-MM-DD zurück

      3. Beschreibung:
         - Analysiere, was gekauft oder welche Dienstleistung erbracht wurde
         - Identifiziere den Geschäfts-/Firmennamen
         - Bei Restaurants: Art der Mahlzeit angeben (Frühstück, Mittagessen, Abendessen), falls erkennbar
         - Bei Reisen: Transportmittel und Ziel angeben, falls sichtbar
         - Bei Unterkünften: Hotelname und Anzahl der Übernachtungen, falls sichtbar
         - Erstelle eine kurze, aber aussagekräftige Zusammenfassung ohne Berträge

      4. Kategorie:
         - Wähle basierend auf den Artikeln/Dienstleistungen die passendste Kategorie
         - Wähle aus: ${categoriesInfo}
         - Berücksichtige sowohl die Art des Geschäfts als auch die tatsächlichen Einkäufe

      Gib NUR ein sauberes JSON mit den Feldern: amount, date, description, category zurück.
      Die Beschreibung soll detailliert, aber prägnant sein.`
    ]);

    const response = await result.response;
    const text = response.text();

    try {
      const cleanedResult = text.replace(/```json\s*|\s*```/g, '').trim();
      const parsed = JSON.parse(cleanedResult);
      
      const data: ReceiptData = {
        amount: parsed.amount ? Number(parseFloat(String(parsed.amount)).toFixed(2)) : null,
        date: parsed.date ? new Date(parsed.date) : null,
        description: parsed.description || null,
        category: parsed.category || null
      };

      return data;
    } catch (e) {
      console.error('Parsing-Fehler:', e);
      throw e;
    }
  } catch (error) {
    const geminiError = error as GeminiAPIError;
    console.error('API-Fehler:', geminiError.message);
    throw new Error(`API Fehler: ${geminiError.message}`);
  }
};

export default function UploadPage() {
  const router = useRouter();
  const addExpense = useExpenseStore(state => state.addExpense);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    image: '',
    date: new Date(),
    kilometers: ''
  });
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [imageQueue, setImageQueue] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [skipAI, setSkipAI] = useState(true);
  const [autoProcess, setAutoProcess] = useState(false);
  const [processedData, setProcessedData] = useState<{
    amount: string;
    category: string;
    description: string;
    date: Date;
  } | null>(null);
  const processedDataRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoProcess) {
      setSkipAI(false);
    }
  }, [autoProcess]);

  useEffect(() => {
    if (processedData && processedDataRef.current) {
      processedDataRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [processedData]);

  const resetForm = async () => {
    setFormData({
      amount: '',
      category: '',
      description: '',
      image: '',
      date: new Date(),
      kilometers: ''
    });
    
    if (currentImageIndex < imageQueue.length - 1) {
      const nextIndex = currentImageIndex + 1;
      setCurrentImageIndex(nextIndex);
      const nextImage = imageQueue[nextIndex];
      setPreview(nextImage);
      
      if (!skipAI) {
        setIsAnalyzing(true);
        try {
          const extractedData = await analyzeReceipt(nextImage);
          if (extractedData) {
            setFormData(prev => ({
              ...prev,
              amount: extractedData.amount?.toString() || '',
              date: extractedData.date || new Date(),
              description: extractedData.description || '',
              category: extractedData.category || ''
            }));
            toast.success('Nächster Beleg analysiert', {
              icon: <CheckCircle className="h-4 w-4 text-green-500" />,
              description: 'Die Daten wurden automatisch ausgefüllt. Bitte überprüfen.'
            });
          }
        } catch (error: unknown) {
          toast.error('Analyse fehlgeschlagen', {
            icon: <AlertCircle className="h-4 w-4 text-red-500" />,
            description: error instanceof Error ? error.message : 'Bitte Felder manuell ausfüllen.'
          });
        } finally {
          setIsAnalyzing(false);
        }
      } else {
        toast.info('KI-Analyse übersprungen', {
          icon: <Info className="h-4 w-4 text-blue-500" />,
          description: 'Bitte Felder manuell ausfüllen.'
        });
      }
    } else {
      setImageQueue([]);
      setCurrentImageIndex(0);
      setPreview(null);
    }
  };

  const handleNewReceipt = () => {
    setShowSuccessDialog(false);
    resetForm();
  };

  const handleViewAll = () => {
    router.push('/entries');
  };

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsAnalyzing(true);
    toast.info(`${files.length} Beleg(e) werden verarbeitet...`, {
      icon: <Info className="h-4 w-4 text-blue-500" />
    });

    try {
      const fileBase64s = await Promise.all(
        files.map(file => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      setImageQueue(fileBase64s);
      const firstFile = fileBase64s[0];
      setPreview(firstFile);
      setCurrentImageIndex(0);
      
      if (autoProcess) {
        for (let i = 0; i < fileBase64s.length; i++) {
          const currentFile = fileBase64s[i];
          setPreview(currentFile);
          setCurrentImageIndex(i);

          if (!skipAI) {
            const data = await analyzeReceipt(currentFile);
            if (data) {
              setProcessedData({
                amount: data.amount?.toString() || '',
                category: data.category || '',
                description: data.description || '',
                date: data.date || new Date(),
              });

              await addExpense({
                amount: data.amount || 0,
                category: data.category || 'other',
                description: data.description || '',
                image: currentFile,
                date: data.date?.toISOString() || new Date().toISOString(),
              });

              toast.success(`Beleg ${i + 1} von ${fileBase64s.length} verarbeitet`);
            }
          } else {
            toast.info(`Beleg ${i + 1} von ${fileBase64s.length} übersprungen (KI deaktiviert)`);
          }
        }
        
        setProcessedData(null);
        toast.success('Alle Belege wurden verarbeitet');
        router.push('/entries');
      } else {
        if (!skipAI) {
          const extractedData = await analyzeReceipt(firstFile);
          if (extractedData) {
            setFormData(prev => ({
              ...prev,
              amount: extractedData.amount?.toString() || '',
              date: extractedData.date || new Date(),
              description: extractedData.description || '',
              category: extractedData.category || ''
            }));
            toast.success('Beleg analysiert');
          }
        }
      }
    } catch (error: unknown) {
      toast.error('Fehler beim Laden', {
        description: error instanceof Error ? error.message : 'Die Belege konnten nicht verarbeitet werden.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteImage = () => {
    setPreview(null);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateForm = () => {
    if (!preview) {
      return { isValid: false, error: "Bitte fügen Sie ein Bild oder PDF hinzu." }
    }
    if (!formData.amount) {
      return { isValid: false, error: "Bitte geben Sie einen Betrag ein." }
    }
    if (!formData.category) {
      return { isValid: false, error: "Bitte wählen Sie eine Kategorie aus." }
    }
    return { isValid: true }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateForm();
    if (!validation.isValid) {
      toast.error('Fehlerhafte Eingabe', {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        description: validation.error
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const newExpense = {
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        image: preview || '',
        date: formData.date.toISOString(),
        kilometers: formData.kilometers ? parseFloat(formData.kilometers) : undefined
      };
      
      await addExpense(newExpense);
      toast.success('Ausgabe erfolgreich gespeichert', {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        description: 'Ihre Ausgabe wurde erfolgreich hinzugefügt.'
      });

      if (currentImageIndex < imageQueue.length - 1) {
        resetForm();
      } else {
        setShowSuccessDialog(true);
      }
    } catch (error: unknown) {
      const expenseError = error as ExpenseError;
      toast.error('Fehler beim Speichern', {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        description: expenseError.message || 'Bitte versuchen Sie es später erneut.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isMobile = useIsMobile();

  const ProgressDisplay = () => (
    <div className="flex items-center gap-2 mt-2">
      <div className="text-sm text-gray-500">
        Beleg {currentImageIndex + 1} von {imageQueue.length}
      </div>
      <div className="h-2 flex-1 bg-gray-200 rounded-full">
        <div 
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${((currentImageIndex + 1) / imageQueue.length) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <>
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="container py-10"
      >
        <MotionDiv
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            duration: 0.8,
            delay: 0.3,
            type: "spring", 
            stiffness: 100,
            damping: 20
          }}
        >
          <Card>
            <CardHeader>
              <MotionDiv
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.8,
                  delay: 0.6,
                  ease: "easeOut"
                }}
              >
                <CardTitle>Neue Ausgabe erfassen</CardTitle>
                <CardDescription>
                  Fügen Sie eine neue Reiseausgabe mit Beleg (Bild oder PDF) hinzu
                </CardDescription>
              </MotionDiv>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <MotionDiv
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="space-y-2"
                >
                  <Label>Beleg hinzufügen</Label>
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
                    accept="image/*,application/pdf"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  <div className="flex gap-2">
                    {isMobile && (
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => cameraInputRef.current?.click()}
                        disabled={isAnalyzing}
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
                      disabled={isAnalyzing}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Beleg(e) hochladen
                    </Button>
                  </div>

                  <div className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>KI-Analyse deaktivieren</Label>
                        <p className="text-sm text-muted-foreground">
                          Belege ohne automatische Texterkennung erfassen
                        </p>
                      </div>
                      <Switch
                        checked={skipAI}
                        onCheckedChange={setSkipAI}
                        disabled={isAnalyzing || isSubmitting || autoProcess}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Automatische Verarbeitung</Label>
                        <p className="text-sm text-muted-foreground">
                          Alle Belege automatisch analysieren und speichern
                        </p>
                      </div>
                      <Switch
                        checked={autoProcess}
                        onCheckedChange={setAutoProcess}
                        disabled={isAnalyzing || isSubmitting}
                      />
                    </div>
                  </div>

                  {preview && (
                    <MotionDiv
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      className="mt-2 relative group"
                    >
                      {preview.startsWith("data:application/pdf") ? (
                        <div className="p-4 border rounded bg-muted flex items-center justify-between">
                          <div className="text-sm font-medium">PDF-Datei ausgewählt</div>
                          {!autoProcess && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={handleDeleteImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="relative h-48">
                          <Image 
                            src={preview} 
                            alt="Preview" 
                            fill
                            className="object-contain rounded"
                          />
                          {!autoProcess && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={handleDeleteImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </MotionDiv>
                  )}
                </MotionDiv>

                {imageQueue.length > 0 && (
                  <div className="space-y-2">
                    <ProgressDisplay />
                    <div className="text-sm text-muted-foreground">
                      {isAnalyzing ? (
                        <AnalyzingIndicator />
                      ) : (
                        `Beleg ${currentImageIndex + 1} von ${imageQueue.length}`
                      )}
                    </div>
                  </div>
                )}

                {imageQueue.length > 0 && processedData && (
                  <div 
                    ref={processedDataRef}
                    className="mt-4 p-4 border rounded-lg bg-muted"
                  >
                    <h3 className="font-medium mb-2">Zuletzt verarbeiteter Beleg:</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Betrag:</span>
                        <span className="font-medium">{processedData.amount} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Datum:</span>
                        <span className="font-medium">{format(processedData.date, "PPP", { locale: de })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kategorie:</span>
                        <span className="font-medium">
                          {EXPENSE_CATEGORIES.find(c => c.value === processedData.category)?.label || processedData.category}
                        </span>
                      </div>
                      {processedData.description && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Beschreibung:</span>
                          <span className="font-medium">{processedData.description}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!autoProcess && (
                  <>
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Kategorie</Label>
                      <Select 
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kategorie wählen">
                            {formData.category && (() => {
                              const category = EXPENSE_CATEGORIES.find(c => c.value === formData.category);
                              if (category) {
                                return (
                                  <div className="flex items-center gap-2">
                                    <category.icon className="h-4 w-4" />
                                    {category.label}
                                  </div>
                                );
                              }
                              return formData.category;
                            })()}
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
                          placeholder="0.0"
                          value={formData.kilometers}
                          onChange={(e) => setFormData(prev => ({ ...prev, kilometers: e.target.value }))}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="description">Beschreibung</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Optionale Beschreibung der Ausgabe"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <MotionDiv
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          'Ausgabe speichern'
                        )}
                      </Button>
                    </MotionDiv>
                  </>
                )}
              </form>
            </CardContent>
          </Card>
        </MotionDiv>
      </MotionDiv>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Beleg erfolgreich gespeichert</DialogTitle>
            <DialogDescription>
              Möchten Sie einen weiteren Beleg erfassen oder zur Übersicht wechseln?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 justify-end mt-4">
            <Button
              variant="outline"
              onClick={handleViewAll}
            >
              Zur Übersicht
            </Button>
            <Button
              onClick={handleNewReceipt}
            >
              Weiteren Beleg erfassen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}