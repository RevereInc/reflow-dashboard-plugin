import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { GitBranch, ArrowUpRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import { getProjectsAction } from "@/app/actions"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function ProjectsOverview() {
    const result = await getProjectsAction()
    if (!result.success) {
        console.error("Failed to fetch projects:", result.error)
        return (
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Error Loading Projects</CardTitle>
                    <CardDescription>Failed to load projects: {result.error}</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    const projectsList = result.data
    console.log("Projects List:", projectsList)

    return (
        <Card className="glass-card">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Projects Overview</CardTitle>
                        <CardDescription>Status of all your projects</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/projects">
                            View All <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {projectsList.length === 0 ? (
                    <div className="text-center py-10 bg-muted/10 rounded-lg">
                        <GitBranch className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground mb-4">No projects found</p>
                        <Button asChild>
                            <Link href="/projects/new">Create Your First Project</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {projectsList.map((project, index) => {
                            const isTestActive = project.TestStatus !== "Not Deployed"
                            const isProdActive = project.ProdStatus !== "Not Deployed"

                            return (
                                <div key={project.Name}>
                                    <div className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/projects/${project.Name}`}
                                                    className="font-medium hover:underline text-base truncate"
                                                >
                                                    {project.Name}
                                                </Link>
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
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1 truncate">
                          <GitBranch className="h-3.5 w-3.5" />
                            {project.RepoURL}
                        </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 ml-4">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                <Link href={`/projects/${project.Name}`}>
                                                    <ExternalLink className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                    {index < projectsList.length - 1 && <Separator />}
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
            {projectsList.length > 0 && (
                <CardFooter className="border-t bg-muted/10 px-6 py-4">
                    <div className="flex items-center justify-between w-full">
                        <p className="text-sm text-muted-foreground">
                            Showing {projectsList.length} project{projectsList.length !== 1 ? "s" : ""}
                        </p>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/projects">View All Projects</Link>
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    )
}