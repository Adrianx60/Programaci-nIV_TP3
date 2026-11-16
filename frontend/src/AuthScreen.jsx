import { useState } from 'react'
import './AuthScreen.css'

function AuthForm({ mode, error, notice, isLoading, onModeChange, onSubmit }) {
  const isRegister = mode === 'register'
  const [passwordError, setPasswordError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setPasswordError('')
    const values = Object.fromEntries(new FormData(event.currentTarget).entries())

    if (isRegister && values.contrasena !== values.confirmarContrasena) {
      setPasswordError('Las contraseñas no coinciden.')
      return
    }

    delete values.confirmarContrasena
    await onSubmit(values)
  }

  return (
    <section className="simple-auth-card">
      <h1>{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
      <p>{isRegister ? 'Registrá tus datos para continuar.' : 'Ingresá con tu correo y contraseña.'}</p>

      {notice && <div className="simple-message simple-message-success" role="status">{notice}</div>}
      {error && <div className="simple-message simple-message-error" role="alert">{error}</div>}
      {passwordError && <div className="simple-message simple-message-error" role="alert">{passwordError}</div>}

      <form className="simple-auth-form" onSubmit={handleSubmit}>
        {isRegister && (
          <label>
            <span>Nombre</span>
            <input name="nombre" autoComplete="name" required maxLength={100} />
          </label>
        )}
        <label>
          <span>Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={150}
          />
        </label>
        <label>
          <span>Contraseña</span>
          <input
            type="password"
            name="contrasena"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            required
            minLength={8}
          />
        </label>
        {isRegister && (
          <label>
            <span>Confirmar contraseña</span>
            <input
              type="password"
              name="confirmarContrasena"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </label>
        )}
        <button className="simple-primary-button" type="submit" disabled={isLoading}>
          {isLoading ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Ingresar'}
        </button>
      </form>

      <p className="simple-auth-switch">
        {isRegister ? '¿Ya tenés cuenta?' : '¿No tenés cuenta?'}
        {' '}
        <button
          type="button"
          onClick={() => onModeChange(isRegister ? 'login' : 'register')}
        >
          {isRegister ? 'Iniciar sesión' : 'Registrate'}
        </button>
      </p>
    </section>
  )
}

function AuthScreen({ mode, error, notice, isLoading, onModeChange, onSubmit }) {
  const isHome = mode === 'home'

  return (
    <div className="simple-auth-shell">
      <header className="simple-auth-header">
        <span className="simple-auth-brand"><span aria-hidden="true">🚚</span> Transporte</span>
        <nav aria-label="Navegación principal">
          <button type="button" onClick={() => onModeChange('home')}>Inicio</button>
          <button type="button" onClick={() => onModeChange('login')}>Iniciar sesión</button>
        </nav>
      </header>

      {isHome ? (
        <main className="simple-home">
          <h1>Gestión de transporte</h1>
          <p>Administrá los vehículos de tu empresa, sus conductores y los viajes realizados.</p>
          <button
            className="simple-primary-button"
            type="button"
            onClick={() => onModeChange('login')}
          >
            Ingresar
          </button>
        </main>
      ) : (
        <main className="simple-auth-content">
          <AuthForm
            mode={mode}
            error={error}
            notice={notice}
            isLoading={isLoading}
            onModeChange={onModeChange}
            onSubmit={onSubmit}
          />
        </main>
      )}
    </div>
  )
}

export default AuthScreen
