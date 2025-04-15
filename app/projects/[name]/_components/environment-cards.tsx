"use client"

import React, {useState, useTransition} from 'react'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {Globe, Loader2, Play, RefreshCw, Square} from "lucide-react"
import {
    approveProjectAction,
    deployProjectAction,
    getProjectDetailsAction,
    startEnvironmentAction,
    stopEnvironmentAction
} from "@/app/actions"
import type {ProjectDetails as ProjectDetailsType} from "@/lib/api"
import {toast} from "sonner"

function DetailItem({label, value, children, isMono = false}: {
    label: string,
    value?: string | null,
    children?: React.ReactNode,
    isMono?: boolean
}) {
    return (
        <div className="space-y-1">
            <p className="text-sm font-medium">{label}</p>
            {children ? <div className="text-sm text-muted-foreground">{children}</div> :
                <p className={`text-sm text-muted-foreground ${isMono ? 'font-mono' : ''} truncate`}
                   title={value ?? ''}>{value ?? 'N/A'}</p>}
        </div>
    );
}


interface EnvironmentCardsProps {
    initialData: ProjectDetailsType;
}

export function EnvironmentCards({initialData}: EnvironmentCardsProps) {
    const [project, setProject] = useState<ProjectDetailsType>(initialData);
    const [isPending, startTransition] = useTransition();
    const [actionTarget, setActionTarget] = useState<string | null>(null);

    const name = project.Name;

    const handleAction = async (actionFn: () => Promise<any>, target: string) => {
        setActionTarget(target);
        startTransition(async () => {
            try {
                const result = await actionFn();
                if (result?.success) {
                    toast.success(result.message || `${target} successful.`);
                    const updatedDetailsResult = await getProjectDetailsAction(name);
                    if (updatedDetailsResult.success && updatedDetailsResult.data) {
                        setProject(updatedDetailsResult.data);
                    } else {
                        toast.error("Failed to refresh project details after action.");
                    }
                } else {
                    throw new Error(result?.error || `Unknown error during ${target} action.`);
                }
            } catch (error: any) {
                console.error(`Error performing ${target} action:`, error);
                toast.error(`Action Failed: ${error.message || 'Unknown error'}`);
            } finally {
                setActionTarget(null);
            }
        });
    };

    const handleRestart = async (env: 'test' | 'prod') => {
        const target = `Restart ${env}`;
        setActionTarget(target);
        startTransition(async () => {
            let finalResult: { success: boolean, error?: string, message?: string } | null = null;
            try {
                const stopResult = await stopEnvironmentAction(name, env);
                if (!stopResult.success) throw new Error(stopResult.error || `Failed to stop ${env} during restart.`);

                const startResult = await startEnvironmentAction(name, env);
                if (!startResult.success) throw new Error(startResult.error || `Failed to start ${env} during restart.`);

                finalResult = {success: true, message: `Environment ${env} restarted.`};

            } catch (error: any) {
                finalResult = {success: false, error: error.message || `Failed to restart ${env} environment.`};
            }

            if (finalResult?.success) {
                toast.success(finalResult.message);
                const updatedDetailsResult = await getProjectDetailsAction(name);
                if (updatedDetailsResult.success && updatedDetailsResult.data) setProject(updatedDetailsResult.data);
            } else {
                toast.error(`Restart Failed: ${finalResult?.error || 'Unknown error'}`);
            }
            setActionTarget(null);
        });
    };

    const testDetails = project.TestDetails;
    const prodDetails = project.ProdDetails;

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Test Environment Card */}
            <Card className="glass-card">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Test Environment</CardTitle>
                            <CardDescription>Development/testing</CardDescription>
                        </div>
                        {testDetails.IsActive ?
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge> :
                            <Badge variant="outline" className="bg-muted/20 text-muted-foreground border-muted/20">Inactive</Badge>
                        }
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 grid-cols-2">
                        <DetailItem label="Status" value={testDetails.ContainerStatus || "Not Deployed"}/>
                        <DetailItem label="Active Commit" value={testDetails.ActiveCommit || "N/A"} isMono={true}/>
                        <DetailItem label="Slot" value={testDetails.ActiveSlot || "N/A"}/>
                        <DetailItem label="Port" value={String(testDetails.AppPort || "N/A")}/>
                    </div>
                    <Separator/>
                    <DetailItem label="Domain">
                        <a href={`http://${testDetails.EffectiveDomain}`} target="_blank" rel="noopener noreferrer"
                           className="text-sm hover:underline flex items-center gap-1">
                            <Globe className="h-4 w-4 text-muted-foreground"/> {testDetails.EffectiveDomain}
                        </a>
                    </DetailItem>
                    <div className="flex items-center gap-2 pt-2">
                        {testDetails.IsActive ? (
                            <>
                                <Button variant="outline" className="flex-1"
                                        onClick={() => handleAction(() => stopEnvironmentAction(name, 'test'), `Stop test`)}
                                        disabled={isPending}>
                                    {actionTarget === 'Stop test' && isPending ?
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin"/> :
                                        <Square className="h-4 w-4 mr-2"/>} Stop
                                </Button>
                                <Button variant="outline" className="flex-1" onClick={() => handleRestart('test')}
                                        disabled={isPending}>
                                    {actionTarget === 'Restart test' && isPending ?
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin"/> :
                                        <RefreshCw className="h-4 w-4 mr-2"/>} Restart
                                </Button>
                            </>
                        ) : (
                            <Button className="flex-1"
                                    onClick={() => handleAction(() => deployProjectAction(name), `Deploy test`)}
                                    disabled={isPending}>
                                {actionTarget === 'Deploy test' && isPending ?
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin"/> :
                                    <Play className="h-4 w-4 mr-2"/>} Deploy
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Production Environment Card */}
            <Card className="glass-card">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Production Environment</CardTitle>
                            <CardDescription>Live deployment</CardDescription>
                        </div>
                        {prodDetails.IsActive ?
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge> :
                            <Badge variant="outline" className="bg-muted/20 text-muted-foreground border-muted/20">Inactive</Badge>
                        }
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 grid-cols-2">
                        <DetailItem label="Status" value={prodDetails.ContainerStatus || "Not Deployed"}/>
                        <DetailItem label="Active Commit" value={prodDetails.ActiveCommit || "N/A"} isMono={true}/>
                        <DetailItem label="Slot" value={prodDetails.ActiveSlot || "N/A"}/>
                        <DetailItem label="Port" value={String(prodDetails.AppPort || "N/A")}/>
                    </div>
                    <Separator/>
                    <DetailItem label="Domain">
                        <a href={`http://${prodDetails.EffectiveDomain}`} target="_blank" rel="noopener noreferrer"
                           className="text-sm hover:underline flex items-center gap-1">
                            <Globe className="h-4 w-4 text-muted-foreground"/> {prodDetails.EffectiveDomain}
                        </a>
                    </DetailItem>
                    <div className="flex items-center gap-2 pt-2">
                        {prodDetails.IsActive ? (
                            <>
                                <Button variant="outline" className="flex-1"
                                        onClick={() => handleAction(() => stopEnvironmentAction(name, 'prod'), `Stop prod`)}
                                        disabled={isPending}>
                                    {actionTarget === 'Stop prod' && isPending ?
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin"/> :
                                        <Square className="h-4 w-4 mr-2"/>} Stop
                                </Button>
                                <Button variant="outline" className="flex-1" onClick={() => handleRestart('prod')}
                                        disabled={isPending}>
                                    {actionTarget === 'Restart prod' && isPending ?
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin"/> :
                                        <RefreshCw className="h-4 w-4 mr-2"/>} Restart
                                </Button>
                            </>
                        ) : (
                            <Button className="flex-1"
                                    onClick={() => handleAction(() => approveProjectAction(name), `Approve prod`)}
                                    disabled={!testDetails.IsActive || isPending}>
                                {actionTarget === 'Approve prod' && isPending ?
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin"/> :
                                    <Play className="h-4 w-4 mr-2"/>} Promote from Test
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}