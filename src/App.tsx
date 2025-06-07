import { useState } from 'react'
import { ThemeProvider, CssBaseline, Box } from '@mui/material'
import { lightTheme, darkTheme } from './theme'
import Header from './components/Header'
import GroupSession from './components/GroupSession'
import { RestaurantFinder } from './components/RestaurantFinder'
import LoginPage from './components/LoginPage'
import { useAuth } from './contexts/AuthContext'

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
        {user ? (
          <>
            <GroupSession />
            <RestaurantFinder />
          </>
        ) : (
          <LoginPage />
        )}
      </Box>
    </ThemeProvider>
  )


}


