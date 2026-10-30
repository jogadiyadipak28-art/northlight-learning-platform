import { NavLink, Outlet } from 'react-router-dom'
import { BubbleBackground } from './BubbleBackground'

export function Layout() {
  return (
    <div className="shell">
      <BubbleBackground />
      <aside className="site-sidebar" aria-label="Main navigation">
        <NavLink to="/" className="brand" aria-label="Northlight home">
          <span className="brand-mark" aria-hidden="true" />
          <span>Northlight</span>
        </NavLink>
        <nav className="sidebar-nav" aria-label="Main">
          <NavLink to="/" end title="Home">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3.5 10 8.5-7 8.5 7v10a1 1 0 0 1-1 1h-5.5v-7h-4v7H4.5a1 1 0 0 1-1-1V10Z" /></svg>
            Home
          </NavLink>
          <NavLink to="/catalog" title="Catalog">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></svg>
            Catalog
          </NavLink>
          <NavLink to="/dashboard" title="Progress">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5h16M6.5 16V11m5 5V5m5 11v-7" /></svg>
            Progress
          </NavLink>
        </nav>
        <div className="sidebar-caption">A quieter way to learn.</div>
      </aside>
      <Outlet />
      <footer className="site-foot">
        A quiet study hall. Progress lives in this browser.
      </footer>
    </div>
  )
}
