"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, CheckCircle, XCircle, Clock, GitBranch } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getDeploymentHistory, type DeploymentEvent } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"

interface DeploymentHistoryProps {
  projectName: string
}

export function DeploymentHistory({ projectName }: DeploymentHistoryProps) {
  const [deployments, setDeployments] = useState<DeploymentEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeEnv, setActiveEnv] = useState<"all" | "test" | "prod">("all")
  const [activeOutcome, setActiveOutcome] = useState<"all" | "started" | "success" | "failure">("all")

  const fetchDeployments = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const options: {
        limit?: number
        env?: "test" | "prod"
        outcome?: "started" | "success" | "failure"
      } = { limit: 50 }

      if (activeEnv !== "all") {
        options.env = activeEnv
      }

      if (activeOutcome !== "all") {
        options.outcome = activeOutcome
      }

      const history = await getDeploymentHistory(projectName, options)
      setDeployments(Array.isArray(history) ? history : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDeployments()
  }, [projectName, activeEnv, activeOutcome])

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "success":
        return (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Success
            </Badge>
        )
      case "failure":
        return (
            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
              <XCircle className="h-3.5 w-3.5 mr-1" /> Failed
            </Badge>
        )
      case "started":
        return (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
              <Clock className="h-3.5 w-3.5 mr-1" /> Started
            </Badge>
        )
      default:
        return <Badge variant="outline">{outcome}</Badge>
    }
  }

  const getEnvironmentBadge = (env: string) => {
    switch (env) {
      case "test":
        return (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
              Test
            </Badge>
        )
      case "prod":
        return (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              Production
            </Badge>
        )
      default:
        return <Badge variant="outline">{env}</Badge>
    }
  }

  return (
      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Deployment History</CardTitle>
              <CardDescription>Recent deployment and approval events</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={activeEnv} onValueChange={(value) => setActiveEnv(value as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Environments</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                  <SelectItem value="prod">Production</SelectItem>
                </SelectContent>
              </Select>

              <Select value={activeOutcome} onValueChange={(value) => setActiveOutcome(value as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outcomes</SelectItem>
                  <SelectItem value="started">Started</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={fetchDeployments} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && deployments.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
          ) : error ? (
              <div className="text-center py-8 bg-muted/10 rounded-lg">
                <XCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
                <p className="text-muted-foreground mb-2">Failed to load deployment history</p>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button variant="outline" onClick={fetchDeployments}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Try Again
                </Button>
              </div>
          ) : deployments.length === 0 ? (
              <div className="text-center py-8 bg-muted/10 rounded-lg">
                <GitBranch className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No deployment history found</p>
              </div>
          ) : (
              <div className="space-y-4">
                {deployments.map((deployment, index) => {
                  const date = new Date(deployment.timestamp)
                  const timeAgo = formatDistanceToNow(date, { addSuffix: true })

                  return (
                      <div key={`${deployment.timestamp}-${index}`} className="glass-card p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-medium capitalize">
                                {deployment.eventType === "deploy" ? "Deployment" : "Approval"}
                              </h3>
                              {getEnvironmentBadge(deployment.environment)}
                              {getOutcomeBadge(deployment.outcome)}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <GitBranch className="h-3.5 w-3.5" />
                          {deployment.commitSHA.substring(0, 7)}
                        </span>
                              <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                                {timeAgo}
                        </span>
                              <span>Duration: {(deployment.durationMs / 1000).toFixed(1)}s</span>
                            </div>
                          </div>
                        </div>

                        {deployment.errorMessage && (
                            <div className="mt-2 p-2 bg-red-500/10 text-red-500 rounded text-sm">{deployment.errorMessage}</div>
                        )}
                      </div>
                  )
                })}
              </div>
          )}
        </CardContent>
      </Card>
  )
}
