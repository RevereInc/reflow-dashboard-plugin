import {Suspense} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Skeleton} from "@/components/ui/skeleton"
import {ExternalLink, GitBranch, RefreshCw, Server} from "lucide-react"
import Link from "next/link"
import {DeploymentActions} from "@/components/deployment-actions"
import {getProjectsAction} from "@/app/actions";

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function DeploymentsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Deployments</h2>
                    <p className="text-muted-foreground">Manage project deployments</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4"/> Refresh
                    </Button>
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Active Deployments</CardTitle>
                    <CardDescription>View and manage active deployments</CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<DeploymentsListSkeleton/>}>
                        <DeploymentsList/>
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}

async function DeploymentsList() {
    const result = await getProjectsAction()
    if (!result.success) {
        console.error("Failed to fetch projects:", result.error)
        return (
            <div className="text-center py-10 bg-muted/10 rounded-lg">
                <Server className="h-10 w-10 text-muted-foreground mx-auto mb-3"/>
                <p className="text-muted-foreground mb-4">Error loading projects: {result.error}</p>
                <Button variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4"/> Try Again
                </Button>
            </div>
        )
    }

    const projectsList = result.data

    const activeProjects = projectsList.filter(
        (project) => project.TestStatus !== "Not Deployed" || project.ProdStatus !== "Not Deployed",
    )

    if (activeProjects.length === 0) {
        return (
            <div className="text-center py-10 bg-muted/10 rounded-lg">
                <GitBranch className="h-10 w-10 text-muted-foreground mx-auto mb-3"/>
                <p className="text-muted-foreground mb-4">No active deployments found</p>
                <Button asChild>
                    <Link href="/projects">View Projects</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {activeProjects.map((project) => {
                const isTestActive = project.TestStatus !== "Not Deployed"
                const isProdActive = project.ProdStatus !== "Not Deployed"

                const commitRegex = /Commit: ([a-f0-9]+)/
                const testMatch = isTestActive ? project.TestStatus.match(commitRegex) : null
                const prodMatch = isProdActive ? project.ProdStatus.match(commitRegex) : null

                const testCommit = testMatch ? testMatch[1] : null
                const prodCommit = prodMatch ? prodMatch[1] : null

                return (
                    <div key={project.Name} className="glass-card p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Link href={`/projects/${project.Name}`}
                                          className="text-lg font-medium hover:underline">
                                        {project.Name}
                                    </Link>
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <GitBranch className="h-3.5 w-3.5"/>
                                    {project.RepoURL}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/projects/${project.Name}`}>
                                        <ExternalLink className="h-4 w-4"/>
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {/* Test Environment */}
                            <div className="p-3 bg-muted/10 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium">Test Environment</h4>
                                        {isTestActive ? (
                                            <Badge variant="outline"
                                                   className="bg-green-500/10 text-green-500 border-green-500/20">
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline"
                                                   className="bg-muted/20 text-muted-foreground border-muted/20">
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>
                                    <DeploymentActions
                                        projectName={project.Name}
                                        environment="test"
                                        isActive={isTestActive}
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {isTestActive ? (
                                        <>
                                            Status: {project.TestStatus}
                                            {testCommit && (
                                                <span className="ml-2 flex items-center gap-1">
                                                  <GitBranch className="h-3.5 w-3.5"/>
                                                    {testCommit.substring(0, 7)}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        "Not Deployed"
                                    )}
                                </p>
                            </div>

                            {/* Production Environment */}
                            <div className="p-3 bg-muted/10 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium">Production Environment</h4>
                                        {isProdActive ? (
                                            <Badge variant="outline"
                                                   className="bg-green-500/10 text-green-500 border-green-500/20">
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline"
                                                   className="bg-muted/20 text-muted-foreground border-muted/20">
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>
                                    <DeploymentActions
                                        projectName={project.Name}
                                        environment="prod"
                                        isActive={isProdActive}
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {isProdActive ? (
                                        <>
                                            Status: {project.ProdStatus}
                                            {prodCommit && (
                                                <span className="ml-2 flex items-center gap-1">
                                                  <GitBranch className="h-3.5 w-3.5"/>
                                                    {prodCommit.substring(0, 7)}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        "Not Deployed"
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function DeploymentsListSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({length: 3}).map((_, i) => (
                <div key={i} className="glass-card p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-[200px]"/>
                            <Skeleton className="h-4 w-[300px]"/>
                        </div>
                        <Skeleton className="h-9 w-9"/>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="p-3 bg-muted/10 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-[120px]"/>
                                    <Skeleton className="h-5 w-16"/>
                                </div>
                                <Skeleton className="h-8 w-20"/>
                            </div>
                            <Skeleton className="h-4 w-full"/>
                        </div>

                        <div className="p-3 bg-muted/10 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-[150px]"/>
                                    <Skeleton className="h-5 w-16"/>
                                </div>
                                <Skeleton className="h-8 w-20"/>
                            </div>
                            <Skeleton className="h-4 w-full"/>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
