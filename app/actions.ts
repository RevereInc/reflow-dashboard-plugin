'use server';

import {
    getProjects,
    createProject,
    getProjectDetails,
    getProjectConfig,
    updateProjectConfig,
    startEnvironment,
    stopEnvironment,
    getEnvironmentLogs,
    getEnvironmentEnvFile,
    updateEnvironmentEnvFile,
    deployProject,
    approveProject,
    getDeploymentHistory,
    getContainers,
    getContainerDetails,
    startContainer,
    stopContainer,
    restartContainer,
    deleteContainer,
    type CreateProjectArgs,
    type ProjectConfig,
    type ProjectSummary,
    type ProjectDetails,
    type DeploymentEvent,
    type Container,
    type ContainerDetails
} from '@/lib/api';

import { revalidatePath } from 'next/cache';

type ActionResponse<T = null> =
    | { success: true; data: T; message?: string }
    | { success: false; error: string };

// --- Project Actions ---

export async function getProjectsAction(): Promise<ActionResponse<ProjectSummary[]>> {
    try {
        const data = await getProjects();
        return { success: true, data };
    } catch (error: any) {
        console.error("[Action Error: getProjectsAction]", error);
        return { success: false, error: error.message || "Failed to fetch projects." };
    }
}

export async function createProjectAction(args: CreateProjectArgs): Promise<ActionResponse<{ message: string }>> {
    try {
        const result = await createProject(args);
        if (!result) throw new Error("API returned null on create project.");
        revalidatePath('/projects');
        return { success: true, data: result, message: result.message };
    } catch (error: any) {
        console.error("[Action Error: createProjectAction]", error);
        return { success: false, error: error.message || "Failed to create project." };
    }
}

export async function getProjectDetailsAction(projectName: string): Promise<ActionResponse<ProjectDetails | null>> {
    try {
        const data = await getProjectDetails(projectName);
        return { success: true, data };
    } catch (error: any) {
        console.error(`[Action Error: getProjectDetailsAction ${projectName}]`, error);
        return { success: false, error: error.message || "Failed to fetch project details." };
    }
}

export async function getProjectConfigAction(projectName: string): Promise<ActionResponse<ProjectConfig | null>> {
    try {
        const data = await getProjectConfig(projectName);
        return { success: true, data };
    } catch (error: any) {
        console.error(`[Action Error: getProjectConfigAction ${projectName}]`, error);
        return { success: false, error: error.message || "Failed to fetch project config." };
    }
}

export async function updateProjectConfigAction(projectName: string, config: ProjectConfig): Promise<ActionResponse<ProjectConfig | null>> {
    try {
        const data = await updateProjectConfig(projectName, config);
        revalidatePath(`/projects/${projectName}`);
        return { success: true, data };
    } catch (error: any) {
        console.error(`[Action Error: updateProjectConfigAction ${projectName}]`, error);
        return { success: false, error: error.message || "Failed to update project config." };
    }
}

export async function startEnvironmentAction(projectName: string, env: 'test' | 'prod'): Promise<ActionResponse<null>> {
    try {
        const success = await startEnvironment(projectName, env);
        if (!success) throw new Error("API call to start environment returned false.");
        revalidatePath('/projects');
        revalidatePath(`/projects/${projectName}`);
        return { success: true, data: null, message: `Environment ${env} started.` };
    } catch (error: any) {
        console.error(`[Action Error: startEnvironmentAction ${projectName} ${env}]`, error);
        return { success: false, error: error.message || `Failed to start ${env} environment.` };
    }
}

export async function stopEnvironmentAction(projectName: string, env: 'test' | 'prod'): Promise<ActionResponse<null>> {
    try {
        const success = await stopEnvironment(projectName, env);
        if (!success) throw new Error("API call to stop environment returned false.");
        revalidatePath('/projects');
        revalidatePath(`/projects/${projectName}`);
        return { success: true, data: null, message: `Environment ${env} stopped.` };
    } catch (error: any) {
        console.error(`[Action Error: stopEnvironmentAction ${projectName} ${env}]`, error);
        return { success: false, error: error.message || `Failed to stop ${env} environment.` };
    }
}

export async function getEnvironmentLogsAction(projectName: string, env: 'test' | 'prod', tail = 100): Promise<ActionResponse<string | null>> {
    try {
        const data = await getEnvironmentLogs(projectName, env, tail);
        return { success: true, data };
    } catch (error: any) {
        console.error(`[Action Error: getEnvironmentLogsAction ${projectName} ${env}]`, error);
        return { success: false, error: error.message || "Failed to fetch logs." };
    }
}

