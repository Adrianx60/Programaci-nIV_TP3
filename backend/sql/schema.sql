CREATE DATABASE IF NOT EXISTS transporte_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE transporte_db;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vehiculos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  marca VARCHAR(60) NOT NULL,
  modelo VARCHAR(60) NOT NULL,
  patente VARCHAR(10) NOT NULL UNIQUE,
  anio SMALLINT UNSIGNED NOT NULL,
  capacidad_carga DECIMAL(10,2) NOT NULL,
  CONSTRAINT chk_vehiculo_anio CHECK (anio >= 1950),
  CONSTRAINT chk_vehiculo_capacidad CHECK (capacidad_carga > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS conductores (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(80) NOT NULL,
  numero_documento VARCHAR(15) NOT NULL UNIQUE,
  numero_licencia VARCHAR(20) NOT NULL UNIQUE,
  fecha_alta_licencia DATE NOT NULL,
  fecha_vencimiento_licencia DATE NOT NULL,
  CONSTRAINT chk_licencia_fechas CHECK (fecha_vencimiento_licencia > fecha_alta_licencia)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS viajes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vehiculo_id INT UNSIGNED NOT NULL,
    conductor_id INT UNSIGNED NOT NULL,
    fecha_salida DATETIME NOT NULL,
    fecha_llegada DATETIME NOT NULL,
    origen VARCHAR(120) NOT NULL,
    destino VARCHAR(120) NOT NULL,
    kilometros DECIMAL(10,2) NOT NULL,
    observaciones TEXT NULL,
    CONSTRAINT fk_viaje_vehiculo FOREIGN KEY (vehiculo_id)
        REFERENCES vehiculos(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_viaje_conductor FOREIGN KEY (conductor_id)
        REFERENCES conductores(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_viaje_km CHECK (kilometros > 0),
    CONSTRAINT chk_viaje_fechas CHECK (fecha_llegada >= fecha_salida)
) ENGINE=InnoDB;