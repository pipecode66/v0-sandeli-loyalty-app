"use client"

import Image from "next/image"
import { useApp } from "@/lib/app-context"
import { Bell, Gift, Home, Receipt, Star } from "lucide-react"
import { useState } from "react"
import { NotificationsPanel } from "./notifications-panel"

export function TopBar() {
  const { user, notifications, mainTab, setMainTab, isIOSBrowser } = useApp()
  const [showNotifications, setShowNotifications] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length
  const tabs = [
    { key: "home" as const, label: "Inicio", icon: Home },
    { key: "history" as const, label: "Historial", icon: Receipt },
    { key: "redeemables" as const, label: "Canjes", icon: Gift },
  ]

  return (
    <>
      <header className="safe-top sticky top-0 z-40 bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-2.5">
          <Image
            src="/images/logo.png"
            alt="Sandeli"
            width={120}
            height={46}
            className="h-8 w-auto"
          />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5">
              <Star className="h-4 w-4 text-primary" fill="currentColor" />
              <span className="text-sm font-bold text-primary">
                {user?.points ?? 0}
              </span>
              <span className="text-[10px] font-medium text-primary/70">
                pts
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowNotifications(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-secondary transition-all active:scale-90"
              aria-label="Notificaciones"
            >
              <Bell className="h-5 w-5 text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-sandeli-magenta text-[10px] font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {isIOSBrowser && (
          <div className="px-4 pb-3">
            <div className="grid grid-cols-3 gap-1 rounded-2xl bg-secondary p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = mainTab === tab.key
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setMainTab(tab.key)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition-all active:scale-95 ${
                      isActive
                        ? "bg-background text-primary shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </header>

      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}
    </>
  )
}
