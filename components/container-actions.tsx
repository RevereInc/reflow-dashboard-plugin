"use client"

import {useState} from "react"
import {Button} from "@/components/ui/button"
import {Loader2, Play, RotateCw, Square, Trash2} from "lucide-react"
import {useRouter} from "next/navigation"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {deleteContainerAction, restartContainerAction, startContainerAction, stopContainerAction} from "@/app/actions";

interface ContainerActionsProps {
    containerId: string
    isRunning: boolean
}

export function ContainerActions({containerId, isRunning}: ContainerActionsProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<string | null>(null)

    const handleAction = async (action: "start" | "stop" | "restart" | "delete") => {
        setIsLoading(action)

        try {
            let success = false

            switch (action) {
                case "start":
                    success = !!(await startContainerAction(containerId))
                    break
                case "stop":
                    success = !!(await stopContainerAction(containerId))
                    break
                case "restart":
                    success = !!(await restartContainerAction(containerId))
                    break
                case "delete":
                    success = !!(await deleteContainerAction(containerId))
                    break
            }

            if (success) {
                router.refresh()
            }
        } catch (error) {
            console.error(`Error performing ${action} action:`, error)
        } finally {
            setIsLoading(null)
        }
    }

    return (
        <div className="flex items-center gap-2">
            {isRunning ? (
                <>
                    <Button variant="outline" size="icon" onClick={() => handleAction("stop")}
                            disabled={isLoading !== null}>
                        {isLoading === "stop" ? <Loader2 className="h-4 w-4 animate-spin"/> :
                            <Square className="h-4 w-4"/>}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleAction("restart")}
                            disabled={isLoading !== null}>
                        {isLoading === "restart" ? <Loader2 className="h-4 w-4 animate-spin"/> :
                            <RotateCw className="h-4 w-4"/>}
                    </Button>
                </>
            ) : (
                <Button variant="outline" size="icon" onClick={() => handleAction("start")}
                        disabled={isLoading !== null}>
                    {isLoading === "start" ? <Loader2 className="h-4 w-4 animate-spin"/> : <Play className="h-4 w-4"/>}
                </Button>
            )}

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        disabled={isLoading !== null || isRunning}
                    >
                        {isLoading === "delete" ? <Loader2 className="h-4 w-4 animate-spin"/> :
                            <Trash2 className="h-4 w-4"/>}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Container</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this container? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleAction("delete")}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
