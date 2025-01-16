"use client"

import { useAuthStore } from "@/lib/auth-store"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { SiteHeader } from "./site-header"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthenticated && pathname !== "/login") {
      router.push("/login")
    }
    if (isAuthenticated && pathname === "/login") {
      router.push("/")
    }
  }, [isAuthenticated, pathname, router])

  return (
    <div className="relative flex min-h-screen flex-col items-center">
      <div className="w-full max-w-5xl">
        {isAuthenticated && <SiteHeader />}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
