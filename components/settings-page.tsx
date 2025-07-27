"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useConfigStore } from "@/store/config"
import { Settings, AlertCircle } from "lucide-react"

export function SettingsPage() {
  const [url, setUrl] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

	const { saveConfig, testConnection } = useConfigStore()

  const handleSave = async () => {
    if (!url || !apiKey) {
      setError("Пожалуйста, заполните все поля")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const isValid = await testConnection(url, apiKey)
      if (isValid) {
        saveConfig(url, apiKey)
      } else {
        setError("Не удалось подключиться к Redmine. Проверьте URL и API ключ.")
      }
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Ошибка подключения к Redmine")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Настройка Redmine</CardTitle>
          <CardDescription>Введите данные для подключения к вашему Redmine</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL Redmine</Label>
            <Input
              id="url"
              placeholder="https://your-redmine.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Ваш API ключ"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleSave} className="w-full" disabled={isLoading}>
            {isLoading ? "Подключение..." : "Сохранить и подключиться"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
