-- Script simple para eliminar movimientos de hoy
-- Ejecutar en PostgreSQL
-- Base de datos: DB_VIDA_TEST
-- Tablas correctas (sin duplicadas)

-- Eliminar TODOS los movimientos del día actual
BEGIN;
  DELETE FROM ingresos WHERE DATE(fecha) = CURRENT_DATE;
  DELETE FROM egresos WHERE DATE(fecha) = CURRENT_DATE;
  DELETE FROM pacientes WHERE DATE(fecha_ingreso) = CURRENT_DATE;
COMMIT;
