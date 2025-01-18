"use client"

import Link from "next/link"
import { HomeIcon, ListTodo, PlusCircle, Sun, Moon } from "lucide-react"
import { ModeToggle } from "./mode-toggle"
import { Button } from "./ui/button"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

// Aktualisierte Motion-Komponenten-Erstellung
const AnimatedLink = motion.create(Link)

export function SiteHeader() {
  const { setTheme, theme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center mr-4">
          <AnimatedLink 
            href="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="ghost" size="sm">
              <HomeIcon className="h-4 w-4 mr-2" />
              Home
            </Button>
          </AnimatedLink>
        </div>
        <div className="flex flex-1">
          <nav className="hidden md:flex items-center space-x-2">
            <AnimatedLink 
              href="/upload"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="ghost" size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Neue Ausgabe
              </Button>
            </AnimatedLink>
            <AnimatedLink 
              href="/entries"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="ghost" size="sm">
                <ListTodo className="h-4 w-4 mr-2" />
                Ausgabenübersicht
              </Button>
            </AnimatedLink>
          </nav>
        </div>
        <div className="hidden md:flex">
          <ModeToggle />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background">
        <nav className="container flex justify-around py-2">
          <AnimatedLink 
            href="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="ghost" size="sm">
              <HomeIcon className="h-5 w-5" />
            </Button>
          </AnimatedLink>
          <AnimatedLink 
            href="/upload"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="ghost" size="sm">
              <PlusCircle className="h-5 w-5" />
            </Button>
          </AnimatedLink>
          <AnimatedLink 
            href="/entries"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="ghost" size="sm">
              <ListTodo className="h-5 w-5" />
            </Button>
          </AnimatedLink>
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
        </nav>
      </div>
    </header>
  )
}
