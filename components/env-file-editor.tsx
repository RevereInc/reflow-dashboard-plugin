"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getEnvironmentEnvFile, updateEnvironmentEnvFile } from "@/lib/api"

interface EnvFileEditorProps {
  projectName: string
  environment: "test" | "prod"
  envFilePath: string
}

export function EnvFileEditor({ projectName, environment, envFilePath }: EnvFileEditorProps) {
  const [content, setContent] = useState("")
  const [originalContent, setOriginalContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchEnvFile = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const fileContent = await getEnvironmentEnvFile(projectName, environment)
        if (fileContent !== null) {
          setContent(fileContent)
          setOriginalContent(fileContent)
        } else {
          setError("Failed to load environment file")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEnvFile()
  }, [projectName, environment])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await updateEnvironmentEnvFile(projectName, environment, content)
      if (result) {
        setSuccess(true)
        setOriginalContent(content)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError("Failed to save environment file")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = content !== originalContent

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>{environment === "test" ? "Test" : "Production"} Environment Variables</CardTitle>
        <CardDescription>
          Edit environment variables for {environment} environment ({envFilePath})
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-500/10 text-green-500 border-green-500/20">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Environment file saved successfully</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Textarea
            className="font-mono h-[400px] resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="# Add your environment variables here
DATABASE_URL=postgres://user:password@localhost:5432/db
NEXT_PUBLIC_API_URL=https://api.example.com"
          />
        )}
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={handleSave} disabled={isLoading || isSaving || !hasChanges}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className={`${isSaving ? "hidden" : "mr-2"} h-4 w-4`} />
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  )
}
