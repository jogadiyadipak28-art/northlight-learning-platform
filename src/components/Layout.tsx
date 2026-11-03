import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { BubbleBackground } from './BubbleBackground'
import { StarWarsToggleSwitch } from './StarWarsToggleSwitch'

type Theme = 'dark' | 'light'

export function Layout() {
  const [theme, setTheme] = useState<Theme>(() => (
    window.localStorage.getItem('northlight-theme') === 'light' ? 'light' : 'dark'
  ))

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('northlight-theme', theme)
  }, [theme])

  const lightBubbleColors = theme === 'light' ? {
    first: '226, 157, 120',
    second: '241, 185, 151',
    third: '252, 210, 177',
    fourth: '223, 157, 127',
    fifth: '235, 177, 144',
    sixth: '248, 199, 165',
  } : undefined

  return (
    <div className="shell">
      <BubbleBackground colors={lightBubbleColors} />
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
        <div className="sidebar-switch">
          <span>{theme === 'light' ? 'Light mode' : 'Dark mode'}</span>
          <StarWarsToggleSwitch checked={theme === 'light'} onChange={(light) => setTheme(light ? 'light' : 'dark')} />
        </div>
        <div className="sidebar-caption">A quieter way to learn.</div>
      </aside>
      <div className="theme-switch-floating">
        <span>{theme === 'light' ? 'Light mode' : 'Dark mode'}</span>
        <StarWarsToggleSwitch checked={theme === 'light'} onChange={(light) => setTheme(light ? 'light' : 'dark')} />
      </div>
      <Outlet />
      <footer className="site-foot">
        A quiet study hall. Progress lives in this browser.
      </footer>
    </div>
  )
}
