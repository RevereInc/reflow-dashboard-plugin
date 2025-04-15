const getApiBaseUrl = () => {
  const apiHost = process.env.NEXT_PUBLIC_REFLOW_API_HOST || "localhost"
  const apiPort = process.env.NEXT_PUBLIC_REFLOW_API_PORT || "8585"
  return `http://${apiHost}:${apiPort}/api/v1`
}

export interface ProjectSummary {
  Name: string
  RepoURL: string
  TestStatus: string
  ProdStatus: string
}

export interface EnvironmentDetails {
  EnvironmentName: string
  IsActive: boolean
  ActiveCommit: string
  ActiveSlot: string
  EffectiveDomain: string
  EnvFilePath: string
  AppPort: number
  ContainerStatus: string
  ContainerID: string
  ContainerNames: string[] | null
}

export interface ProjectDetails {
  Name: string
  RepoURL: string
  ConfigFilePath: string
  StateFilePath: string
  LocalRepoPath: string
  TestDetails: EnvironmentDetails
  ProdDetails: EnvironmentDetails
}

export interface ProjectConfig {
  projectName: string
  githubRepo: string
  appPort: number
  nodeVersion: string
  environments: {
    test: { domain: string; envFile: string }
    prod: { domain: string; envFile: string }
  }
}

export interface CreateProjectArgs {
  projectName: string
  repoUrl: string
  appPort?: number
  nodeVersion?: string
  testDomain?: string
  prodDomain?: string
  testEnvFile?: string
  prodEnvFile?: string
}

export interface DeploymentEvent {
  timestamp: string
  eventType: string
  projectName: string
  environment: string
  commitSHA: string
  outcome: string
  errorMessage: string
  durationMs: number
  triggeredBy: string
}

export interface Container {
  Id: string
  Names: string[]
  Image: string
  State: string
  Status: string
  Labels: Record<string, string>
  Created: number
  Ports: Array<{
    IP: string
    PrivatePort: number
    PublicPort: number
    Type: string
  }>
}

export interface ContainerDetails {
  Id: string
  Name: string
  State: {
    Status: string
    Running: boolean
    Paused: boolean
    Restarting: boolean
    OOMKilled: boolean
    Dead: boolean
    Pid: number
    ExitCode: number
    Error: string
    StartedAt: string
    FinishedAt: string
  }
  Config: {
    Image: string
    Cmd: string[]
    Env: string[]
    Labels: Record<string, string>
  }
  NetworkSettings: {
    Ports: Record<string, Array<{ HostIp: string; HostPort: string }>>
  }
}

export async function getProjects(): Promise<ProjectSummary[]> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/projects`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}

export async function createProject(args: CreateProjectArgs): Promise<{ message: string } | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error) {
          errorMessage = errorData.error
        }
      } catch (e) {
        if (errorText) {
          errorMessage = errorText
        }
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data || { message: "Operation completed successfully" }
  } catch (error) {
    console.error("Error creating project:", error)
    return null
  }
}

export async function getProjectDetails(projectName: string): Promise<ProjectDetails | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/projects/${projectName}/status`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return (await response.json()) || null
  } catch (error) {
    console.error(`Error fetching project details for ${projectName}:`, error)
    return null
  }
}

export async function getProjectConfig(projectName: string): Promise<ProjectConfig | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/projects/${projectName}/config`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return (await response.json()) || null
  } catch (error) {
    console.error(`Error fetching project config for ${projectName}:`, error)
    return null
  }
}

export async function updateProjectConfig(projectName: string, config: ProjectConfig): Promise<ProjectConfig | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/projects/${projectName}/config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error updating project config for ${projectName}:`, error)
    return null
  }
}

export async function startEnvironment(projectName: string, env: "test" | "prod"): Promise<boolean> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/projects/${projectName}/${env}/start`, {
      method: "POST",
    })
    return response.ok
  } catch (error) {
    console.error(`Error starting environment ${env} for ${projectName}:`, error)
    return false
  }
}

export async function stopEnvironment(projectName: string, env: "test" | "prod"): Promise<boolean> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/projects/${projectName}/${env}/stop`, {
      method: "POST",
    })
    return response.ok
  } catch (error) {
    console.error(`Error stopping environment ${env} for ${projectName}:`, error)
    return false
  }
}

export async function getEnvironmentLogs(
    projectName: string,
    env: "test" | "prod",
    tail = 100,
): Promise<string | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/projects/${projectName}/${env}/logs?tail=${tail}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.text()
  } catch (error) {
    console.error(`Error fetching logs for ${projectName} ${env}:`, error)
    return null
  }
}

export async function getEnvironmentEnvFile(projectName: string, env: "test" | "prod"): Promise<string | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/projects/${projectName}/${env}/envfile`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.text()
  } catch (error) {
    console.error(`Error fetching env file for ${projectName} ${env}:`, error)
    return null
  }
}

export async function updateEnvironmentEnvFile(
    projectName: string,
    env: "test" | "prod",
    content: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/projects/${projectName}/${env}/envfile`, {
      method: "PUT",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: content,
    })
    return response.ok
  } catch (error) {
    console.error(`Error updating env file for ${projectName} ${env}:`, error)
    return false
  }
}

// Deployment API
export async function deployProject(projectName: string, commit?: string): Promise<{ message: string } | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/projects/${projectName}/deploy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: commit ? JSON.stringify({ commit }) : undefined,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error deploying project ${projectName}:`, error)
    return null
  }
}

export async function approveProject(projectName: string): Promise<{ message: string } | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/projects/${projectName}/approve`, {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error approving project ${projectName}:`, error)
    return null
  }
}

export async function getDeploymentHistory(
    projectName: string,
    options: {
      limit?: number
      offset?: number
      env?: "test" | "prod"
      outcome?: "started" | "success" | "failure"
    } = {},
): Promise<DeploymentEvent[]> {
  try {
    const params = new URLSearchParams()
    if (options.limit) params.append("limit", options.limit.toString())
    if (options.offset) params.append("offset", options.offset.toString())
    if (options.env) params.append("env", options.env)
    if (options.outcome) params.append("outcome", options.outcome)

    const url = `${getApiBaseUrl()}/projects/${projectName}/deployments${params.toString() ? `?${params.toString()}` : ""}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error(`Error fetching deployment history for ${projectName}:`, error)
    return []
  }
}

export async function getContainers(): Promise<Container[]> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/containers`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error fetching containers:", error)
    return []
  }
}

export async function getContainerDetails(containerId: string): Promise<ContainerDetails | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/containers/${containerId}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching container details for ${containerId}:`, error)
    return null
  }
}

export async function startContainer(containerId: string): Promise<{ message: string } | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/containers/${containerId}/start`, {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error starting container ${containerId}:`, error)
    return null
  }
}

export async function stopContainer(containerId: string): Promise<{ message: string } | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/containers/${containerId}/stop`, {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error stopping container ${containerId}:`, error)
    return null
  }
}

export async function restartContainer(containerId: string): Promise<{ message: string } | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/containers/${containerId}/restart`, {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error restarting container ${containerId}:`, error)
    return null
  }
}

export async function deleteContainer(containerId: string): Promise<boolean> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/containers/${containerId}`, {
      method: "DELETE",
    })
    return response.ok
  } catch (error) {
    console.error(`Error deleting container ${containerId}:`, error)
    return false
  }
}