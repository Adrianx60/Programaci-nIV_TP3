import app from "./app.js";
import { testConnection } from "./config/db.js";

const PORT = process.env.PORT || 3000;

try {
  await testConnection();
  console.log("Conexión a MySQL correcta");
  app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
} catch (error) {
  console.error("No se pudo conectar a MySQL:", error.message);
  process.exit(1);
}