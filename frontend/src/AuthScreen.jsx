import { useState } from 'react'

const CURRENT_YEAR = new Date().getFullYear()

function Brand({ compact = false }) {
  return (
    <a className={`brand ${compact ? 'brand-compact' : ''}`} href="#" aria-label="Ruta Norte, inicio">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <path d="M5 23.5 13.2 7h5.2L27 23.5h-6l-2-4.2h-6.2l-2 4.2H5Z" fill="currentColor" />
          <path d="m14.4 15.1-1.6 3.2h4.8L16 15.1" fill="#121D2C" />
        </svg>
      </span>
      <span className="brand-copy">
        <strong>ruta norte</strong>
        {!compact && <small>GESTIÓN DE TRANSPORTE</small>}
      </span>
    </a>
  )
}

function AuthForm({ mode, error, notice, isLoading, onModeChange, onSubmit }) {
  const isRegister = mode === 'register'
  const [passwordError, setPasswordError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setPasswordError('')
    const formData = new FormData(event.currentTarget)
    const values = Object.fromEntries(formData.entries())

    if (isRegister && values.contrasena !== values.confirmarContrasena) {
      setPasswordError('Las contraseñas no coinciden.')
      return
    }

    delete values.confirmarContrasena
    await onSubmit(values)
  }

  return (
    <section className="auth-card">
      <div className="auth-card-heading">
        <span className="eyebrow">{isRegister ? 'EMPEZÁ HOY' : 'BIENVENIDO DE NUEVO'}</span>
        <h2>{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
        <p>
          {isRegister
            ? 'Registrá tu cuenta para administrar la operación.'
            : 'Ingresá para continuar con la gestión de tu flota.'}
        </p>
      </div>

      {notice && <div className="notice notice-success" role="status">{notice}</div>}
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      {passwordError && <div className="notice notice-error" role="alert">{passwordError}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        {isRegister && (
          <label className="field">
            <span>Nombre completo</span>
            <input name="nombre" autoComplete="name" required maxLength={100} />
          </label>
        )}
        <label className="field">
          <span>Correo electrónico</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="nombre@empresa.com"
            required
            maxLength={150}
          />
        </label>
        <label className="field">
          <span>Contraseña</span>
          <input
            type="password"
            name="contrasena"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            required
            minLength={8}
          />
          {isRegister && <small className="field-hint">Usá al menos 8 caracteres.</small>}
        </label>
        {isRegister && (
          <label className="field">
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
        <button className="button button-primary button-wide" type="submit" disabled={isLoading}>
          {isLoading ? 'Procesando…' : isRegister ? 'Crear cuenta' : 'Ingresar'}
          {!isLoading && <span aria-hidden="true">→</span>}
        </button>
      </form>

      <p className="auth-switch">
        {isRegister ? '¿Ya tenés una cuenta?' : '¿Todavía no tenés cuenta?'}
        {' '}
        <button
          type="button"
          className="text-button"
          onClick={() => onModeChange(isRegister ? 'login' : 'register')}
        >
          {isRegister ? 'Iniciar sesión' : 'Registrate'}
        </button>
      </p>
    </section>
  )
}

function HomeScreen({ onStart }) {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <Brand />
        <div className="landing-nav-actions">
          <button className="button button-quiet" onClick={() => onStart('login')}>Iniciar sesión</button>
          <button className="button button-primary" onClick={() => onStart('register')}>Crear cuenta <span aria-hidden="true">↗</span></button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-copy">
          <span className="eyebrow"><span className="status-dot" /> CONTROLÁ CADA KILÓMETRO</span>
          <h1>Tu flota,<br />en <em>movimiento.</em></h1>
          <p>
            Vehículos, conductores y viajes en un solo lugar. Información clara para que cada
            recorrido cuente.
          </p>
          <div className="landing-actions">
            <button className="button button-primary button-large" onClick={() => onStart('register')}>
              Empezar ahora <span aria-hidden="true">→</span>
            </button>
            <span className="landing-caption">Simple. Ordenado. Siempre en ruta.</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Resumen ilustrativo de actividad de flota">
          <div className="map-grid" />
          <svg className="route-line" viewBox="0 0 460 340" fill="none" aria-hidden="true">
            <path d="M57 260c42-3 40-94 107-87s62 42 111 15 37-102 116-102" stroke="currentColor" strokeWidth="2" strokeDasharray="5 8" />
            <circle cx="57" cy="260" r="7" fill="#C5F36B" />
            <circle cx="391" cy="86" r="7" fill="#C5F36B" />
            <circle cx="275" cy="188" r="5" fill="#fff" />
          </svg>
          <div className="map-label map-label-start"><span /> DEPÓSITO</div>
          <div className="map-label map-label-end"><span /> DESTINO</div>
          <div className="route-card">
            <div className="route-card-icon">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="1.7" />
                <circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="1.7" />
              </svg>
            </div>
            <div><small>VIAJE EN CURSO</small><strong>Ruta 018 · Córdoba</strong></div>
            <span className="route-live"><i /> ACTIVO</span>
          </div>
          <div className="hero-note"><strong>+12.8%</strong><span>kilómetros este mes</span><small>↗</small></div>
        </div>
      </section>

      <section className="landing-features" aria-label="Funciones principales">
        <article><span className="feature-number">01</span><div><h2>Tu flota, clara</h2><p>Datos y kilometraje de cada vehículo, siempre a mano.</p></div><span className="feature-arrow">↗</span></article>
        <article><span className="feature-number">02</span><div><h2>Conductores al día</h2><p>Licencias, vencimientos y recorridos en un mismo lugar.</p></div><span className="feature-arrow">↗</span></article>
        <article><span className="feature-number">03</span><div><h2>Cada viaje cuenta</h2><p>Registrá recorridos y consultá su historial fácilmente.</p></div><span className="feature-arrow">↗</span></article>
      </section>

      <footer className="landing-footer">
        <Brand compact />
        <span>GESTIÓN INTELIGENTE DE TRANSPORTE</span>
        <span>© {CURRENT_YEAR} Ruta Norte</span>
      </footer>
    </main>
  )
}

function AuthScreen({ mode, error, notice, isLoading, onModeChange, onSubmit }) {
  const isHome = mode === 'home'

  return (
    <div className="public-shell">
      {isHome ? (
        <HomeScreen onStart={onModeChange} />
      ) : (
        <main className="auth-page">
          <button
            type="button"
            className="back-home"
            onClick={() => onModeChange('home')}
          >
            <span aria-hidden="true">←</span> Volver al inicio
          </button>
          <div className="auth-layout">
            <div className="auth-aside">
              <Brand />
              <div>
                <span className="eyebrow">TODO EN SU LUGAR</span>
                <h1>Más control.<br /><em>Mejores rutas.</em></h1>
                <p>La información de tu operación, organizada para que puedas tomar mejores decisiones.</p>
              </div>
              <div className="auth-aside-foot"><span className="status-dot" /> TU OPERACIÓN, EN MARCHA</div>
            </div>
            <AuthForm
              mode={mode}
              error={error}
              notice={notice}
              isLoading={isLoading}
              onModeChange={onModeChange}
              onSubmit={onSubmit}
            />
          </div>
        </main>
      )}
    </div>
  )
}

export default AuthScreen
