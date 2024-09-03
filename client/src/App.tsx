import Login from './views/login'
import Register from './views/register'
import Home from './components/home'
import Chat from './components/chat'
import { Routes, Route } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </>
  )
}

export default App
