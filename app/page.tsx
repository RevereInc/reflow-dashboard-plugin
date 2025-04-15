import {Suspense} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Skeleton} from "@/components/ui/skeleton"
import {CheckCircle2, Clock, GitBranch, LayoutDashboard, RefreshCw, Server, Terminal} from "lucide-react"
import Link from "next/link"
import {ProjectsOverview} from "@/components/projects-overview"
import {RecentDeployments} from "@/components/recent-deployments"
import {SystemStatus} from "@/components/system-status"
import {getProjectsAction} from "@/app/actions";

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-2 glass-card">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <LayoutDashboard className="h-8 w-8"/>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight">Deployment Manager</h2>
                                    <p className="text-muted-foreground">Monitor and manage your deployments with
                                        ease</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button asChild>
                                    <Link href="/projects/new">
                                        <Server className="mr-2 h-4 w-4"/> New Project
                                    </Link>
                                </Button>
                                <Button variant="outline">
                                    <RefreshCw className="mr-2 h-4 w-4"/> Refresh Status
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Stats Section */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass-card relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            <Suspense fallback={<Skeleton className="h-8 w-16"/>}>
                                <ActiveProjectsCount/>
                            </Suspense>
                        </div>
                        <p className="text-xs text-muted-foreground">Total projects in the system</p>
                    </CardContent>
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5"/>
                </Card>

                <Card className="glass-card relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Test Deployments</CardTitle>
                        <GitBranch className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            <Suspense fallback={<Skeleton className="h-8 w-16"/>}>
                                <TestDeploymentsCount/>
                            </Suspense>
                        </div>
                        <p className="text-xs text-muted-foreground">Active test environments</p>
                    </CardContent>
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5"/>
                </Card>

                <Card className="glass-card relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Production Deployments</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            <Suspense fallback={<Skeleton className="h-8 w-16"/>}>
                                <ProdDeploymentsCount/>
                            </Suspense>
                        </div>
                        <p className="text-xs text-muted-foreground">Active production environments</p>
                    </CardContent>
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5"/>
                </Card>
            </div>

            {/* Main Dashboard Content */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="deployments">Recent Deployments</TabsTrigger>
                    <TabsTrigger value="system">System Status</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <Suspense fallback={<ProjectsOverviewSkeleton/>}>
                        <ProjectsOverview/>
                    </Suspense>
                </TabsContent>
                <TabsContent value="deployments" className="space-y-4">
                    <Suspense fallback={<RecentDeploymentsSkeleton/>}>
                        <RecentDeployments/>
                    </Suspense>
                </TabsContent>
                <TabsContent value="system" className="space-y-4">
                    <Suspense fallback={<SystemStatusSkeleton/>}>
                        <SystemStatus/>
                    </Suspense>
                </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/projects" className="block">
                    <Card className="h-full glass-card glass-hover transition-colors cursor-pointer">
                        <CardHeader className="pb-2">
                            <div
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Server className="h-4 w-4"/>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-medium">Manage Projects</h3>
                            <p className="text-sm text-muted-foreground mt-1">View and configure projects</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/deployments" className="block">
                    <Card className="h-full glass-card glass-hover transition-colors cursor-pointer">
                        <CardHeader className="pb-2">
                            <div
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <GitBranch className="h-4 w-4"/>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-medium">Deployments</h3>
                            <p className="text-sm text-muted-foreground mt-1">Manage active deployments</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/console" className="block">
                    <Card className="h-full glass-card glass-hover transition-colors cursor-pointer">
                        <CardHeader className="pb-2">
                            <div
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Terminal className="h-4 w-4"/>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-medium">Console</h3>
                            <p className="text-sm text-muted-foreground mt-1">View logs and execute commands</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/settings" className="block">
                    <Card className="h-full glass-card glass-hover transition-colors cursor-pointer">
                        <CardHeader className="pb-2">
                            <div
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Clock className="h-4 w-4"/>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-medium">Settings</h3>
                            <p className="text-sm text-muted-foreground mt-1">Configure system settings</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
}

async function ActiveProjectsCount() {
    const result = await getProjectsAction();
    if (!result.success) {
        return <>?</>;
    }
    const projects = Array.isArray(result.data) ? result.data : [];
    console.log("Active Projects Count:", projects.length);
    return <>{projects.length}</>;
}

async function TestDeploymentsCount() {
    const result = await getProjectsAction();
    if (!result.success) return <>?</>;
    const projects = Array.isArray(result.data) ? result.data : [];
    console.log("Test Deployments Count:", projects.filter((p) => p.TestStatus !== "Not Deployed").length);
    return <>{projects.filter((p) => p.TestStatus !== "Not Deployed").length}</>;
}

async function ProdDeploymentsCount() {
    const result = await getProjectsAction();
    if (!result.success) return <>?</>;
    const projects = Array.isArray(result.data) ? result.data : [];
    console.log("Production Deployments Count:", projects.filter((p) => p.ProdStatus !== "Not Deployed").length);
    return <>{projects.filter((p) => p.ProdStatus !== "Not Deployed").length}</>;
}

function ProjectsOverviewSkeleton() {
    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Projects Overview</CardTitle>
                <CardDescription>Status of all your projects</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Array.from({length: 3}).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full"/>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]"/>
                                <Skeleton className="h-4 w-[200px]"/>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

function RecentDeploymentsSkeleton() {
    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Recent Deployments</CardTitle>
                <CardDescription>Latest deployment activities</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Array.from({length: 3}).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full"/>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[200px]"/>
                                    <Skeleton className="h-4 w-[150px]"/>
                                </div>
                            </div>
                            <Skeleton className="h-8 w-[100px]"/>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

function SystemStatusSkeleton() {
    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system health and resources</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Array.from({length: 3}).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-[150px]"/>
                            <Skeleton className="h-8 w-full"/>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
