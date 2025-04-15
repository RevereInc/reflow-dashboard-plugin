"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, GitBranch, ArrowRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import {approveProjectAction, deployProjectAction} from "@/app/actions";

interface DeployProjectFormProps {
  projectName: string
}

export function DeployProjectForm({ projectName }: DeployProjectFormProps) {
  const router = useRouter()
  const [commit, setCommit] = useState("")
  const [isDeploying, setIsDeploying] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleDeploy = async () => {
    setIsDeploying(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await deployProjectAction(projectName, commit.trim() || undefined)
      if (result) {
        setSuccess(`Deployment initiated: ${result.success ? "Success" : "Failed"}`)
        setCommit("")
        router.refresh()
      } else {
        setError("Failed to initiate deployment")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsDeploying(false)
    }
  }

  const handleApprove = async () => {
    setIsApproving(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await approveProjectAction(projectName)
      if (result) {
        setSuccess(`Approval initiated: ${result.success ? "Success" : "Failed"}`)
        router.refresh()
      } else {
        setError("Failed to initiate approval")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsApproving(false)
    }
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Deploy Project</CardTitle>
        <CardDescription>Deploy to test or promote to production</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="commit">Commit or Branch (Optional)</Label>
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="commit"
                  placeholder="main, latest, or commit hash"
                  value={commit}
                  onChange={(e) => setCommit(e.target.value)}
                  disabled={isDeploying || isApproving}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty to use the latest commit from the default branch
              </p>
            </div>

            <Button onClick={handleDeploy} disabled={isDeploying || isApproving} className="w-full">
              {isDeploying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Deploy to Test Environment
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Promote to Production</Label>
              <p className="text-sm text-muted-foreground">
                Promote the current test environment deployment to production
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleApprove} disabled={isDeploying || isApproving} className="w-full">
                {isApproving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <ArrowRight className={`${isApproving ? "hidden" : "mr-2"} h-4 w-4`} />
                Promote to Production
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
