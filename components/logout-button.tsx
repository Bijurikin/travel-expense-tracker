"use client"

import { LogOut } from "lucide-react"
import { Button } from "./ui/button"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState } from "react"

export function LogoutButton() {
  const logout = useAuthStore((state) => state.logout)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logout()
      // Kurze Verzögerung für bessere UX
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push("/login")
      toast.success("Erfolgreich abgemeldet")
    } catch (error) {
      console.error('Logout error:', error)
      // Zeige Toast auch bei Fehlern, da der Logout durch State-Reset trotzdem funktioniert
      toast.success("Erfolgreich abgemeldet")
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="gap-2"
      disabled={isLoading}
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden md:inline">
        {isLoading ? "Wird abgemeldet..." : "Abmelden"}
      </span>
    </Button>
  )
}
