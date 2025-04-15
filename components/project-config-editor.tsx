"use client"

import type React from "react"
import {useEffect, useState, useTransition} from "react"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Separator} from "@/components/ui/separator"
import {AlertCircle, Loader2, Save} from "lucide-react"
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert"
import {getProjectConfigAction, updateProjectConfigAction} from "@/app/actions"
import type {ProjectConfig} from "@/lib/api"
import {toast} from "sonner"

interface ProjectConfigEditorProps {
    projectName: string
}

export function ProjectConfigEditor({projectName}: ProjectConfigEditorProps) {
    const [config, setConfig] = useState<ProjectConfig | null>(null)
    const [originalConfig, setOriginalConfig] = useState<ProjectConfig | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchConfig = async () => {
            setIsLoading(true)
            setError(null)
            const result = await getProjectConfigAction(projectName);
            if (result.success) {
                if (result.data) {
                    setConfig(result.data);
                    setOriginalConfig(JSON.parse(JSON.stringify(result.data)));
                } else {
                    setError("Project configuration not found or is empty.");
                    setConfig(null);
                    setOriginalConfig(null);
                    toast.error("Error loading config: Project configuration not found.");
                }
            } else {
                const errMsg = result.error || "Failed to load project configuration";
                setError(errMsg);
                setConfig(null);
                setOriginalConfig(null);
                toast.error(`Error loading config: ${errMsg}`);
            }
            setIsLoading(false);
        }
        fetchConfig()
    }, [projectName])

    const handleChange = (section: "root" | "test" | "prod", field: string, value: string | number) => {
        if (!config) return

        setConfig(prevConfig => {
            if (!prevConfig) return null;

            const newConfig = JSON.parse(JSON.stringify(prevConfig));

            if (section === "root") {
                newConfig[field as keyof ProjectConfig] = field === "appPort" ? Number(value) || 0 : value;
            } else if (section === "test" || section === "prod") {
                if (!newConfig.environments) newConfig.environments = {
                    test: {domain: "", envFile: ""},
                    prod: {domain: "", envFile: ""}
                };
                if (!newConfig.environments[section]) newConfig.environments[section] = {domain: "", envFile: ""};
                newConfig.environments[section][field as keyof typeof newConfig.environments.test] = value;
            }
            return newConfig;
        });
    }

    const handleSave = async () => {
        if (!config) return
        setError(null)

        startTransition(async () => {
            const result = await updateProjectConfigAction(projectName, config);
            if (result.success) {
                if (result.data) {
                    toast.success("Configuration saved successfully");
                    setConfig(result.data);
                    setOriginalConfig(JSON.parse(JSON.stringify(result.data)));
                } else {
                    const errMsg = "Save succeeded but received no data back.";
                    setError(errMsg);
                    toast.error(errMsg);
                }
            } else {
                const errMsg = result.error || "Failed to save project configuration";
                setError(errMsg);
                toast.error(`Save Failed: ${errMsg}`);
            }
        });
    }

    const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig)

    if (isLoading) {
        return (
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Project Configuration</CardTitle>
                    <CardDescription>Loading configuration...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error && !config) {
        return (
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Project Configuration</CardTitle>
                    <CardDescription>Configuration not available</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4"/>
                        <AlertTitle>Error Loading Configuration</AlertTitle>
                        <AlertDescription>{error || "Failed to load project configuration"}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    if (!config) {
        return <p>Configuration could not be loaded.</p>
    }

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Project Configuration</CardTitle>
                <CardDescription>Edit project configuration settings. Changes require redeployment to take full
                    effect.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && !isSaving && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4"/>
                        <AlertTitle>Save Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="githubRepo">Repository URL</Label>
                            <Input
                                id="githubRepo"
                                value={config.githubRepo || ''}
                                onChange={(e) => handleChange("root", "githubRepo", e.target.value)}
                                disabled={isSaving}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="appPort">Application Port</Label>
                                <Input
                                    id="appPort"
                                    type="number"
                                    value={config.appPort || ''}
                                    onChange={(e) => handleChange("root", "appPort", e.target.value)}
                                    disabled={isSaving}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nodeVersion">Node.js Version</Label>
                                <Input
                                    id="nodeVersion"
                                    value={config.nodeVersion || ''}
                                    onChange={(e) => handleChange("root", "nodeVersion", e.target.value)}
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator/>
                    <h3 className="text-lg font-medium">Test Environment</h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="testDomain">Test Domain</Label>
                            <Input
                                id="testDomain"
                                value={config.environments?.test?.domain || ''}
                                onChange={(e) => handleChange("test", "domain", e.target.value)}
                                disabled={isSaving}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="testEnvFile">Test Environment File</Label>
                            <Input
                                id="testEnvFile"
                                value={config.environments?.test?.envFile || ''}
                                onChange={(e) => handleChange("test", "envFile", e.target.value)}
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    <Separator/>
                    <h3 className="text-lg font-medium">Production Environment</h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="prodDomain">Production Domain</Label>
                            <Input
                                id="prodDomain"
                                value={config.environments?.prod?.domain || ''}
                                onChange={(e) => handleChange("prod", "domain", e.target.value)}
                                disabled={isSaving}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="prodEnvFile">Production Environment File</Label>
                            <Input
                                id="prodEnvFile"
                                value={config.environments?.prod?.envFile || ''}
                                onChange={(e) => handleChange("prod", "envFile", e.target.value)}
                                disabled={isSaving}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-end">
                <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    {!isSaving && <Save className="mr-2 h-4 w-4"/>}
                    Save Changes
                </Button>
            </CardFooter>
        </Card>
    )
}