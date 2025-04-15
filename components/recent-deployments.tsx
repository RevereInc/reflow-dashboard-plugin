import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {ArrowUpRight, Clock, ExternalLink, GitBranch} from "lucide-react"
import Link from "next/link"
import {getProjectsAction} from "@/app/actions";

export async function RecentDeployments() {
    const projects = await getProjectsAction()
    const projectsList = Array.isArray(projects) ? projects : []
    const recentDeployments = projectsList
        .filter((p) => p.TestStatus !== "Not Deployed" || p.ProdStatus !== "Not Deployed")
        .flatMap((p) => {
            const isTest = p.TestStatus !== "Not Deployed"
            const isProd = p.ProdStatus !== "Not Deployed"

            const commitRegex = /Commit: ([a-f0-9]+)/
            const testMatch = isTest ? p.TestStatus.match(commitRegex) : null
            const prodMatch = isProd ? p.ProdStatus.match(commitRegex) : null

            const testCommit = testMatch ? testMatch[1] : null
            const prodCommit = prodMatch ? prodMatch[1] : null

            const deployments = []

            if (isTest) {
                deployments.push({
                    projectName: p.Name,
                    environment: "test",
                    commit: testCommit || "unknown",
                    status: "active",
                    timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
                })
            }

            if (isProd) {
                deployments.push({
                    projectName: p.Name,
                    environment: "prod",
                    commit: prodCommit || "unknown",
                    status: "active",
                    timestamp: new Date(Date.now() - Math.random() * 86400000 * 14).toISOString(),
                })
            }

            return deployments
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5)

    return (
        <Card className="glass-card">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Recent Deployments</CardTitle>
                        <CardDescription>Latest deployment activities</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/deployments">
                            View All <ArrowUpRight className="ml-1 h-3.5 w-3.5"/>
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {recentDeployments.length === 0 ? (
                    <div className="text-center py-10 bg-muted/10 rounded-lg">
                        <GitBranch className="h-10 w-10 text-muted-foreground mx-auto mb-3"/>
                        <p className="text-muted-foreground mb-4">No deployments found</p>
                        <Button asChild>
                            <Link href="/projects">Deploy a Project</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {recentDeployments.map((deployment, index) => {
                            const date = new Date(deployment.timestamp)
                            const formattedDate = new Intl.DateTimeFormat("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            }).format(date)

                            return (
                                <div key={`${deployment.projectName}-${deployment.environment}-${index}`}>
                                    <div
                                        className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/projects/${deployment.projectName}`}
                                                    className="font-medium hover:underline text-base truncate"
                                                >
                                                    {deployment.projectName}
                                                </Link>
                                                {deployment.environment === "test" ? (
                                                    <Badge variant="outline"
                                                           className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                                        Test
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline"
                                                           className="bg-green-500/10 text-green-500 border-green-500/20">
                                                        Production
                                                    </Badge>
                                                )}
                                                <Badge variant="outline"
                                                       className="bg-primary/10 text-primary border-primary/20">
                                                    {deployment.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <GitBranch className="h-3.5 w-3.5"/>
                            {deployment.commit}
                        </span>
                                                <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5"/>
                                                    {formattedDate}
                        </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 ml-4">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                <Link href={`/projects/${deployment.projectName}`}>
                                                    <ExternalLink className="h-4 w-4"/>
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                    {index < recentDeployments.length - 1 && <Separator/>}
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
            {recentDeployments.length > 0 && (
                <CardFooter className="border-t bg-muted/10 px-6 py-4">
                    <div className="flex items-center justify-between w-full">
                        <p className="text-sm text-muted-foreground">
                            Showing {recentDeployments.length} recent
                            deployment{recentDeployments.length !== 1 ? "s" : ""}
                        </p>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/deployments">View All Deployments</Link>
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    )
}
