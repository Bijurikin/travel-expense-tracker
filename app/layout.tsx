import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "sonner";
import localFont from "next/font/local";
import "./globals.css";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Travel Expense Tracker',
  description: 'Track and manage your travel expenses efficiently',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      }
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
        <Toaster 
          theme="system" 
          closeButton 
          position="top-right"
          toastOptions={{
            classNames: {
              toast: "bg-background border border-border text-foreground",
              title: "text-foreground",
              description: "text-muted-foreground",
              actionButton: "text-foreground",
              cancelButton: "text-foreground",
              success: "bg-success border-success text-foreground [&_.description]:text-muted-foreground [&_.title]:text-foreground",
              error: "bg-destructive border-destructive text-foreground [&_.description]:text-muted-foreground [&_.title]:text-foreground",
              info: "bg-muted border-border text-foreground [&_.description]:text-muted-foreground [&_.title]:text-foreground",
              warning: "bg-warning border-warning text-foreground [&_.description]:text-muted-foreground [&_.title]:text-foreground",
            },
          }}
        />
      </body>
    </html>
  );
}
