import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, Server, Database, HardDrive } from "lucide-react"

export async function SystemStatus() {
  // todo: implement real data
  const systemStatus = {
    status: "healthy", // healthy, warning, error
    cpu: 32,
    memory: 45,
    disk: 68,
    services: [
      { name: "API Server", status: "online", uptime: "5d 12h 34m" },
      { name: "Database", status: "online", uptime: "7d 8h 12m" },
      { name: "Nginx", status: "online", uptime: "7d 8h 12m" },
      { name: "Docker", status: "online", uptime: "7d 8h 12m" },
    ],
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="glass-card md:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system health and resources</CardDescription>
            </div>
            <StatusBadge status={systemStatus.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-muted-foreground">{systemStatus.cpu}%</span>
              </div>
              <Progress value={systemStatus.cpu} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-muted-foreground">{systemStatus.memory}%</span>
              </div>
              <Progress value={systemStatus.memory} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Disk Usage</span>
                <span className="text-sm text-muted-foreground">{systemStatus.disk}%</span>
              </div>
              <Progress value={systemStatus.disk} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>Status of system services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemStatus.services.map((service) => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getServiceIcon(service.name)}
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">Uptime: {service.uptime}</p>
                  </div>
                </div>
                <ServiceStatusBadge status={service.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Resource Allocation</CardTitle>
          <CardDescription>System resource distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Docker Containers</span>
                <span className="text-sm text-muted-foreground">12 running</span>
              </div>
              <Progress value={60} className="h-2" />
              <p className="text-xs text-muted-foreground">12 of 20 allocated containers</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network Bandwidth</span>
                <span className="text-sm text-muted-foreground">45 Mbps</span>
              </div>
              <Progress value={45} className="h-2" />
              <p className="text-xs text-muted-foreground">45 of 100 Mbps allocated</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Storage</span>
                <span className="text-sm text-muted-foreground">68 GB</span>
              </div>
              <Progress value={68} className="h-2" />
              <p className="text-xs text-muted-foreground">68 of 100 GB allocated</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === "healthy") {
    return (
      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Healthy
      </Badge>
    )
  }

  if (status === "warning") {
    return (
      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
        <AlertCircle className="h-3.5 w-3.5 mr-1" /> Warning
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
      <XCircle className="h-3.5 w-3.5 mr-1" /> Error
    </Badge>
  )
}

function ServiceStatusBadge({ status }: { status: string }) {
  if (status === "online") {
    return (
      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
        Online
      </Badge>
    )
  }

  if (status === "degraded") {
    return (
      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
        Degraded
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
      Offline
    </Badge>
  )
}

function getServiceIcon(serviceName: string) {
  const name = serviceName.toLowerCase()

  if (name.includes("api") || name.includes("server")) {
    return <Server className="h-4 w-4 text-muted-foreground" />
  }

  if (name.includes("database") || name.includes("db")) {
    return <Database className="h-4 w-4 text-muted-foreground" />
  }

  return <HardDrive className="h-4 w-4 text-muted-foreground" />
}
