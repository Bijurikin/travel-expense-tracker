"use client"

import Link from "next/link"
import Image from "next/image"
import { HomeIcon, ListTodo, PlusCircle, Sun, Moon } from "lucide-react"
import { ModeToggle } from "./mode-toggle"
import { Button } from "./ui/button"
import { useTheme } from "next-themes"
import { LogoutButton } from "./logout-button"

export function SiteHeader() {
  const { setTheme, theme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center mr-8">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/CFP-Logo.png"
              alt="CFP Logo"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <HomeIcon className="h-6 w-6" />
          </Link>
        </div>
        <div className="flex items-center space-x-4 md:flex-1">
          <nav className="hidden md:flex items-center space-x-2">
            <Link href="/upload">
              <Button variant="ghost" size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Neue Ausgabe
              </Button>
            </Link>
            <Link href="/entries">
              <Button variant="ghost" size="sm">
                <ListTodo className="h-4 w-4 mr-2" />
                Ausgabenübersicht
              </Button>
            </Link>
          </nav>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <ModeToggle />
          <LogoutButton />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background">
        <nav className="container flex justify-around py-2">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <HomeIcon className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/upload">
            <Button variant="ghost" size="sm">
              <PlusCircle className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/entries">
            <Button variant="ghost" size="sm">
              <ListTodo className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <LogoutButton />
        </nav>
      </div>
    </header>
  )
}
