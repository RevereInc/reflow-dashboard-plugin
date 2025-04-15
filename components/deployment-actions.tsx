"use client"

import {useState} from "react"
import {Button} from "@/components/ui/button"
import {Loader2, Play, RefreshCw, Square} from "lucide-react"
import {useRouter} from "next/navigation"
import {startEnvironmentAction, stopEnvironmentAction} from "@/app/actions";
import {toast} from "sonner";

interface DeploymentActionsProps {
    projectName: string
    environment: "test" | "prod"
    isActive: boolean
}

export function DeploymentActions({projectName, environment, isActive}: DeploymentActionsProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<"start" | "stop" | "restart" | null>(null)

    const handleAction = async (actionType: "stop" | "start" | "restart") => {
        setIsLoading(actionType)

        try {
            let success = false

            switch (actionType) {
                case "start":
                    success = !!(await startEnvironmentAction(projectName, environment))
                    break
                case "stop":
                    success = !(await stopEnvironmentAction(projectName, environment))
                    break
                case "restart":
                    const stopSuccess = !(await stopEnvironmentAction(projectName, environment));
                    const startSuccess = !!(await startEnvironmentAction(projectName, environment));
                    success = stopSuccess && startSuccess;
                    break;
            }

            if (success) {
                router.refresh()
                const verbMap = {
                    start: "started",
                    stop: "stopped",
                    restart: "restarted"
                }
                toast.success(`Environment ${verbMap[actionType]} successfully`)
            } else {
                toast.error(`Failed to ${actionType} the environment`)
            }
        } catch (error) {
            console.error(`Error performing ${actionType} action:`, error)
            toast.error(`Error trying to ${actionType} the environment`)
        } finally {
            setIsLoading(null)
        }
    }

    if (isActive) {
        return (
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction("stop")}
                    disabled={isLoading !== null}
                >
                    {isLoading === "stop" ? (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin"/>
                    ) : (
                        <Square className="mr-2 h-3.5 w-3.5"/>
                    )}
                    Stop
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction("restart")}
                    disabled={isLoading !== null}
                >
                    {isLoading === "restart" ? (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin"/>
                    ) : (
                        <RefreshCw className="mr-2 h-3.5 w-3.5"/>
                    )}
                    Restart
                </Button>
            </div>
        )
    } else {
        return (
            <Button
                size="sm"
                onClick={() => handleAction("start")}
                disabled={isLoading !== null}
            >
                {isLoading === "start" ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin"/>
                ) : (
                    <Play className="mr-2 h-3.5 w-3.5"/>
                )}
                Start
            </Button>
        )
    }
}