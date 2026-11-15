export function notFound(req, res) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  // JSON mal formado en el body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo de la solicitud no es un JSON válido" });
  }

  // Errores de MySQL conocidos
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "Ya existe un registro con esos datos únicos" });
  }
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({ error: "El registro referenciado no existe" });
  }
  if (err.code === "ER_ROW_IS_REFERENCED_2") {
    return res.status(409).json({ error: "No se puede eliminar: tiene registros asociados" });
  }

  // Errores controlados (400, 401, 403, 404...)
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
}