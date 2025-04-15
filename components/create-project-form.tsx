"use client"

import React, {useTransition} from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createProject, type CreateProjectArgs } from "@/lib/api"
import {createProjectAction} from "@/app/actions";
import {toast} from "sonner";

export function CreateProjectForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateProjectArgs>({
    projectName: "",
    repoUrl: "",
    appPort: 3000,
    nodeVersion: "20-alpine",
    testDomain: "",
    prodDomain: "",
    testEnvFile: ".env.development",
    prodEnvFile: ".env.production",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "appPort") {
      const portValue = value === '' ? undefined : Number.parseInt(value, 10);
      setFormData({
        ...formData,
        [name]: isNaN(portValue as any) ? undefined : portValue,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const argsToSend: CreateProjectArgs = {
      ...formData,
      appPort: formData.appPort || undefined,
      nodeVersion: formData.nodeVersion || undefined,
      testDomain: formData.testDomain || undefined,
      prodDomain: formData.prodDomain || undefined,
      testEnvFile: formData.testEnvFile || undefined,
      prodEnvFile: formData.prodEnvFile || undefined,
    };

    startTransition(async () => {
      const result = await createProjectAction(argsToSend);

      if (result.success) {
        toast.success(result.message || `Project '${formData.projectName}' created successfully!`);
        router.push(`/projects/${formData.projectName}`);
      } else {
        const errorMessage = result.error || "Failed to create project. Please check your inputs and try again.";
        toast.error(`Error: ${errorMessage}`);
        setError(errorMessage);
      }
    });
  }

  return (
      <form onSubmit={handleSubmit}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
            <CardDescription>Set up a new project for deployment with Reflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                      id="projectName"
                      name="projectName"
                      placeholder="my-awesome-project"
                      value={formData.projectName}
                      onChange={handleChange}
                      required
                  />
                  <p className="text-xs text-muted-foreground">Unique name for your project (lowercase, no spaces)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="repoUrl">Repository URL *</Label>
                  <Input
                      id="repoUrl"
                      name="repoUrl"
                      placeholder="https://github.com/username/repo.git"
                      value={formData.repoUrl}
                      onChange={handleChange}
                      required
                  />
                  <p className="text-xs text-muted-foreground">Git repository URL (HTTPS or SSH)</p>
                </div>
              </div>

              <Separator />
              <h3 className="text-lg font-medium">Configuration</h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="appPort">Application Port</Label>
                  <Input
                      id="appPort"
                      name="appPort"
                      type="number"
                      placeholder="3000"
                      value={formData.appPort}
                      onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground">Port your application listens on</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nodeVersion">Node.js Version</Label>
                  <Input
                      id="nodeVersion"
                      name="nodeVersion"
                      placeholder="20-alpine"
                      value={formData.nodeVersion}
                      onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground">Node.js version tag (e.g., 20-alpine)</p>
                </div>
              </div>

              <Separator />
              <h3 className="text-lg font-medium">Environments</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="testDomain">Test Domain</Label>
                    <Input
                        id="testDomain"
                        name="testDomain"
                        placeholder="test.example.com"
                        value={formData.testDomain}
                        onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="testEnvFile">Test Environment File</Label>
                    <Input
                        id="testEnvFile"
                        name="testEnvFile"
                        placeholder=".env.development"
                        value={formData.testEnvFile}
                        onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="prodDomain">Production Domain</Label>
                    <Input
                        id="prodDomain"
                        name="prodDomain"
                        placeholder="example.com"
                        value={formData.prodDomain}
                        onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prodEnvFile">Production Environment File</Label>
                    <Input
                        id="prodEnvFile"
                        name="prodEnvFile"
                        placeholder=".env.production"
                        value={formData.prodEnvFile}
                        onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.projectName || !formData.repoUrl}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </CardFooter>
        </Card>
      </form>
  )
}
