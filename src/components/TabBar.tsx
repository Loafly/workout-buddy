import { NavLink } from 'react-router-dom'

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    {d.split('|').map((p) => (
      <path key={p} d={p} />
    ))}
  </svg>
)

const tabs = [
  { to: '/', label: '오늘', d: 'M4 6h16v14H4z|M8 3.5v4|M16 3.5v4|M4 10h16|M9 15.5l2 2 4-4' },
  { to: '/diet', label: '식단', d: 'M4 12h16a8 8 0 0 1-16 0Z|M3 20h18|M8 4v4|M12 3v5|M16 4v4' },
  { to: '/history', label: '기록', d: 'M4 4v16h16|M7.5 15l3.5-4.5 3 2.5L19 7' },
  { to: '/guide', label: '가이드', d: 'M5 4h9a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Z|M16 8h3v12h-3' },
  { to: '/settings', label: '설정', d: 'M4 7h16|M4 12h16|M4 17h16|M9 5.4v3.2|M15 10.4v3.2|M9 15.4v3.2' },
]

export default function TabBar() {
  return (
    <nav className="safe-bottom sticky bottom-0 z-10 border-t border-zinc-900 bg-[#0a0a0b]">
      <ul className="mx-auto flex max-w-lg">
        {tabs.map((t) => (
          <li key={t.to} className="flex-1">
            <NavLink
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[10px] tracking-tight transition-colors ${
                  isActive ? 'text-zinc-100' : 'text-zinc-600'
                }`
              }
            >
              {icon(t.d)}
              {t.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
