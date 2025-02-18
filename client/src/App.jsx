import { Outlet } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-pink-light">
      <Outlet />
    </div>
  )
}

export default App
