import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './context/AppContext'
import BottomNav from './components/BottomNav'
import ThisWeek from './pages/ThisWeek'
import ShoppingList from './pages/ShoppingList'
import Recipes from './pages/Recipes'
import History from './pages/History'

function ShoppingGuard() {
  const isLocked = useStore(s => s.currentWeek.isLocked)
  return isLocked ? <ShoppingList /> : <Navigate to="/" replace />
}

export default function App() {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-cream-100 relative">
      <div className="pb-20">
        <Routes>
          <Route path="/"         element={<ThisWeek />} />
          <Route path="/shopping" element={<ShoppingGuard />} />
          <Route path="/recipes"  element={<Recipes />} />
          <Route path="/history"  element={<History />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}
