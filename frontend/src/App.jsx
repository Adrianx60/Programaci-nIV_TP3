import { useCallback, useEffect, useState } from 'react'
import AuthScreen from './AuthScreen.jsx'
import { api } from './api.js'
import Workspace from './Workspace.jsx'
import './App.css'

const emptyData = { vehiculos: [], conductores: [], viajes: [] }

async function fetchWorkspaceData(token) {
  const [vehiculos, conductores, viajes] = await Promise.all([
    api.list('vehiculos', token),
    api.list('conductores', token),
    api.list('viajes', token),
  ])
  return { vehiculos, conductores, viajes }
}

function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('accessToken'))
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('home')
  const [authError, setAuthError] = useState('')
  const [notice, setNotice] = useState('')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [data, setData] = useState(emptyData)
  const [isLoading, setIsLoading] = useState(() => Boolean(sessionStorage.getItem('accessToken')))
  const [loadError, setLoadError] = useState('')
  const [activePage, setActivePage] = useState('overview')

  const signOut = useCallback(() => {
    sessionStorage.removeItem('accessToken')
    setToken(null)
    setUser(null)
    setData(emptyData)
    setActivePage('overview')
    setAuthMode('home')
  }, [])

  const loadData = useCallback(async (activeToken, showLoading = true) => {
    if (showLoading) setIsLoading(true)
    setLoadError('')

    try {
      const [vehiculos, conductores, viajes] = await Promise.all([
        api.list('vehiculos', activeToken),
        api.list('conductores', activeToken),
        api.list('viajes', activeToken),
      ])
      setData({ vehiculos, conductores, viajes })
    } catch (error) {
      if (error.status === 401) {
        signOut()
        setAuthError('Tu sesión venció. Volvé a iniciar sesión.')
      } else {
        setLoadError(error.message)
      }
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [signOut])

  useEffect(() => {
    if (!token) return undefined
    let active = true

    fetchWorkspaceData(token)
      .then((workspaceData) => {
        if (active) {
          setData(workspaceData)
          setLoadError('')
        }
      })
      .catch((error) => {
        if (!active) return
        if (error.status === 401) {
          signOut()
          setAuthError('Tu sesión venció. Volvé a iniciar sesión.')
        } else {
          setLoadError(error.message)
        }
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [token, signOut])

  async function handleAuthentication(values) {
    setIsAuthenticating(true)
    setAuthError('')
    setNotice('')

    try {
      if (authMode === 'register') {
        await api.register(values)
        setAuthMode('login')
        setNotice('Cuenta creada. Ya podés iniciar sesión.')
        return
      }

      const response = await api.login(values)
      if (!response?.token) {
        throw new Error('La API no devolvió un token de acceso.')
      }

      sessionStorage.setItem('accessToken', response.token)
      setIsLoading(true)
      setLoadError('')
      setToken(response.token)
      setUser(response.usuario ?? null)
      setAuthMode('workspace')
      setAuthError('')
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setIsAuthenticating(false)
    }
  }

  async function handleMutation({ action, resource, id, values }) {
    if (action === 'create') {
      await api.create(resource, token, values)
    } else if (action === 'update') {
      await api.update(resource, token, id, values)
    } else if (action === 'delete') {
      await api.remove(resource, token, id)
    } else {
      throw new Error('La operación solicitada no es válida.')
    }

    await loadData(token, false)
  }

  if (!token) {
    return (
      <AuthScreen
        mode={authMode}
        error={authError}
        notice={notice}
        isLoading={isAuthenticating}
        onModeChange={(mode) => {
          setAuthError('')
          setNotice('')
          setAuthMode(mode)
        }}
        onSubmit={handleAuthentication}
      />
    )
  }

  return (
    <Workspace
      user={user}
      data={data}
      isLoading={isLoading}
      loadError={loadError}
      activePage={activePage}
      onPageChange={setActivePage}
      onLogout={signOut}
      onMutation={handleMutation}
      onRetry={() => loadData(token)}
    />
  )
}

export default App
