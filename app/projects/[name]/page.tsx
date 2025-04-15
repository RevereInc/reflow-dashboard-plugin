import {Suspense} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {ArrowLeft, FileCode, GitBranch, RefreshCw} from "lucide-react"
import {getDeploymentHistoryAction, getEnvironmentLogsAction, getProjectDetailsAction} from "@/app/actions"
import Link from "next/link"
import {Skeleton} from "@/components/ui/skeleton"
import {notFound} from "next/navigation"
import {ProjectConfigEditor} from "@/components/project-config-editor"
import {EnvFileEditor} from "@/components/env-file-editor"
import {EnvironmentCards} from "./_components/environment-cards";
import type {ProjectDetails as ProjectDetailsType} from "@/lib/api"
import {DeployProjectForm} from "@/components/deploy-project-form";


export default async function ProjectPage(props: {
    params: Promise<{ name: string }>;
}) {
    const resolvedParams = await props.params;
    const name = resolvedParams.name;

    const initialProjectResult = await getProjectDetailsAction(name);
    if (!initialProjectResult.success || !initialProjectResult.data) {
        notFound();
    }
    const initialProject = initialProjectResult.data;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/projects"> <ArrowLeft className="h-4 w-4"/> </Link>
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{name}</h2>
                        <p className="text-muted-foreground">Project details and deployment management</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline"> <RefreshCw className="mr-2 h-4 w-4"/>Refresh</Button>
                </div>
            </div>

            {/* Pass initial data to ProjectDetails RSC */}
            <ProjectDetails initialData={initialProject}/>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="config">Configuration</TabsTrigger>
                    <TabsTrigger value="deployments">Deployments</TabsTrigger>
                    <TabsTrigger value="logs">Logs</TabsTrigger>
                    <TabsTrigger value="env-files">Environment Files</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <EnvironmentCards initialData={initialProject}/>
                </TabsContent>

                <TabsContent value="config" className="space-y-4">
                    <ProjectConfigEditor projectName={name}/>
                </TabsContent>

                <TabsContent value="deployments" className="space-y-4">
                    <DeployProjectForm projectName={name}/>
                    <Suspense fallback={<DeploymentsSkeleton/>}>
                        <DeploymentHistoryList projectName={name}/>
                    </Suspense>
                </TabsContent>

                <TabsContent value="logs" className="space-y-4">
                    <Suspense fallback={<LogsSkeleton/>}>
                        <ProjectLogs name={name} initialData={initialProject}/>
                    </Suspense>
                </TabsContent>

                <TabsContent value="env-files" className="space-y-4">
                    <Suspense fallback={<EnvFilesSkeleton/>}>
                        <EnvironmentFiles name={name} initialData={initialProject}/>
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    )
}

async function ProjectDetails({initialData}: { initialData: ProjectDetailsType }) {
    const project = initialData;
    return (
        <Card className="glass-card">
            <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2"><h3 className="text-sm font-medium text-muted-foreground">Repository</h3>
                        <p className="flex items-center gap-2"><GitBranch className="h-4 w-4"/>
                            <span>{project.RepoURL}</span></p></div>
                    <div className="space-y-2"><h3 className="text-sm font-medium text-muted-foreground">Local Path</h3>
                        <p className="flex items-center gap-2"><FileCode className="h-4 w-4"/>
                            <span>{project.LocalRepoPath}</span></p></div>
                    <div className="space-y-2"><h3 className="text-sm font-medium text-muted-foreground">Test
                        Environment</h3> <p className="flex items-center gap-2"> {project.TestDetails.IsActive ?
                        <Badge variant="outline"
                               className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge> :
                        <Badge variant="outline"
                               className="bg-muted/20 text-muted-foreground border-muted/20">Inactive</Badge>}
                        <span>{project.TestDetails.EffectiveDomain}</span></p></div>
                    <div className="space-y-2"><h3 className="text-sm font-medium text-muted-foreground">Production
                        Environment</h3> <p className="flex items-center gap-2"> {project.ProdDetails.IsActive ?
                        <Badge variant="outline"
                               className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge> :
                        <Badge variant="outline"
                               className="bg-muted/20 text-muted-foreground border-muted/20">Inactive</Badge>}
                        <span>{project.ProdDetails.EffectiveDomain}</span></p></div>
                </div>
            </CardContent>
        </Card>
    )
}

