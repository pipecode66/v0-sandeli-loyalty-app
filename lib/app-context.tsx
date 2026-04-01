"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  clearAccessToken,
  fetchPublicJson,
  getAccessToken,
} from "@/lib/public-api-client"

export interface UserProfile {
  id: string
  email?: string
  phone?: string
  avatar: string | null
  avatarType: "preset" | "custom"
  userCode: string
  name: string
  points: number
  joinDate: string
  redeemedToday: number
  lastRedeemDate: string
}

export interface Notification {
  id: string
  title: string
  message: string
  fullMessage: string
  category?: string
  imageUrl?: string | null
  date: string
  read: boolean
}

export interface PurchaseRecord {
  id: string
  date: string
  invoiceNumber: string
  total: number
  pointsEarned: number
}

export interface RedemptionRecord {
  id: string
  code: string
  productName: string
  pointsSpent: number
  status: string
  createdAt: string
  validatedAt: string | null
}

export interface RedeemableProduct {
  id: string
  name: string
  description: string
  pointsCost: number
  image: string
  category: string
}

export interface HomeBanner {
  id: string
  mediaUrl: string
  mediaType: "image" | "video"
  redirectType: "url"
  redirectUrl: string | null
  sortOrder: number
}

export interface PendingLoginState {
  mode: "email" | "phone"
  identifier: string
  displayValue: string
  clientId: string
}

type AppScreen = "login" | "verification" | "avatar-setup" | "welcome" | "main"
type MainTab = "home" | "history" | "redeemables"

interface AppState {
  screen: AppScreen
  mainTab: MainTab
  user: UserProfile | null
  notifications: Notification[]
  purchases: PurchaseRecord[]
  redemptions: RedemptionRecord[]
  products: RedeemableProduct[]
  banners: HomeBanner[]
  showIOSTutorial: boolean
  pendingLogin: PendingLoginState | null
  setPendingLogin: (login: PendingLoginState | null) => void
  setScreen: (screen: AppScreen) => void
  setMainTab: (tab: MainTab) => void
  setUser: (user: UserProfile | null) => void
  updateUser: (updates: Partial<UserProfile>) => void
  markNotificationRead: (id: string) => void
  dismissIOSTutorial: () => void
  redeemProduct: (
    product: RedeemableProduct,
  ) => Promise<{ success: boolean; code?: string; waitMinutes?: number; error?: string }>
  logout: () => void
  refreshData: () => Promise<void>
}

const AppContext = createContext<AppState | undefined>(undefined)

function isIOS(): boolean {
  if (typeof window === "undefined") return false
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  )
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as unknown as { standalone: boolean }).standalone === true)
  )
}

function mapClientToUser(client: Record<string, unknown>): UserProfile {
  return {
    id: String(client.id || ""),
    email: client.email ? String(client.email) : undefined,
    phone: client.phone ? String(client.phone) : undefined,
    avatar: (client.avatar as string | null) || null,
    avatarType: (client.avatar_type as "preset" | "custom") || "preset",
    userCode: String(client.user_code || ""),
    name: String(client.full_name || ""),
    points: Number(client.points || 0),
    joinDate: String(client.created_at || new Date().toISOString()),
    redeemedToday: Number(client.redeemed_today || 0),
    lastRedeemDate: String(client.last_redeem_date || ""),
  }
}

function mapInvoicesToPurchases(invoices: Record<string, unknown>[]): PurchaseRecord[] {
  return invoices.map((invoice) => ({
    id: String(invoice.id || ""),
    date: String(invoice.created_at || ""),
    invoiceNumber: String(invoice.invoice_number || ""),
    total: Number(invoice.amount || 0),
    pointsEarned: Number(invoice.points_earned || 0),
  }))
}

function mapRedemptions(items: Record<string, unknown>[]): RedemptionRecord[] {
  return items.map((item) => {
    const productRelation = item.products
    const productData = Array.isArray(productRelation)
      ? (productRelation[0] as { name?: string } | undefined)
      : (productRelation as { name?: string } | null)

    return {
      id: String(item.id || ""),
      code: String(item.code || ""),
      productName: String(productData?.name || "Producto"),
      pointsSpent: Number(item.points_spent || 0),
      status: String(item.status || ""),
      createdAt: String(item.created_at || ""),
      validatedAt: item.validated_at ? String(item.validated_at) : null,
    }
  })
}

function mapProducts(products: Record<string, unknown>[]): RedeemableProduct[] {
  return products.map((product) => {
    const categoryRelation = product.categories
    const category = Array.isArray(categoryRelation)
      ? (categoryRelation[0] as { name?: string; points_cost?: number } | undefined)
      : (categoryRelation as { name?: string; points_cost?: number } | null)

    return {
      id: String(product.id || ""),
      name: String(product.name || ""),
      description: String(product.description || ""),
      pointsCost: Number(category?.points_cost || product.points_cost || 0),
      image: String(product.image_url || "/placeholder.jpg"),
      category: String(category?.name || "General"),
    }
  })
}

