import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="border-t border-border px-4 sm:px-6 py-4 text-center">
      <p className="text-xs text-muted">
        &copy; {new Date().getFullYear()} Valor Academy Middle School &middot; VAMS Academic Data Tracker
      </p>
      <p className="mt-1 text-[0.65rem] text-muted/60">
        Bright Star Schools &middot; Los Angeles, CA
      </p>
      <p className="mt-2">
        <Link
          to="/bug-report"
          className="text-[0.65rem] text-muted/60 underline decoration-muted/30 transition hover:text-secondary hover:decoration-secondary"
        >
          Report a Bug
        </Link>
      </p>
    </footer>
  )
}
