import {Suspense} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Skeleton} from "@/components/ui/skeleton"
import {RefreshCw, Server} from "lucide-react"
import Link from "next/link"
import {ContainerActions} from "@/components/container-actions"
import {getContainersAction} from "@/app/actions";

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function ContainersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Containers</h2>
                    <p className="text-muted-foreground">Manage Docker containers</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4"/> Refresh
                    </Button>
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>All Containers</CardTitle>
                    <CardDescription>View and manage all Docker containers</CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<ContainersListSkeleton/>}>
                        <ContainersList/>
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}

async function ContainersList() {
    const result = await getContainersAction()
    if (!result.success) {
        console.error("Failed to fetch containers:", result.error)
        return (
            <div className="text-center py-10 bg-muted/10 rounded-lg">
                <Server className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Error loading containers: {result.error}</p>
                <Button variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                </Button>
            </div>
        )
    }

    const containersList = result.data

    if (containersList.length === 0) {
        return (
            <div className="text-center py-10 bg-muted/10 rounded-lg">
                <Server className="h-10 w-10 text-muted-foreground mx-auto mb-3"/>
                <p className="text-muted-foreground mb-4">No containers found</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {containersList.map((container) => {
                const isRunning = container.State === "running"
                const projectName = container.Labels?.["reflow.project"] || "Unknown"
                const environment = container.Labels?.["reflow.environment"] || "Unknown"
                const commit = container.Labels?.["reflow.commit"] || "Unknown"

                return (
                    <div key={container.Id} className="glass-card p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-medium truncate max-w-[300px]">
                                        {container.Names?.[0]?.replace(/^\//, "") || "Unnamed Container"}
                                    </h3>
                                    {isRunning ? (
                                        <Badge variant="outline"
                                               className="bg-green-500/10 text-green-500 border-green-500/20">
                                            Running
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline"
                                               className="bg-muted/20 text-muted-foreground border-muted/20">
                                            Stopped
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Project:{" "}
                                    <Link href={`/projects/${projectName}`} className="hover:underline">
                                        {projectName}
                                    </Link>{" "}
                                    | Environment: {environment} | Commit: {commit.substring(0, 7)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Image: {container.Image} | Status: {container.Status}
                                </p>
                            </div>

                            <ContainerActions containerId={container.Id} isRunning={isRunning}/>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function ContainersListSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({length: 3}).map((_, i) => (
                <div key={i} className="glass-card p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-[300px]"/>
                                <Skeleton className="h-5 w-16"/>
                            </div>
                            <Skeleton className="h-4 w-[400px]"/>
                            <Skeleton className="h-4 w-[350px]"/>
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-9 w-9"/>
                            <Skeleton className="h-9 w-9"/>
                            <Skeleton className="h-9 w-9"/>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
