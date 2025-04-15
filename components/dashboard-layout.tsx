"use client"

import type React from "react"
import {useState} from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import {Button} from "@/components/ui/button"
import {ModeToggle} from "@/components/mode-toggle"
import {GitBranch, Layers, LayoutDashboard, LogOut, Server, Settings, Terminal, User} from "lucide-react"
import Link from "next/link"
import {usePathname} from "next/navigation"

export function DashboardLayout({children}: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [user] = useState({
        name: "Admin User",
        email: "admin@example.com",
    })

    const mainNavItems = [
        {
            title: "Dashboard",
            href: "/",
            icon: LayoutDashboard,
        },
        {
            title: "Projects",
            href: "/projects",
            icon: Layers,
        },
        {
            title: "Deployments",
            href: "/deployments",
            icon: GitBranch,
        },
        {
            title: "Containers",
            href: "/containers",
            icon: Server,
        },
        {
            title: "Console",
            href: "/console",
            icon: Terminal,
        },
    ]

    const utilityNavItems = [
        {
            title: "Settings",
            href: "/settings",
            icon: Settings,
        },
    ]

    return (
        <SidebarProvider>
            <div className="flex min-h-screen">
                <Sidebar variant="inset" className="glass-sidebar">
                    <SidebarHeader className="p-4">
                        <div className="flex items-center gap-2">
                            <Server className="h-6 w-6"/>
                            <h1 className="text-xl font-bold">Reflow</h1>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Main</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {mainNavItems.map((item) => (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton asChild isActive={pathname === item.href}
                                                               tooltip={item.title}>
                                                <Link href={item.href}>
                                                    <item.icon className="h-4 w-4"/>
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarGroup>
                            <SidebarGroupLabel>Utilities</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {utilityNavItems.map((item) => (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton asChild isActive={pathname === item.href}
                                                               tooltip={item.title}>
                                                <Link href={item.href}>
                                                    <item.icon className="h-4 w-4"/>
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                    <SidebarFooter className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-4 w-4"/>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{user.name}</span>
                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                </div>
                            </div>
                            <ModeToggle/>
                        </div>
                    </SidebarFooter>
                </Sidebar>

                <SidebarInset className="flex flex-col">
                    <header className="glass-header h-16 flex items-center justify-between px-6 sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger/>
                            <h2 className="text-lg font-medium">Deployment Manager</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                                <LogOut className="h-4 w-4 mr-2"/>
                                Logout
                            </Button>
                        </div>
                    </header>
                    <main className="flex-1 p-6 overflow-auto">{children}</main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
