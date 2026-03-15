import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Grid3x3, BarChart3, Settings, Zap } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/grid', icon: Grid3x3, label: 'Pattern Grid' },
  { to: '/metrics', icon: BarChart3, label: 'Metrics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  return (
    <div className="bg-bg-primary text-text-primary" style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      
      {/* Premium Frosted Glass Sidebar */}
      <aside 
        className="bg-bg-secondary/40 backdrop-blur-3xl border-r border-white/5 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.2)]"
        style={{ 
          width: '80px', 
          flexShrink: 0, 
          position: 'sticky', 
          top: 0, 
          height: '100vh', 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '2rem',
          paddingBottom: '2rem',
          gap: '1rem',
        }}
      >
        <div className="mb-8 flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent-glow shadow-[0_0_20px_rgba(124,58,237,0.3)]">
          <Zap className="w-6 h-6 text-white drop-shadow-md" />
        </div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'bg-accent/20 text-accent-glow shadow-[inset_0_0_12px_rgba(124,58,237,0.2)]'
                  : 'text-text-muted hover:text-white hover:bg-white/5 hover:shadow-sm'
              }`
            }
          >
            <item.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            
            {/* Tooltip */}
            <span className="absolute left-[calc(100%+16px)] px-3 py-2 rounded-xl bg-bg-card border border-white/10 text-xs font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-xl z-[60] translate-x-2 group-hover:translate-x-0">
              {item.label}
            </span>
          </NavLink>
        ))}
      </aside>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, minWidth: 0, padding: '3rem 4rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
      
    </div>
  )
}
