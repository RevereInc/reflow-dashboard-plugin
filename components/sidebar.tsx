"use client"

import {useEffect, useState} from "react"
import Link from "next/link"
import {usePathname} from "next/navigation"
import {
    CreditCard,
    GitBranch,
    Layers,
    LayoutDashboard,
    Menu,
    Mountain,
    Server,
    Settings,
    Terminal,
    X,
} from "lucide-react"
import {cn} from "@/lib/utils"
import {Badge} from "@/components/ui/badge"

const navigationItems = {
    overview: [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: "/",
            color: "text-sky-500",
            description: "Overview of your snippets",
        },
    ],
    management: [
        {
            label: "Projects",
            icon: Layers,
            href: "/projects",
            color: "text-emerald-500",
            description: "Manage your projects",
        },
        {
            label: "Deployments",
            icon: GitBranch,
            href: "/deployments",
            color: "text-violet-500",
            description: "View your deployments",
            badge: "New",
        },
        {
            label: "Containers",
            icon: Server,
            href: "/containers",
            color: "text-amber-500",
            description: "Manage your containers",
        },
    ],
    debug: [
        {
            label: "Console",
            icon: Terminal,
            href: "/console",
            color: "text-blue-500",
            description: "View console logs",
        },
    ],
}

export function DashboardSidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(true)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkScreenSize = () => {
            if (window.innerWidth < 768) {
                setIsMobile(true)
                setIsOpen(false)
            } else {
                setIsMobile(false)
                setIsOpen(true)
            }
        }

        checkScreenSize()
        window.addEventListener("resize", checkScreenSize)
        return () => window.removeEventListener("resize", checkScreenSize)
    }, [])

    const toggleSidebar = () => {
        setIsOpen(!isOpen)
    }

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === href
        }
        return pathname?.startsWith(href) && href !== "/"
    }

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={toggleSidebar}
                className={cn(
                    "fixed z-50 md:hidden p-2 bg-background text-foreground shadow-md rounded-md transition-all duration-300",
                    isOpen ? "left-[16rem] top-2" : "left-4 top-20",
                )}
                aria-label="Toggle Sidebar"
            >
                {isOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
            </button>

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen border-r flex flex-col transition-all duration-300 ease-in-out bg-background",
                    isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full",
                    "md:translate-x-0",
                )}
            >
                {/* Header */}
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <Mountain className="h-6 w-6"/>
                        <span className="font-bold text-lg">Reflow</span>
                    </Link>
                </div>

                {/* Main Navigation */}
                <div className="flex-1 overflow-y-auto py-4 px-4">
                    {/* Overview Section */}
                    <div className="mb-6">
                        <h2 className="px-2 text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Overview</h2>
                        <div className="space-y-1">
                            {navigationItems.overview.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                                        isActive(item.href)
                                            ? "bg-accent text-accent-foreground font-medium"
                                            : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5", item.color)}/>
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Management Section */}
                    <div className="mb-6">
                        <h2 className="px-2 text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">Management</h2>
                        <div className="space-y-1">
                            {navigationItems.management.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent group",
                                        isActive(item.href)
                                            ? "bg-accent text-accent-foreground font-medium"
                                            : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={cn("h-5 w-5", item.color)}/>
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <Badge variant="outline"
                                               className="text-xs bg-primary/10 text-primary border-primary/20">
                                            {item.badge}
                                        </Badge>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Debug Section */}
                    <div className="mb-6">
                        <h2 className="px-2 text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">
                            Debug
                        </h2>
                        <div className="space-y-1">
                            {navigationItems.debug.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent group",
                                        isActive(item.href)
                                            ? "bg-accent text-accent-foreground font-medium"
                                            : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={cn("h-5 w-5", item.color)}/>
                                        <span>{item.label}</span>
                                    </div>

                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
