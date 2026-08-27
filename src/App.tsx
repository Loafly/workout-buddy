import { Routes, Route, Navigate } from 'react-router-dom'
import TabBar from './components/TabBar'
import Today from './pages/Today'
import Diet from './pages/Diet'
import History from './pages/History'
import Guide from './pages/Guide'
import Settings from './pages/Settings'

export default function App() {
  return (
    <div className="flex h-full flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 overflow-y-auto px-4 pb-8">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/diet" element={<Diet />} />
          <Route path="/history" element={<History />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <TabBar />
    </div>
  )
}