function mapBanners(items: Record<string, unknown>[]): HomeBanner[] {
  return items.map((item) => ({
    id: String(item.id || ""),
    mediaUrl: String(item.media_url || ""),
    mediaType: (item.media_type as "image" | "video") || "image",
    redirectType: "url",
    redirectUrl: item.redirect_url ? String(item.redirect_url) : null,
    sortOrder: Number(item.sort_order || 0),
  }))
}

function mapNotifications(items: Record<string, unknown>[]): Notification[] {
  return items.map((item) => {
    const description = String(item.description || "")
    const shortMessage =
      description.length > 90 ? `${description.slice(0, 87).trimEnd()}...` : description

    return {
      id: String(item.id || ""),
      title: String(item.title || "Notificación"),
      category: item.category ? String(item.category) : undefined,
      imageUrl: item.image_url ? String(item.image_url) : null,
      message: shortMessage,
      fullMessage: description,
      date: String(item.created_at || new Date().toISOString()),
      read: false,
    }
  })
}

function mergeNotificationReadState(
  current: Notification[],
  incoming: Notification[],
): Notification[] {
  const readById = new Map(current.map((item) => [item.id, item.read]))
  return incoming.map((item) => ({
    ...item,
    read: readById.get(item.id) || false,
  }))
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<AppScreen>("login")
  const [mainTab, setMainTab] = useState<MainTab>("home")
  const [user, setUserState] = useState<UserProfile | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([])
  const [redemptions, setRedemptions] = useState<RedemptionRecord[]>([])
  const [products, setProducts] = useState<RedeemableProduct[]>([])
  const [banners, setBanners] = useState<HomeBanner[]>([])
  const [showIOSTutorial, setShowIOSTutorial] = useState(false)
  const [pendingLogin, setPendingLogin] = useState<PendingLoginState | null>(null)
  const [accessToken, setAccessTokenState] = useState<string | null>(null)

  const resolveToken = useCallback(() => accessToken || getAccessToken(), [accessToken])

  const loadCatalogData = useCallback(async () => {
    const catalog = await fetchPublicJson<{
      products?: Record<string, unknown>[]
      banners?: Record<string, unknown>[]
    }>("/catalog")

    if (catalog.ok && catalog.data?.products) {
      setProducts(mapProducts(catalog.data.products))
    }
    if (catalog.ok && catalog.data?.banners) {
      setBanners(mapBanners(catalog.data.banners))
    }
  }, [])

  const loadNotifications = useCallback(async () => {
    const response = await fetchPublicJson<{ notifications?: Record<string, unknown>[] }>(
      "/notifications",
      { method: "GET" },
    )

    if (response.ok && response.data?.notifications) {
      const mapped = mapNotifications(response.data.notifications)
      setNotifications((current) => mergeNotificationReadState(current, mapped))
    }
  }, [])

  const hydrateClientSession = useCallback(
    async (tokenOverride?: string | null) => {
      const token = tokenOverride || resolveToken()
      if (!token) {
        if (!pendingLogin) {
          setUserState(null)
          setScreen("login")
        }
        return
      }

      const me = await fetchPublicJson<{ client?: Record<string, unknown> }>(
        "/auth/me",
        { method: "GET" },
        token,
      )

      if (!me.ok || !me.data?.client) {
        clearAccessToken()
        setAccessTokenState(null)
        setUserState(null)
        setPurchases([])
        setRedemptions([])
        setScreen("login")
        return
      }

      const mappedUser = mapClientToUser(me.data.client)
      setUserState(mappedUser)
      setScreen(mappedUser.avatar ? "main" : "avatar-setup")

      const tutorialDismissed = localStorage.getItem("sandeli_ios_tutorial_dismissed")
      if (isIOS() && !isStandalone() && !tutorialDismissed) {
        setShowIOSTutorial(true)
      }
    },
    [pendingLogin, resolveToken],
  )

  const loadPurchaseHistory = useCallback(
    async (tokenOverride?: string | null) => {
      const token = tokenOverride || resolveToken()
      if (!token) {
        setPurchases([])
        return
      }

      const invoices = await fetchPublicJson<{ invoices?: Record<string, unknown>[] }>(
        "/invoices",
        { method: "GET" },
        token,
      )

      if (invoices.ok && invoices.data?.invoices) {
        setPurchases(mapInvoicesToPurchases(invoices.data.invoices))
      } else if (invoices.status === 401) {
        setPurchases([])
      }
    },
    [resolveToken],
  )

  const loadRedemptionHistory = useCallback(
    async (tokenOverride?: string | null) => {
      const token = tokenOverride || resolveToken()
      if (!token) {
        setRedemptions([])
        return
      }

      const response = await fetchPublicJson<{ redemptions?: Record<string, unknown>[] }>(
        "/redemptions",
        { method: "GET" },
        token,
      )

      if (response.ok && response.data?.redemptions) {
        setRedemptions(mapRedemptions(response.data.redemptions))
      } else if (response.status === 401) {
        setRedemptions([])
      }
    },
    [resolveToken],
  )

  const refreshData = useCallback(async () => {
    const token = resolveToken()

    if (!token) {
      if (!pendingLogin) {
        setUserState(null)
        setPurchases([])
        setRedemptions([])
        setScreen("login")
      }
      await Promise.all([loadCatalogData(), loadNotifications()])
      return
    }

    if (token !== accessToken) {
      setAccessTokenState(token)
    }

    await Promise.all([
      hydrateClientSession(token),
      loadCatalogData(),
      loadNotifications(),
      loadPurchaseHistory(token),
      loadRedemptionHistory(token),
    ])
  }, [
    accessToken,
    hydrateClientSession,
    loadCatalogData,
    loadNotifications,
    loadPurchaseHistory,
    loadRedemptionHistory,
    pendingLogin,
    resolveToken,
  ])

  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      setAccessTokenState(token)
    }
    refreshData().catch(() => undefined)
  }, [refreshData])

  useEffect(() => {
    const token = resolveToken()
    if (!token || pendingLogin) return

    const interval = window.setInterval(() => {
      refreshData().catch(() => undefined)
    }, 20000)

    const onFocus = () => {
      refreshData().catch(() => undefined)
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshData().catch(() => undefined)
      }
    }

    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [pendingLogin, refreshData, resolveToken])

  useEffect(() => {
    if (typeof document === "undefined") return

    const root = document.documentElement
    if (isIOS() && !isStandalone()) {
      root.dataset.iosBrowser = "true"
    } else {
      delete root.dataset.iosBrowser
    }

    return () => {
      delete root.dataset.iosBrowser
    }
  }, [])

  const setUser = useCallback((newUser: UserProfile | null) => {
    setUserState(newUser)
  }, [])

  const updateUser = useCallback(
    (updates: Partial<UserProfile>) => {
      setUserState((previous) => {
        if (!previous) return previous
        return { ...previous, ...updates }
      })

      const token = resolveToken()
      if (!token) return

      const payload: Record<string, unknown> = {}
      if (typeof updates.name === "string") payload.full_name = updates.name.trim()
      if (typeof updates.avatar === "string" || updates.avatar === null) payload.avatar = updates.avatar
      if (updates.avatarType === "custom" || updates.avatarType === "preset") {
        payload.avatar_type = updates.avatarType
      }

      if (Object.keys(payload).length > 0) {
        fetchPublicJson<{ client?: Record<string, unknown> }>(
          "/auth/me",
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          },
          token,
        )
          .then((result) => {
            if (result.ok && result.data?.client) {
              setUserState(mapClientToUser(result.data.client))
            }
          })
          .catch(() => undefined)
      }
    },
    [resolveToken],
  )

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item)),
    )
  }, [])

  const dismissIOSTutorial = useCallback(() => {
    setShowIOSTutorial(false)
    localStorage.setItem("sandeli_ios_tutorial_dismissed", "true")
  }, [])

  const redeemProduct = useCallback(
    async (product: RedeemableProduct) => {
      const token = resolveToken()
      if (!token) {
        return { success: false, error: "Debes iniciar sesión para canjear." }
      }

      const response = await fetchPublicJson<{
        error?: string
        waitMinutes?: number
        code?: string
        redemption?: { code?: string }
      }>(
        "/redemptions",
        {
          method: "POST",
          body: JSON.stringify({ product_id: product.id }),
        },
        token,
      )

      if (!response.ok) {
        return {
          success: false,
          waitMinutes: response.data?.waitMinutes,
          error: response.data?.error || "No se pudo crear el canje.",
        }
      }

      await Promise.all([
        hydrateClientSession(token),
        loadPurchaseHistory(token),
        loadRedemptionHistory(token),
      ])

      return {
        success: true,
        code: response.data?.code || response.data?.redemption?.code,
      }
    },
    [hydrateClientSession, loadPurchaseHistory, loadRedemptionHistory, resolveToken],
  )

  const logout = useCallback(() => {
    clearAccessToken()
    setAccessTokenState(null)
    setUserState(null)
    setPurchases([])
    setRedemptions([])
    setNotifications([])
    setPendingLogin(null)
    setScreen("login")
    setMainTab("home")
  }, [])

  const value = useMemo(
    () => ({
      screen,
      mainTab,
      user,
      notifications,
      purchases,
      redemptions,
      products,
      banners,
      showIOSTutorial,
      pendingLogin,
      setPendingLogin,
      setScreen,
      setMainTab,
      setUser,
      updateUser,
      markNotificationRead,
      dismissIOSTutorial,
      redeemProduct,
      logout,
      refreshData,
    }),
    [
      banners,
      dismissIOSTutorial,
      logout,
      mainTab,
      markNotificationRead,
      notifications,
      pendingLogin,
      products,
      purchases,
      redeemProduct,
      redemptions,
      refreshData,
      screen,
      setUser,
      showIOSTutorial,
      updateUser,
      user,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

export { isIOS }
