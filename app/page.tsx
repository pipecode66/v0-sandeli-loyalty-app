import { AppProvider } from "@/lib/app-context"
import { AppOrchestrator } from "@/components/sandeli/app-orchestrator"

export default function Page() {
  return (
    <div className="app-screen mx-auto w-full max-w-md bg-background">
      <AppProvider>
        <AppOrchestrator />
      </AppProvider>
    </div>
  )
}
