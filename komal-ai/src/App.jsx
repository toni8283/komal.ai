import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { TherapyProvider } from './context/TherapyContext'
import Home from './pages/Home/Home'
import VoiceTherapy from './pages/VoiceTherapy/VoiceTherapy'
import About from './pages/About/About'
import ChatHistory from './pages/ChatHistory/ChatHistory'

function App() {
  const location = useLocation()

  return (
    <TherapyProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/talk" element={<VoiceTherapy />} />
          <Route path="/therapy" element={<VoiceTherapy />} />
          <Route path="/therapy/:therapistId" element={<VoiceTherapy />} />
          <Route path="/about" element={<About />} />
          <Route path="/history" element={<ChatHistory />} />
        </Routes>
      </AnimatePresence>
    </TherapyProvider>
  )
}

export default App
