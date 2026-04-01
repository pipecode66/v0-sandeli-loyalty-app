"use client"

import { useRef, useState } from "react"
import { ArrowRight, Camera, Check, Upload, X } from "lucide-react"
import { useApp } from "@/lib/app-context"
import { PRESET_AVATARS } from "@/lib/preset-avatars"

export function AvatarSetupScreen() {
  const { user, updateUser, setScreen } = useApp()
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [customImage, setCustomImage] = useState<string | null>(null)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen no puede superar los 2 MB.")
      return
    }

    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten archivos de imagen.")
      return
    }

    setError("")
    const reader = new FileReader()
    reader.onloadend = () => {
      setCustomImage(reader.result as string)
      setSelectedPreset(null)
    }
    reader.readAsDataURL(file)
  }

  const handleContinue = () => {
    if (!selectedPreset && !customImage) {
      setError("Selecciona un avatar o sube una foto.")
      return
    }

    updateUser({
      avatar: customImage || selectedPreset,
      avatarType: customImage ? "custom" : "preset",
    })

    setScreen("welcome")
  }

  const hasSelection = selectedPreset || customImage

  return (
    <div className="app-screen flex flex-col bg-background">
      <div className="px-6 pb-2 pt-14">
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            1
          </div>
          <div className="h-0.5 flex-1 rounded bg-muted">
            <div className="h-full w-1/2 rounded bg-primary transition-all" />
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
            2
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 pb-8 pt-6">
        <h1 className="mb-1 text-2xl font-bold text-foreground">Personaliza tu perfil</h1>
        <p className="mb-2 text-sm text-muted-foreground">
          {`Hola ${user?.name || "cliente"}, tu nombre ya está registrado.`}
        </p>
        <p className="mb-8 text-sm text-muted-foreground">
          Solo elige un avatar o sube tu foto de perfil para continuar.
        </p>

        <p className="mb-3 text-sm font-medium text-foreground">Elige un avatar</p>
        <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {PRESET_AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              type="button"
              onClick={() => {
                setSelectedPreset(avatar.id)
                setCustomImage(null)
                setError("")
              }}
              className={`relative flex h-20 flex-col items-center justify-center rounded-2xl border-2 transition-all active:scale-95 ${
                selectedPreset === avatar.id
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-secondary"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${avatar.bgClass}`}
              >
                <span>{avatar.emoji}</span>
              </div>
              {selectedPreset === avatar.id && (
                <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">o</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="mb-6">
          <p className="mb-3 text-sm font-medium text-foreground">Sube tu foto</p>

          {customImage ? (
            <div className="relative flex items-center gap-4 rounded-2xl border-2 border-primary bg-primary/5 p-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                <img
                  src={customImage}
                  alt="Tu foto de perfil"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Foto cargada</p>
                <p className="text-xs text-muted-foreground">Toca para cambiar</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCustomImage(null)
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center gap-4 rounded-2xl border-2 border-dashed border-border p-4 text-left transition-all hover:border-primary/40 active:scale-[0.98]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Subir foto de perfil</p>
                <p className="text-xs text-muted-foreground">JPG o PNG, máximo 2 MB</p>
              </div>
              <Upload className="ml-auto h-5 w-5 text-muted-foreground" />
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      </div>

      <div className="screen-safe-bottom px-6">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!hasSelection}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continuar
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
