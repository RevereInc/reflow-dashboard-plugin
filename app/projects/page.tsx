import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GitBranch, Server, Plus, ExternalLink, Play, Square, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { getProjectsAction } from "@/app/actions"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function ProjectsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
                    <p className="text-muted-foreground">Manage your deployment projects</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild>
                        <Link href="/projects/new">
                            <Plus className="mr-2 h-4 w-4" /> New Project
                        </Link>
                    </Button>
                    <Button variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>All Projects</CardTitle>
                    <CardDescription>View and manage all your projects</CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<ProjectsListSkeleton />}>
                        <ProjectsList />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}

async function ProjectsList() {
    const result = await getProjectsAction()
    if (!result.success) {
        console.error("Failed to fetch projects:", result.error)
        return (
            <div className="text-center py-10 bg-muted/10 rounded-lg">
                <Server className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Error loading projects: {result.error}</p>
                <Button variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                </Button>
            </div>
        )
    }

    const projectsList = result.data

    if (projectsList.length === 0) {
        return (
            <div className="text-center py-10 bg-muted/10 rounded-lg">
                <Server className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No projects found</p>
                <Button asChild>
                    <Link href="/projects/new">Create Your First Project</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {projectsList.map((project) => {
                const isTestActive = project.TestStatus !== "Not Deployed"
                const isProdActive = project.ProdStatus !== "Not Deployed"

                return (
                    <div key={project.Name} className="glass-card p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-medium">{project.Name}</h3>
                                    {isTestActive && (
                                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                            Test
                                        </Badge>
                                    )}
                                    {isProdActive && (
                                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                            Production
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <GitBranch className="h-3.5 w-3.5" />
                                    {project.RepoURL}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {isTestActive ? (
                                    <Button variant="outline" size="sm">
                                        <Square className="h-3.5 w-3.5 mr-1" /> Stop Test
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm">
                                        <Play className="h-3.5 w-3.5 mr-1" /> Deploy to Test
                                    </Button>
                                )}

                                {isProdActive ? (
                                    <Button variant="outline" size="sm">
                                        <Square className="h-3.5 w-3.5 mr-1" /> Stop Production
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" disabled={!isTestActive}>
                                        <Play className="h-3.5 w-3.5 mr-1" /> Promote to Production
                                    </Button>
                                )}

                                <Button variant="default" size="sm" asChild>
                                    <Link href={`/projects/${project.Name}`}>
                                        <ExternalLink className="h-3.5 w-3.5 mr-1" /> Details
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Test Environment</p>
                                <p className="text-sm text-muted-foreground">{isTestActive ? project.TestStatus : "Not Deployed"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium">Production Environment</p>
                                <p className="text-sm text-muted-foreground">{isProdActive ? project.ProdStatus : "Not Deployed"}</p>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function ProjectsListSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-[200px]" />
                            <Skeleton className="h-4 w-[300px]" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-9 w-[100px]" />
                            <Skeleton className="h-9 w-[150px]" />
                            <Skeleton className="h-9 w-[100px]" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}