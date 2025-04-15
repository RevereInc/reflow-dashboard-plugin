"use client"

import {useState, useTransition} from "react"
import { Button } from "@/components/ui/button"
import {Square, RefreshCw, Loader2, Play} from "lucide-react"
import { useRouter } from "next/navigation"
import { startEnvironment, stopEnvironment } from "@/lib/api"
import {startEnvironmentAction, stopEnvironmentAction} from "@/app/actions";
import {toast} from "sonner";

interface DeploymentActionsProps {
  projectName: string
  environment: "test" | "prod"
  isActive: boolean
}

export function DeploymentActions({ projectName, environment, isActive }: DeploymentActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [actionTarget, setActionTarget] = useState<string | null>(null);

  const handleAction = async (actionType: "stop" | "start" | "restart" ) => {
    const target = `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} ${environment}`;
    setActionTarget(target);

    startTransition(async () => {
      let result: { success: boolean; error?: string; message?: string } | null = null;
      try {
        if (actionType === "stop") {
          result = await stopEnvironmentAction(projectName, environment);
        } else if (actionType === "start") {
          result = await startEnvironmentAction(projectName, environment);
        } else if (actionType === "restart") {
          const stopResult = await stopEnvironmentAction(projectName, environment);
          if (!stopResult.success) {
            throw new Error(stopResult.error || `Failed to stop ${environment} during restart.`);
          }
          result = await startEnvironmentAction(projectName, environment);
          if (result.success) {
            result.message = `Environment ${environment} restarted successfully.`;
          }
        }

        if (result?.success) {
          toast.success(result.message || `${target} action successful.`);
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
  }

  if (isActive) {
    return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleAction("stop")} disabled={isPending}>
            {actionTarget === `Stop ${environment}` && isPending ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
                <Square className="mr-2 h-3.5 w-3.5" />
            )}
            Stop
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleAction("restart")} disabled={isPending}>
            {actionTarget === `Restart ${environment}` && isPending ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
            )}
            Restart
          </Button>
        </div>
    )
  } else {
    return (
       <Button size="sm" onClick={() => handleAction("start")} disabled={isPending}>
           {actionTarget === `Start ${environment}` && isPending ? ( <Loader2/> ) : ( <Play/> )}
           Start
       </Button>
    );
  }
}