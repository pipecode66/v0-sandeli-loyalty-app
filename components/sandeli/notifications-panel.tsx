"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Bell, ChevronDown, ChevronUp, X } from "lucide-react"
import { useApp } from "@/lib/app-context"

function formatFullDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `hace ${Math.max(minutes, 1)} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  return `hace ${days} d`
}

interface Props {
  onClose: () => void
}

export function NotificationsPanel({ onClose }: Props) {
  const { notifications, markNotificationRead } = useApp()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const handleToggle = (id: string) => {
    markNotificationRead(id)
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative mt-auto flex max-h-[85dvh] flex-col rounded-t-3xl bg-background shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>

        <div className="flex items-center justify-between px-5 pb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Notificaciones</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-all active:scale-90"
            aria-label="Cerrar notificaciones"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="sheet-safe-bottom flex-1 overflow-y-auto px-5">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-base font-semibold text-foreground">Sin notificaciones</p>
              <p className="text-sm text-muted-foreground">
                Las notificaciones de Sandeli aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {notifications.map((notification) => {
                const isExpanded = expandedId === notification.id
                return (
                  <div
                    key={notification.id}
                    className={`w-full rounded-2xl transition-all ${
                      notification.read
                        ? "bg-secondary"
                        : "border border-primary/20 bg-primary/5"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggle(notification.id)}
                      className="w-full p-4 text-left"
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                          <span
                            className={`text-sm font-semibold ${
                              notification.read ? "text-foreground" : "text-primary"
                            }`}
                          >
                            {notification.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">
                            {timeAgo(notification.date)}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {notification.category && (
                        <span className="mb-2 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          {notification.category}
                        </span>
                      )}

                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {notification.message}
                      </p>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border/50 px-4 pb-4 pt-3">
                        {notification.imageUrl && (
                          <div className="relative mb-3 h-36 w-full overflow-hidden rounded-xl bg-background">
                            <Image
                              src={notification.imageUrl}
                              alt={notification.title}
                              fill
                              className="object-cover"
                              sizes="100vw"
                            />
                          </div>
                        )}
                        <p className="mb-3 text-sm leading-relaxed text-foreground">
                          {notification.fullMessage}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Enviada: {formatFullDate(notification.date)}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