async function ProjectLogs({name, initialData}: { name: string, initialData: ProjectDetailsType }) {
    const project = initialData;
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="glass-card">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div><CardTitle>Test Logs</CardTitle><CardDescription>Recent logs</CardDescription></div>
                        {project.TestDetails.IsActive ?
                            <Badge variant="outline"
                                   className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge> :
                            <Badge variant="outline"
                                   className="bg-muted/20 text-muted-foreground border-muted/20">Inactive</Badge>
                        }
                    </div>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div className="h-[400px] bg-muted/30 rounded-lg animate-pulse"/>}>
                        <EnvironmentLogs projectName={name} environment="test"/>
                    </Suspense>
                </CardContent>
            </Card>
            <Card className="glass-card">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div><CardTitle>Production Logs</CardTitle><CardDescription>Recent logs</CardDescription></div>
                        {project.ProdDetails.IsActive ?
                            <Badge variant="outline"
                                   className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge> :
                            <Badge variant="outline"
                                   className="bg-muted/20 text-muted-foreground border-muted/20">Inactive</Badge>
                        }
                    </div>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div className="h-[400px] bg-muted/30 rounded-lg animate-pulse"/>}>
                        <EnvironmentLogs projectName={name} environment="prod"/>
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}

async function EnvironmentLogs({projectName, environment}: { projectName: string; environment: "test" | "prod" }) {
    //const result = await getEnvironmentLogsAction(projectName, environment, 200);
    //const logs = result.success ? result.data : `Error loading logs: ${result.error}`;
    return (
        <pre className="bg-muted/30 rounded-lg p-4 font-mono text-xs h-[400px] overflow-auto whitespace-pre-wrap break-words">
            {"No logs available."}
        </pre>
    )
}

async function EnvironmentFiles({name, initialData}: { name: string, initialData: ProjectDetailsType }) {
    const testFilePath = initialData.TestDetails.EnvFilePath;
    const prodFilePath = initialData.ProdDetails.EnvFilePath;
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <EnvFileEditor projectName={name} environment="test" envFilePath={testFilePath || ".env.development"}/>
            <EnvFileEditor projectName={name} environment="prod" envFilePath={prodFilePath || ".env.production"}/>
        </div>
    )
}

async function DeploymentHistoryList({projectName}: { projectName: string }) {
    const result = await getDeploymentHistoryAction(projectName, {limit: 20});
    if (!result.success) {
        return <p className="text-destructive">Error loading deployment history: {result.error}</p>
    }
    const deployments = result.data || [];

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Recent Deployment History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {deployments.length > 0 ? deployments.map((event, index) => (
                        <div key={index}
                             className="flex items-center justify-between gap-2 text-sm border-b border-border/10 pb-2 last:border-b-0">
                            <div className="flex flex-col">
                                <span className="font-medium capitalize">{event.eventType} to {event.environment}</span>
                                <span className="text-xs text-muted-foreground font-mono"
                                      title={event.commitSHA}>{event.commitSHA.substring(0, 12)}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <Badge
                                    variant={event.outcome === 'success' ? 'default' : event.outcome === 'failure' ? 'destructive' : 'secondary'}
                                    className={`capitalize mb-1 ${event.outcome === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}`}>
                                    {event.outcome}
                                </Badge>
                                <span
                                    className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</span>
                            </div>
                        </div>
                    )) : (
                        <p className="text-muted-foreground text-center py-4">No deployment history found.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function LogsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {Array.from({length: 2}).map((_, i) => (
                <Card key={i} className="glass-card">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-6 w-[200px]"/>
                            <Skeleton className="h-6 w-[80px]"/>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[400px] w-full"/>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function EnvFilesSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {Array.from({length: 2}).map((_, i) => (
                <Card key={i} className="glass-card">
                    <CardHeader>
                        <div className="flex flex-col space-y-1.5">
                            <Skeleton className="h-6 w-[200px]"/>
                            <Skeleton className="h-4 w-[300px]"/>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[400px] w-full"/>
                    </CardContent>
                    <div className="flex items-center justify-end p-6 pt-0">
                        <Skeleton className="h-10 w-[150px]"/>
                    </div>
                </Card>
            ))}
        </div>
    )
}

function DeploymentsSkeleton() {
    return (
        <Card className="glass-card"><CardHeader><Skeleton className="h-6 w-1/3"/></CardHeader><CardContent
            className="space-y-4">
            <Skeleton className="h-10 w-full"/> <Skeleton className="h-10 w-full"/> <Skeleton className="h-10 w-full"/>
        </CardContent></Card>
    );
}