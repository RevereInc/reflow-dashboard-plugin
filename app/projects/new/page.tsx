import { CreateProjectForm } from "@/components/create-project-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create New Project</h2>
          <p className="text-muted-foreground">Set up a new project for deployment</p>
        </div>
      </div>

      <CreateProjectForm />
    </div>
  )
}
