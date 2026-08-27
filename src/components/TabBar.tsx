import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: '오늘', icon: '🏋️' },
  { to: '/diet', label: '식단', icon: '🍚' },
  { to: '/history', label: '기록', icon: '📈' },
  { to: '/guide', label: '가이드', icon: '📖' },
  { to: '/settings', label: '설정', icon: '⚙️' },
]

export default function TabBar() {
  return (
    <nav className="safe-bottom sticky bottom-0 z-10 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
      <ul className="mx-auto flex max-w-lg">
        {tabs.map((t) => (
          <li key={t.to} className="flex-1">
            <NavLink
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2.5 text-[11px] transition-colors ${
                  isActive ? 'text-sky-400' : 'text-slate-500'
                }`
              }
            >
              <span className="text-lg leading-none">{t.icon}</span>
              {t.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
