import { useMemo, useState } from 'react'

const pageItems = [
  { id: 'overview', label: 'Resumen', icon: 'grid' },
  { id: 'vehiculos', label: 'Vehículos', icon: 'truck' },
  { id: 'conductores', label: 'Conductores', icon: 'users' },
  { id: 'viajes', label: 'Viajes', icon: 'route' },
]

const ARGENTINA_TIME_ZONE = 'America/Argentina/Buenos_Aires'
const numberFormat = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 })
const dateFormat = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'medium',
  timeZone: ARGENTINA_TIME_ZONE,
})
const dateTimeFormat = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: ARGENTINA_TIME_ZONE,
  hour12: false,
})
const CURRENT_TIMESTAMP = Date.now()
const CURRENT_DATE = new Date(CURRENT_TIMESTAMP)
const CURRENT_YEAR = Number(
  new Intl.DateTimeFormat('en', {
    year: 'numeric',
    timeZone: ARGENTINA_TIME_ZONE,
  }).format(CURRENT_DATE),
)
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2})?$/

function Icon({ name, size = 18 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    truck: <><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    route: <><circle cx="6" cy="6" r="3" /><circle cx="18" cy="18" r="3" /><path d="M8.5 8.5 11 11l-2 2 4 4M15 7h3a3 3 0 0 1 3 3v2" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.5 9A7 7 0 0 1 18 6l2 2M4 16l2 2a7 7 0 0 0 12.5-3" /></>,
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.grid}
    </svg>
  )
}

function formatNumber(value) {
  return numberFormat.format(Number(value) || 0)
}

function formatDate(value, includeTime = false) {
  if (!value) return '—'
  const date = parseArgentinaDate(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return (includeTime ? dateTimeFormat : dateFormat).format(date)
}

function parseArgentinaDate(value) {
  if (value instanceof Date) return value

  const text = String(value).trim()
  if (DATE_ONLY_PATTERN.test(text)) {
    return new Date(`${text}T12:00:00-03:00`)
  }

  const normalized = text.replace(' ', 'T')
  if (DATE_TIME_PATTERN.test(text)) {
    const withSeconds = normalized.length === 16 ? `${normalized}:00` : normalized
    return new Date(`${withSeconds}-03:00`)
  }

  return new Date(text)
}

function vehicleName(vehicle) {
  return [vehicle?.marca, vehicle?.modelo].filter(Boolean).join(' ') || 'Vehículo'
}

function driverName(driver) {
  return [driver?.nombre, driver?.apellido].filter(Boolean).join(' ') || 'Conductor'
}

function kmById(trips, idKey) {
  return trips.reduce((totals, trip) => {
    const id = trip[idKey]
    if (id !== undefined && id !== null) {
      totals[id] = (totals[id] || 0) + Number(trip.kilometros || 0)
    }
    return totals
  }, {})
}

function tripDateOrder(first, second) {
  return parseArgentinaDate(second.fecha_salida || '')
    - parseArgentinaDate(first.fecha_salida || '')
}

function StatCard({ label, value, detail, icon, accent }) {
  return (
    <article className={`stat-card ${accent ? 'stat-card-accent' : ''}`}>
      <div className="stat-card-top">
        <span>{label}</span>
        <span className="stat-icon"><Icon name={icon} size={19} /></span>
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  )
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  )
}

function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon"><Icon name="route" size={22} /></span>
      <strong>{title}</strong>
      <p>{description}</p>
      {action}
    </div>
  )
}