export async function getEnvironmentEnvFileAction(projectName: string, env: 'test' | 'prod'): Promise<ActionResponse<string | null>> {
    try {
        const data = await getEnvironmentEnvFile(projectName, env);
        return { success: true, data };
    } catch (error: any) {
        console.error(`[Action Error: getEnvironmentEnvFileAction ${projectName} ${env}]`, error);
        return { success: false, error: error.message || "Failed to fetch env file." };
    }
}

export async function updateEnvironmentEnvFileAction(projectName: string, env: 'test' | 'prod', content: string): Promise<ActionResponse<null>> {
    try {
        const success = await updateEnvironmentEnvFile(projectName, env, content);
        if (!success) throw new Error("API call to update env file returned false.");
        revalidatePath(`/projects/${projectName}`);
        return { success: true, data: null, message: `Environment file for ${env} updated.` };
    } catch (error: any) {
        console.error(`[Action Error: updateEnvironmentEnvFileAction ${projectName} ${env}]`, error);
        return { success: false, error: error.message || `Failed to update ${env} env file.` };
    }
}

// --- Orchestration Actions ---

export async function deployProjectAction(projectName: string, commit?: string): Promise<ActionResponse<{ message: string } | null>> {
    try {
        const data = await deployProject(projectName, commit);
        revalidatePath('/projects');
        revalidatePath(`/projects/${projectName}`);
        return { success: true, data };
    } catch (error: any) {
        console.error(`[Action Error: deployProjectAction ${projectName}]`, error);
        return { success: false, error: error.message || "Failed to initiate deployment." };
    }
}

export async function approveProjectAction(projectName: string): Promise<ActionResponse<{ message: string } | null>> {
    try {
        const data = await approveProject(projectName);
        revalidatePath('/projects');
        revalidatePath(`/projects/${projectName}`);
        return { success: true, data };
    } catch (error: any) {
        console.error(`[Action Error: approveProjectAction ${projectName}]`, error);
        return { success: false, error: error.message || "Failed to initiate approval." };
    }
}

export async function getDeploymentHistoryAction(
    projectName: string,
    options: { limit?: number; offset?: number; env?: "test" | "prod"; outcome?: "started" | "success" | "failure"; } = {},
): Promise<ActionResponse<DeploymentEvent[]>> {
    try {
        const data = await getDeploymentHistory(projectName, options);
        return { success: true, data };
    } catch (error: any) {
        console.error(`[Action Error: getDeploymentHistoryAction ${projectName}]`, error);
        return { success: false, error: error.message || "Failed to fetch deployment history." };
    }
}

// --- Container Actions ---

export async function getContainersAction(): Promise<ActionResponse<Container[]>> {
    try {
        const data = await getContainers();
        return { success: true, data };
    } catch (error: any) {
        console.error("[Action Error: getContainersAction]", error);
        return { success: false, error: error.message || "Failed to fetch containers." };
    }
}

export async function getContainerDetailsAction(containerId: string): Promise<ActionResponse<ContainerDetails | null>> {
    try {
        const data = await getContainerDetails(containerId);
        return { success: true, data };
    } catch (error: any) {
        console.error(`[Action Error: getContainerDetailsAction ${containerId}]`, error);
        return { success: false, error: error.message || "Failed to fetch container details." };
    }
}

export async function startContainerAction(containerId: string): Promise<ActionResponse<{ message: string } | null>> {
    try {
        const data = await startContainer(containerId);
        revalidatePath('/containers');
        return { success: true, data };
    } catch (error: any) {
        console.error(`[Action Error: startContainerAction ${containerId}]`, error);
        return { success: false, error: error.message || "Failed to start container." };
    }
}

export async function stopContainerAction(containerId: string): Promise<ActionResponse<{ message: string } | null>> {
    try {
        const data = await stopContainer(containerId);
        revalidatePath('/containers');
        return { success: true, data };
    } catch (error: any) {
        console.error(`[Action Error: stopContainerAction ${containerId}]`, error);
        return { success: false, error: error.message || "Failed to stop container." };
    }
}

export async function restartContainerAction(containerId: string): Promise<ActionResponse<{ message: string } | null>> {
    try {
        const data = await restartContainer(containerId);
        revalidatePath('/containers');
        return { success: true, data };
    } catch (error: any) {
        console.error(`[Action Error: restartContainerAction ${containerId}]`, error);
        return { success: false, error: error.message || "Failed to restart container." };
    }
}

export async function deleteContainerAction(containerId: string): Promise<ActionResponse<null>> {
    try {
        const success = await deleteContainer(containerId);
        if (!success) throw new Error("API call to delete container returned false.");
        revalidatePath('/containers')
        return { success: true, data: null, message: "Container deleted." };
    } catch (error: any) {
        console.error(`[Action Error: deleteContainerAction ${containerId}]`, error);
        return { success: false, error: error.message || "Failed to delete container." };
    }
}