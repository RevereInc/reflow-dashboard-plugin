import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { DashboardLayout } from "@/components/dashboard-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Reflow Deployment Manager",
  description: "Manage your deployments with ease"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="flex h-screen overflow-hidden bg-background">
              <DashboardSidebar/>

              <div className="flex flex-1 flex-col overflow-hidden md:ml-64">
                  <main className="flex-1 overflow-y-auto">
                      <div className="p-6">
                          {children}
                      </div>
                  </main>
              </div>
          </div>
      </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'
import {DashboardSidebar} from "@/components/sidebar";