function TripTable({ trips, vehicles, drivers, compact = false }) {
  const vehicleById = new Map(vehicles.map((item) => [String(item.id), item]))
  const driverById = new Map(drivers.map((item) => [String(item.id), item]))
  const sortedTrips = [...trips].sort(tripDateOrder)

  if (sortedTrips.length === 0) {
    return (
      <EmptyState
        title="Todavía no hay viajes"
        description="Cuando registres un recorrido, aparecerá acá."
      />
    )
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>RECORRIDO</th>
            <th>VEHÍCULO</th>
            {!compact && <th>CONDUCTOR</th>}
            <th>FECHA</th>
            <th className="cell-number">DISTANCIA</th>
          </tr>
        </thead>
        <tbody>
          {(compact ? sortedTrips.slice(0, 5) : sortedTrips).map((trip) => {
            const vehicle = vehicleById.get(String(trip.vehiculo_id))
            const driver = driverById.get(String(trip.conductor_id))
            return (
              <tr key={trip.id}>
                <td>
                  <div className="route-cell">
                    <span className="route-cell-mark"><Icon name="pin" size={16} /></span>
                    <span><strong>{trip.origen} → {trip.destino}</strong><small>#{String(trip.id).padStart(4, '0')}</small></span>
                  </div>
                </td>
                <td><span className="table-primary">{vehicleName(vehicle)}</span><small className="table-subtext">{vehicle?.patente || 'Sin patente'}</small></td>
                {!compact && <td>{driverName(driver)}</td>}
                <td>{formatDate(trip.fecha_salida, true)}</td>
                <td className="cell-number"><strong>{formatNumber(trip.kilometros)} km</strong></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Overview({ data, onPageChange }) {
  const totalKm = data.viajes.reduce((total, trip) => total + Number(trip.kilometros || 0), 0)
  const driverTotals = kmById(data.viajes, 'conductor_id')
  const leadingDrivers = [...data.conductores]
    .map((driver) => ({ ...driver, kilometers: driverTotals[driver.id] || 0 }))
    .sort((first, second) => second.kilometers - first.kilometers)
    .slice(0, 4)
  const maxKilometers = Math.max(...leadingDrivers.map((driver) => driver.kilometers), 1)

  return (
    <>
      <PageHeading
        eyebrow="PANEL DE CONTROL"
        title="Resumen de operación"
        description="Una mirada rápida al estado de tu flota."
        action={<span className="date-chip"><Icon name="calendar" size={16} /> {formatDate(CURRENT_DATE, true)}</span>}
      />

      <section className="stats-grid" aria-label="Indicadores de operación">
        <StatCard label="Vehículos activos" value={data.vehiculos.length} detail="En tu flota" icon="truck" />
        <StatCard label="Conductores" value={data.conductores.length} detail="Registrados" icon="users" />
        <StatCard label="Viajes registrados" value={data.viajes.length} detail="Historial completo" icon="route" />
        <StatCard label="Kilómetros recorridos" value={`${formatNumber(totalKm)} km`} detail="Distancia acumulada" icon="arrow" accent />
      </section>

      <section className="overview-grid">
        <article className="panel recent-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">ACTIVIDAD</span><h2>Últimos viajes</h2></div>
            <button className="button button-outline button-small" onClick={() => onPageChange('viajes')}>Ver historial <span aria-hidden="true">→</span></button>
          </div>
          <TripTable trips={data.viajes} vehicles={data.vehiculos} drivers={data.conductores} compact />
        </article>

        <article className="panel ranking-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">RENDIMIENTO</span><h2>Km por conductor</h2></div>
            <button className="icon-button" aria-label="Ver conductores" onClick={() => onPageChange('conductores')}><Icon name="arrow" /></button>
          </div>
          {leadingDrivers.length === 0 ? (
            <EmptyState title="Sin recorridos todavía" description="Los kilómetros aparecerán al registrar viajes." />
          ) : (
            <div className="ranking-list">
              {leadingDrivers.map((driver, index) => (
                <div className="ranking-item" key={driver.id}>
                  <div className="ranking-person">
                    <span className={`avatar avatar-${index + 1}`}>{driver.nombre?.slice(0, 1)}{driver.apellido?.slice(0, 1)}</span>
                    <span><strong>{driverName(driver)}</strong><small>{index === 0 ? 'Mayor recorrido' : 'Conductor'}</small></span>
                    <b>{formatNumber(driver.kilometers)} <small>km</small></b>
                  </div>
                  <div className="progress-track"><span style={{ width: `${Math.max((driver.kilometers / maxKilometers) * 100, 4)}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="quick-actions">
        <div><span className="eyebrow">SEGUÍ AVANZANDO</span><h2>Accesos rápidos</h2></div>
        <div className="quick-action-list">
          <button onClick={() => onPageChange('vehiculos')}><span><Icon name="truck" /></span>Gestionar vehículos<Icon name="arrow" size={16} /></button>
          <button onClick={() => onPageChange('conductores')}><span><Icon name="users" /></span>Ver conductores<Icon name="arrow" size={16} /></button>
          <button onClick={() => onPageChange('viajes')}><span><Icon name="route" /></span>Registrar un viaje<Icon name="arrow" size={16} /></button>
        </div>
      </section>
    </>
  )
}

function VehicleTable({ vehicles, kilometers, tripCounts, onEdit, onDelete }) {
  if (vehicles.length === 0) {
    return <EmptyState title="Todavía no hay vehículos" description="Agregá el primer vehículo para empezar a organizar tu flota." />
  }

  return (
    <div className="table-scroll">
      <table>
        <thead><tr><th>VEHÍCULO</th><th>PATENTE</th><th>AÑO</th><th>CAPACIDAD</th><th>VIAJES</th><th className="cell-number">KILÓMETROS</th><th><span className="sr-only">Acciones</span></th></tr></thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id}>
              <td><div className="entity-cell"><span className="entity-icon"><Icon name="truck" /></span><span><strong>{vehicleName(vehicle)}</strong><small>Unidad #{String(vehicle.id).padStart(3, '0')}</small></span></div></td>
              <td><span className="plate-tag">{vehicle.patente}</span></td>
              <td>{vehicle.anio}</td>
              <td>{formatNumber(vehicle.capacidad_carga)} kg</td>
              <td>{tripCounts[vehicle.id] || 0}</td>
              <td className="cell-number"><strong>{formatNumber(kilometers[vehicle.id])} km</strong></td>
              <td><RowActions label={vehicleName(vehicle)} onEdit={() => onEdit(vehicle)} onDelete={() => onDelete(vehicle)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DriverTable({ drivers, kilometers, tripCounts, onEdit, onDelete }) {
  if (drivers.length === 0) {
    return <EmptyState title="Todavía no hay conductores" description="Sumá conductores para asignarlos a los viajes de tu flota." />
  }

  return (
    <div className="table-scroll">
      <table>
        <thead><tr><th>CONDUCTOR</th><th>DOCUMENTO</th><th>LICENCIA</th><th>VENCIMIENTO</th><th>VIAJES</th><th className="cell-number">KILÓMETROS</th><th><span className="sr-only">Acciones</span></th></tr></thead>
        <tbody>
          {drivers.map((driver) => {
            const expirationDate = driver.fecha_vencimiento_licencia
              ? parseArgentinaDate(`${String(driver.fecha_vencimiento_licencia).slice(0, 10)} 23:59:59`)
              : null
            const expired = expirationDate && expirationDate.getTime() < CURRENT_TIMESTAMP
            return (
              <tr key={driver.id}>
                <td><div className="entity-cell"><span className="avatar">{driver.nombre?.slice(0, 1)}{driver.apellido?.slice(0, 1)}</span><span><strong>{driverName(driver)}</strong><small>Conductor #{String(driver.id).padStart(3, '0')}</small></span></div></td>
                <td>{driver.numero_documento}</td>
                <td>{driver.numero_licencia}</td>
                <td><span className={`license-status ${expired ? 'license-expired' : ''}`}><i />{formatDate(driver.fecha_vencimiento_licencia)}</span></td>
                <td>{tripCounts[driver.id] || 0}</td>
                <td className="cell-number"><strong>{formatNumber(kilometers[driver.id])} km</strong></td>
                <td><RowActions label={driverName(driver)} onEdit={() => onEdit(driver)} onDelete={() => onDelete(driver)} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function RowActions({ label, onEdit, onDelete }) {
  return (
    <div className="row-actions">
      <button className="icon-button" aria-label={`Modificar ${label}`} title="Modificar" onClick={onEdit}><Icon name="edit" size={16} /></button>
      <button className="icon-button icon-button-danger" aria-label={`Eliminar ${label}`} title="Eliminar" onClick={onDelete}><Icon name="trash" size={16} /></button>
    </div>
  )
}

function ResourceForm({ type, initial, busy, onCancel, onSubmit }) {
  const isVehicle = type === 'vehiculos'
  const [validationError, setValidationError] = useState('')
  const [values, setValues] = useState(() => isVehicle
    ? {
        marca: initial?.marca || '',
        modelo: initial?.modelo || '',
        patente: initial?.patente || '',
        anio: initial?.anio || '',
        capacidad_carga: initial?.capacidad_carga || '',
      }
    : {
        nombre: initial?.nombre || '',
        apellido: initial?.apellido || '',
        numero_documento: initial?.numero_documento || '',
        numero_licencia: initial?.numero_licencia || '',
        fecha_alta_licencia: String(initial?.fecha_alta_licencia || '').slice(0, 10),
        fecha_vencimiento_licencia: String(initial?.fecha_vencimiento_licencia || '').slice(0, 10),
      })

  function update(event) {
    setValidationError('')
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function submit(event) {
    event.preventDefault()
    if (!isVehicle && values.fecha_vencimiento_licencia <= values.fecha_alta_licencia) {
      setValidationError('La fecha de vencimiento debe ser posterior al alta de la licencia.')
      return
    }

    const payload = isVehicle
      ? { ...values, anio: Number(values.anio), capacidad_carga: Number(values.capacidad_carga) }
      : values
    onSubmit(payload)
  }

  return (
    <form className="record-form" onSubmit={submit}>
      {validationError && <div className="notice notice-error" role="alert">{validationError}</div>}
      {isVehicle ? (
        <div className="form-grid">
          <label className="field"><span>Marca</span><input name="marca" value={values.marca} onChange={update} required maxLength={60} placeholder="Mercedes-Benz" /></label>
          <label className="field"><span>Modelo</span><input name="modelo" value={values.modelo} onChange={update} required maxLength={60} placeholder="Atego 1726" /></label>
          <label className="field"><span>Patente</span><input name="patente" value={values.patente} onChange={update} required maxLength={10} placeholder="AB 123 CD" /></label>
          <label className="field"><span>Año</span><input type="number" name="anio" value={values.anio} onChange={update} min="1950" max={CURRENT_YEAR + 1} required /></label>
          <label className="field field-span"><span>Capacidad de carga (kg)</span><input type="number" name="capacidad_carga" value={values.capacidad_carga} onChange={update} min="0.01" step="0.01" required placeholder="2500" /></label>
        </div>
      ) : (
        <div className="form-grid">
          <label className="field"><span>Nombre</span><input name="nombre" value={values.nombre} onChange={update} required maxLength={80} /></label>
          <label className="field"><span>Apellido</span><input name="apellido" value={values.apellido} onChange={update} required maxLength={80} /></label>
          <label className="field"><span>Número de documento</span><input name="numero_documento" value={values.numero_documento} onChange={update} required maxLength={15} /></label>
          <label className="field"><span>Número de licencia</span><input name="numero_licencia" value={values.numero_licencia} onChange={update} required maxLength={20} /></label>
          <label className="field"><span>Alta de licencia</span><input type="date" name="fecha_alta_licencia" value={values.fecha_alta_licencia} onChange={update} required /></label>
          <label className="field"><span>Vencimiento de licencia</span><input type="date" name="fecha_vencimiento_licencia" value={values.fecha_vencimiento_licencia} onChange={update} required /></label>
        </div>
      )}
      <div className="modal-actions">
        <button type="button" className="button button-outline" onClick={onCancel} disabled={busy}>Cancelar</button>
        <button type="submit" className="button button-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </form>
  )
}

function mysqlDateTime(value) {
  return value.length === 16 ? `${value.replace('T', ' ')}:00` : value.replace('T', ' ')
}

function TripForm({ vehicles, drivers, busy, onCancel, onSubmit }) {
  const [values, setValues] = useState(() => ({
    vehiculo_id: '',
    conductor_id: '',
    fecha_salida: '',
    fecha_llegada: '',
    origen: '',
    destino: '',
    kilometros: '',
    observaciones: '',
  }))
  const [dateError, setDateError] = useState('')

  function update(event) {
    setDateError('')
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function submit(event) {
    event.preventDefault()
    if (new Date(values.fecha_llegada) < new Date(values.fecha_salida)) {
      setDateError('La fecha de llegada debe ser igual o posterior a la fecha de salida.')
      return
    }

    onSubmit({
      ...values,
      vehiculo_id: Number(values.vehiculo_id),
      conductor_id: Number(values.conductor_id),
      fecha_salida: mysqlDateTime(values.fecha_salida),
      fecha_llegada: mysqlDateTime(values.fecha_llegada),
      kilometros: Number(values.kilometros),
      observaciones: values.observaciones.trim() || null,
    })
  }

  return (
    <form className="record-form" onSubmit={submit}>
      {vehicles.length === 0 || drivers.length === 0 ? (
        <div className="notice notice-error" role="alert">Primero registrá al menos un vehículo y un conductor.</div>
      ) : (
        <>
          {dateError && <div className="notice notice-error" role="alert">{dateError}</div>}
          <div className="form-grid">
            <label className="field"><span>Vehículo</span><select name="vehiculo_id" value={values.vehiculo_id} onChange={update} required><option value="">Seleccionar vehículo</option>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicleName(vehicle)} · {vehicle.patente}</option>)}</select></label>
            <label className="field"><span>Conductor</span><select name="conductor_id" value={values.conductor_id} onChange={update} required><option value="">Seleccionar conductor</option>{drivers.map((driver) => <option key={driver.id} value={driver.id}>{driverName(driver)}</option>)}</select></label>
            <label className="field"><span>Fecha y hora de salida</span><input type="datetime-local" name="fecha_salida" value={values.fecha_salida} onChange={update} max={values.fecha_llegada || undefined} required /></label>
            <label className="field"><span>Fecha y hora de llegada</span><input type="datetime-local" name="fecha_llegada" value={values.fecha_llegada} onChange={update} min={values.fecha_salida || undefined} required /></label>
            <label className="field"><span>Origen</span><input name="origen" value={values.origen} onChange={update} required maxLength={120} placeholder="Ciudad de origen" /></label>
            <label className="field"><span>Destino</span><input name="destino" value={values.destino} onChange={update} required maxLength={120} placeholder="Ciudad de destino" /></label>
            <label className="field"><span>Distancia (km)</span><input type="number" name="kilometros" value={values.kilometros} onChange={update} min="0.01" step="0.01" required placeholder="125.5" /></label>
            <label className="field field-span"><span>Observaciones <small>· opcional</small></span><textarea name="observaciones" value={values.observaciones} onChange={update} rows="3" /></label>
          </div>
          <div className="modal-actions">
            <button type="button" className="button button-outline" onClick={onCancel} disabled={busy}>Cancelar</button>
            <button type="submit" className="button button-primary" disabled={busy}>{busy ? 'Guardando…' : 'Registrar viaje'}</button>
          </div>
        </>
      )}
    </form>
  )
}

function Modal({ dialog, vehicles, drivers, busy, error, onCancel, onSubmit }) {
  const isDelete = dialog.action === 'delete'
  const isTrip = dialog.resource === 'viajes'
  const isVehicle = dialog.resource === 'vehiculos'
  const resourceLabel = isVehicle ? 'vehículo' : isTrip ? 'viaje' : 'conductor'

  function submitDelete(event) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) onCancel()
    }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading">
          <div><span className="eyebrow">{dialog.action === 'create' ? 'NUEVO REGISTRO' : dialog.action === 'update' ? 'ACTUALIZAR DATOS' : 'CONFIRMAR ACCIÓN'}</span><h2 id="modal-title">{isDelete ? `Eliminar ${resourceLabel}` : dialog.action === 'create' ? (isTrip ? 'Registrar viaje' : `Agregar ${resourceLabel}`) : `Editar ${resourceLabel}`}</h2></div>
          <button className="icon-button" onClick={onCancel} aria-label="Cerrar" disabled={busy}><Icon name="close" /></button>
        </div>
        {error && <div className="notice notice-error" role="alert">{error}</div>}
        {isDelete ? (
          <form onSubmit={submitDelete}>
            <p className="delete-copy">¿Seguro que querés eliminar <strong>{dialog.label}</strong>? Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button type="button" className="button button-outline" onClick={onCancel} disabled={busy}>Cancelar</button>
              <button type="submit" className="button button-danger" disabled={busy}>{busy ? 'Eliminando…' : 'Sí, eliminar'}</button>
            </div>
          </form>
        ) : isTrip ? (
          <TripForm
            vehicles={vehicles}
            drivers={drivers}
            busy={busy}
            onCancel={onCancel}
            onSubmit={onSubmit}
          />
        ) : (
          <ResourceForm
            type={dialog.resource}
            initial={dialog.record}
            busy={busy}
            onCancel={onCancel}
            onSubmit={onSubmit}
          />
        )}
      </section>
    </div>
  )
}

function Workspace({ user, data, isLoading, loadError, activePage, onPageChange, onLogout, onMutation, onRetry }) {
  const [dialog, setDialog] = useState(null)
  const [dialogBusy, setDialogBusy] = useState(false)
  const [dialogError, setDialogError] = useState('')
  const [actionError, setActionError] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [vehicleFilter, setVehicleFilter] = useState('')
  const [driverFilter, setDriverFilter] = useState('')
  const [tripSearch, setTripSearch] = useState('')

  const vehicleKilometers = useMemo(() => kmById(data.viajes, 'vehiculo_id'), [data.viajes])
  const driverKilometers = useMemo(() => kmById(data.viajes, 'conductor_id'), [data.viajes])
  const vehicleTripCounts = useMemo(() => kmById(data.viajes.map((trip) => ({ ...trip, kilometros: 1 })), 'vehiculo_id'), [data.viajes])
  const driverTripCounts = useMemo(() => kmById(data.viajes.map((trip) => ({ ...trip, kilometros: 1 })), 'conductor_id'), [data.viajes])

  const filteredTrips = data.viajes.filter((trip) => {
    const matchesVehicle = !vehicleFilter || String(trip.vehiculo_id) === vehicleFilter
    const matchesDriver = !driverFilter || String(trip.conductor_id) === driverFilter
    const query = tripSearch.trim().toLocaleLowerCase('es-AR')
    const matchesSearch = !query || `${trip.origen || ''} ${trip.destino || ''}`.toLocaleLowerCase('es-AR').includes(query)
    return matchesVehicle && matchesDriver && matchesSearch
  })

  function openDialog(nextDialog) {
    setDialogError('')
    setActionError('')
    setDialog(nextDialog)
    setMobileMenuOpen(false)
  }

  async function submitDialog(values) {
    setDialogBusy(true)
    setDialogError('')
    try {
      await onMutation({
        action: dialog.action,
        resource: dialog.resource,
        id: dialog.record?.id,
        values,
      })
      setDialog(null)
    } catch (error) {
      setDialogError(error.message)
    } finally {
      setDialogBusy(false)
    }
  }

  async function deleteRecord({ resource, id }) {
    try {
      await onMutation({ action: 'delete', resource, id })
      setDialog(null)
    } catch (error) {
      setDialogError(error.message)
    } finally {
      setDialogBusy(false)
    }
  }

  function requestDelete(resource, record, label) {
    setDialogBusy(false)
    openDialog({ action: 'delete', resource, record, label })
  }

  const activeItem = pageItems.find((item) => item.id === activePage) || pageItems[0]

  return (
    <div className="app-shell">
      {mobileMenuOpen && <button className="sidebar-scrim" aria-label="Cerrar menú" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand"><a className="brand" href="#" aria-label="Ruta Norte, resumen"><span className="brand-mark"><svg viewBox="0 0 32 32" fill="none"><path d="M5 23.5 13.2 7h5.2L27 23.5h-6l-2-4.2h-6.2l-2 4.2H5Z" fill="currentColor" /><path d="m14.4 15.1-1.6 3.2h4.8L16 15.1" fill="#121D2C" /></svg></span><span className="brand-copy"><strong>ruta norte</strong><small>GESTIÓN DE TRANSPORTE</small></span></a><span className="sidebar-version">v1.0</span></div>
        <span className="sidebar-section-label">ESPACIO DE TRABAJO</span>
        <nav className="side-nav" aria-label="Navegación principal">
          {pageItems.map((item) => (
            <button
              key={item.id}
              className={`side-nav-link ${activePage === item.id ? 'side-nav-active' : ''}`}
              onClick={() => {
                onPageChange(item.id)
                setMobileMenuOpen(false)
              }}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.id === 'viajes' && <span className="nav-count">{data.viajes.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><span className="help-card-icon">✳</span><strong>Todo en ruta</strong><p>Tu operación, organizada en un solo lugar.</p></div>
          <button className="sidebar-user" onClick={onLogout} title="Cerrar sesión">
            <span className="avatar user-avatar">{user?.nombre?.slice(0, 1) || 'U'}</span>
            <span className="sidebar-user-copy"><strong>{user?.nombre || 'Mi cuenta'}</strong><small>Cerrar sesión</small></span>
            <Icon name="logout" size={17} />
          </button>
        </div>
      </aside>

      <main className="workspace-main">
        <header className="topbar">
          <button className="menu-toggle" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menú"><span /><span /><span /></button>
          <div className="breadcrumb"><span>Operaciones</span><b>/</b><strong>{activeItem.label}</strong></div>
          <div className="topbar-right"><span className="connection-indicator"><i /> Panel de flota</span><span className="topbar-avatar">{user?.nombre?.slice(0, 1) || 'U'}</span></div>
        </header>

        <div className="workspace-content">
          {loadError && (
            <div className="notice notice-error load-notice" role="alert">
              <span>{loadError}</span>
              <button className="button button-outline button-small" onClick={onRetry}><Icon name="refresh" size={15} /> Reintentar</button>
            </div>
          )}
          {actionError && <div className="notice notice-error load-notice" role="alert">{actionError}<button className="icon-button" aria-label="Cerrar aviso" onClick={() => setActionError('')}><Icon name="close" size={16} /></button></div>}

          {isLoading ? (
            <div className="loading-state"><span className="loading-spinner" /><strong>Cargando operación…</strong><p>Estamos buscando los datos de tu flota.</p></div>
          ) : (
            <>
              {activePage === 'overview' && <Overview data={data} onPageChange={onPageChange} />}
              {activePage === 'vehiculos' && (
                <>
                  <PageHeading
                    eyebrow="TU FLOTA"
                    title="Vehículos"
                    description="Administrá tus unidades y seguí sus recorridos."
                    action={<button className="button button-primary" onClick={() => openDialog({ action: 'create', resource: 'vehiculos' })}><Icon name="plus" size={17} /> Agregar vehículo</button>}
                  />
                  <section className="panel data-panel">
                    <div className="panel-heading"><div><span className="eyebrow">REGISTRO DE UNIDADES</span><h2>{data.vehiculos.length} {data.vehiculos.length === 1 ? 'vehículo' : 'vehículos'}</h2></div><span className="panel-heading-note">Kilómetros acumulados por unidad</span></div>
                    <VehicleTable
                      vehicles={data.vehiculos}
                      kilometers={vehicleKilometers}
                      tripCounts={vehicleTripCounts}
                      onEdit={(record) => openDialog({ action: 'update', resource: 'vehiculos', record })}
                      onDelete={(record) => requestDelete('vehiculos', record, `${vehicleName(record)} (${record.patente})`)}
                    />
                  </section>
                </>
              )}
              {activePage === 'conductores' && (
                <>
                  <PageHeading
                    eyebrow="EQUIPO"
                    title="Conductores"
                    description="Mantené los datos de tu equipo y sus licencias al día."
                    action={<button className="button button-primary" onClick={() => openDialog({ action: 'create', resource: 'conductores' })}><Icon name="plus" size={17} /> Agregar conductor</button>}
                  />
                  <section className="panel data-panel">
                    <div className="panel-heading"><div><span className="eyebrow">PERSONAL REGISTRADO</span><h2>{data.conductores.length} {data.conductores.length === 1 ? 'conductor' : 'conductores'}</h2></div><span className="panel-heading-note">Incluye vencimiento de licencias</span></div>
                    <DriverTable
                      drivers={data.conductores}
                      kilometers={driverKilometers}
                      tripCounts={driverTripCounts}
                      onEdit={(record) => openDialog({ action: 'update', resource: 'conductores', record })}
                      onDelete={(record) => requestDelete('conductores', record, driverName(record))}
                    />
                  </section>
                </>
              )}
              {activePage === 'viajes' && (
                <>
                  <PageHeading
                    eyebrow="RECORRIDOS"
                    title="Historial de viajes"
                    description="Registrá viajes y consultá distancias por vehículo o conductor."
                    action={<button className="button button-primary" onClick={() => openDialog({ action: 'create', resource: 'viajes' })}><Icon name="plus" size={17} /> Registrar viaje</button>}
                  />
                  <section className="panel trip-history-panel">
                    <div className="filters-row">
                      <label className="search-field"><Icon name="search" size={17} /><input value={tripSearch} onChange={(event) => setTripSearch(event.target.value)} placeholder="Buscar origen o destino" aria-label="Buscar origen o destino" /></label>
                      <label className="filter-field"><span>Vehículo</span><select value={vehicleFilter} onChange={(event) => setVehicleFilter(event.target.value)}><option value="">Todos</option>{data.vehiculos.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicleName(vehicle)} · {vehicle.patente}</option>)}</select></label>
                      <label className="filter-field"><span>Conductor</span><select value={driverFilter} onChange={(event) => setDriverFilter(event.target.value)}><option value="">Todos</option>{data.conductores.map((driver) => <option key={driver.id} value={driver.id}>{driverName(driver)}</option>)}</select></label>
                    </div>
                    <div className="history-summary"><span><strong>{filteredTrips.length}</strong> {filteredTrips.length === 1 ? 'viaje' : 'viajes'}</span><span><strong>{formatNumber(filteredTrips.reduce((sum, trip) => sum + Number(trip.kilometros || 0), 0))} km</strong> en el filtro actual</span></div>
                    <TripTable trips={filteredTrips} vehicles={data.vehiculos} drivers={data.conductores} />
                  </section>
                </>
              )}
            </>
          )}
          <footer className="workspace-footer"><span>RUTA NORTE <i>·</i> GESTIÓN DE TRANSPORTE</span><span>Un recorrido a la vez.</span></footer>
        </div>
      </main>

      {dialog && (
        <Modal
          dialog={dialog}
          vehicles={data.vehiculos}
          drivers={data.conductores}
          busy={dialogBusy}
          error={dialogError}
          onCancel={() => {
            if (!dialogBusy) setDialog(null)
          }}
          onSubmit={(values) => {
            if (dialog.action === 'delete') {
              setDialogBusy(true)
              deleteRecord({ resource: dialog.resource, id: dialog.record.id })
            } else {
              submitDialog(values)
            }
          }}
        />
      )}
    </div>
  )
}

export default Workspace
