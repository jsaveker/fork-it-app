import { useState } from 'react'
import { ThemeProvider, CssBaseline, Box } from '@mui/material'
import { lightTheme, darkTheme } from './theme'
import Header from './components/Header'
import LoginPage from './components/LoginPage'
import { useAuth } from './contexts/AuthContext'
import { Routes, Route } from 'react-router-dom'
import Profile from './pages/Profile'
import LunchOptions from './pages/LunchOptions'
import VotePage from './pages/VotePage'

export default function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const { user } = useAuth()

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeProvider theme={mode === 'light' ? lightTheme : darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Header mode={mode} onToggleColorMode={toggleColorMode} />
        <Routes>
          <Route path="/vote/:sessionId" element={<VotePage />} />
          {user ? (
            <Route
              path="/"
              element={
                <>
                  <Profile />
                  <LunchOptions />
                </>
              }
            />
          ) : (
            <Route path="/" element={<LoginPage />} />
          )}
        </Routes>
      </Box>
    </ThemeProvider>
  )


}


