"use client"

interface SidebarProps {
  activeTab: "builder" | "leaderboard"
  setActiveTab: (tab: "builder" | "leaderboard") => void
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h2 className="text-lg font-bold text-sidebar-foreground">Menu</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => setActiveTab("builder")}
          className={`w-full px-4 py-3 rounded-lg text-left transition-colors ${
            activeTab === "builder"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/20"
          }`}
        >
          <span className="text-lg mr-2">🔨</span>
          Spell Builder
        </button>

        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`w-full px-4 py-3 rounded-lg text-left transition-colors ${
            activeTab === "leaderboard"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/20"
          }`}
        >
          <span className="text-lg mr-2">🏆</span>
          Leaderboard
        </button>
      </nav>

      <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/60">
        <p>v0.1.0</p>
      </div>
    </aside>
  )
}
