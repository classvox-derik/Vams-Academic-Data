import { useState, useEffect } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { cn } from "@/lib/utils"
import { CoolIcon } from "@/components/ui/CoolIcon"

function getInitialDarkMode(): boolean {
  const stored = localStorage.getItem("darkMode")
  if (stored !== null) return stored === "true"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

const navSections = [
  {
    items: [
      { to: "/", icon: "More_Grid_Big", label: "Dashboard" },
      { to: "/students", icon: "Users", label: "Students" },
    ],
  },
  {
    title: "Grade Levels",
    items: [
      { to: "/grade/5", icon: "Building_01", label: "5th Grade" },
      { to: "/grade/6", icon: "Building_01", label: "6th Grade" },
      { to: "/grade/7", icon: "Building_01", label: "7th Grade" },
      { to: "/grade/8", icon: "Building_01", label: "8th Grade" },
    ],
  },
  {
    title: "Assessments",
    items: [
      { to: "/iready", icon: "Book_Open", label: "iReady Diagnostics" },
      { to: "/caaspp", icon: "Chart_Bar_Vertical_01", label: "CAASPP" },
      { to: "/iab", icon: "List_Checklist", label: "IAB Results" },
      { to: "/cast", icon: "Data", label: "CAST Science" },
    ],
  },
  {
    title: "Academics",
    items: [
      { to: "/gpas", icon: "Star", label: "GPA Tracking" },
      { to: "/interventions", icon: "Heart_01", label: "Interventions" },
    ],
  },
]

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(getInitialDarkMode)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
    localStorage.setItem("darkMode", String(darkMode))
  }, [darkMode])

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <nav className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-menu-bg text-menu-text transition-transform duration-300 ease-in-out md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="shrink-0 px-5 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <img src="/logo.png" alt="Valor Academy Middle School" className="h-auto w-full max-w-[120px] md:max-w-[140px]" />
            <button className="md:hidden rounded-lg p-1 text-menu-text/50 hover:bg-menu-text/5 hover:text-menu-text transition-colors" onClick={() => setSidebarOpen(false)}>
              <CoolIcon name="Close_MD" size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-1">
          {navSections.map((section, si) => (
            <div key={si} className={si > 0 ? "mt-1" : ""}>
              {section.title && (
                <div className="px-3 pb-1 pt-2 md:pt-3 text-[0.6rem] font-semibold uppercase tracking-widest text-menu-text/40">
                  {section.title}
                </div>
              )}
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 md:py-2.5 text-[0.82rem] md:text-[0.85rem] transition-all duration-200",
                    isActive
                      ? "bg-menu-text/10 font-medium text-menu-text shadow-sm"
                      : "text-menu-text/60 hover:bg-menu-text/5 hover:text-menu-text"
                  )}
                >
                  <CoolIcon name={item.icon} size={17} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:ml-64 overflow-x-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center gap-3 sm:gap-4 border-b border-menu-text/10 bg-menu-bg px-4 sm:px-6">
          <button className="md:hidden rounded-lg p-1.5 text-menu-text/60 hover:bg-menu-text/5 hover:text-menu-text transition-colors" onClick={() => setSidebarOpen(true)}>
            <CoolIcon name="Hamburger_MD" size={20} />
          </button>
          <div className="relative flex-1 max-w-md">
            <CoolIcon name="Search_Magnifying_Glass" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-menu-text/40" />
            <input
              type="text"
              placeholder="Search students, assessments..."
              className="w-full rounded-xl border border-menu-text/10 py-2 pl-9 pr-3 text-sm text-menu-text placeholder:text-menu-text/40 transition-all focus:border-teal focus:ring-2 focus:ring-teal/10 focus:outline-none"
              style={{ background: "var(--theme-header-input-bg)" }}
            />
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl border border-menu-text/10 text-menu-text/60 transition-all hover:text-menu-text hover:shadow-sm"
            style={{ background: "var(--theme-header-input-bg)" }}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <CoolIcon name={darkMode ? "Sun" : "Moon"} size={18} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-3 sm:p-6 max-w-[1600px] w-full overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
