-- =================================================================
-- SCRIPT PARA ELIMINAR TODOS LOS REGISTROS DE MOVIMIENTOS DEL DÍA
-- Base de Datos: PostgreSQL
-- Fecha: 2025-12-09
-- =================================================================

-- IMPORTANTE: Este script eliminará TODOS los registros de hoy
-- Asegúrate de hacer un backup antes de ejecutar

BEGIN TRANSACTION;

-- 1. Eliminar registros de Ingresos del día de hoy
DELETE FROM ingresos 
WHERE DATE(fecha) = CURRENT_DATE;

-- 2. Eliminar registros de Egresos del día de hoy
DELETE FROM egresos 
WHERE DATE(fecha) = CURRENT_DATE;

-- 3. Eliminar registros de Pacientes del día de hoy
-- (Si deseas mantener algunos, comenta esta línea)
DELETE FROM paciente 
WHERE DATE(fecha_ingreso) = CURRENT_DATE;

-- 4. Mostrar resumen de eliminaciones
-- NOTA: Estos SELECT se ejecutan después del DELETE para confirmar
SELECT 'Registros eliminados exitosamente' AS mensaje;

-- Descomenta la siguiente línea si deseas hacer ROLLBACK en lugar de COMMIT
-- ROLLBACK;

-- Confirmar los cambios
COMMIT;

-- =================================================================
-- ALTERNATIVA: Si necesitas ser más específico y mantener algunos registros
-- =================================================================
/*

-- Opción 1: Eliminar SOLO ingresos y egresos (mantener pacientes)
BEGIN TRANSACTION;

DELETE FROM ingresos WHERE DATE(fecha) = CURRENT_DATE;
DELETE FROM egresos WHERE DATE(fecha) = CURRENT_DATE;

COMMIT;

-- Opción 2: Eliminar TODO EXCEPTO apertura de caja
BEGIN TRANSACTION;

DELETE FROM ingresos 
WHERE DATE(fecha) = CURRENT_DATE 
AND tipo != 'CAJA_CHICA';

DELETE FROM egresos 
WHERE DATE(fecha) = CURRENT_DATE;

DELETE FROM paciente 
WHERE DATE(fecha_ingreso) = CURRENT_DATE;

COMMIT;

-- Opción 3: Eliminar TODO EXCEPTO cierres de caja
BEGIN TRANSACTION;

DELETE FROM ingresos 
WHERE DATE(fecha) = CURRENT_DATE 
AND tipo != 'CIERRE_CAJA';

DELETE FROM egresos 
WHERE DATE(fecha) = CURRENT_DATE;

DELETE FROM paciente 
WHERE DATE(fecha_ingreso) = CURRENT_DATE;

COMMIT;

*/

-- =================================================================
-- SCRIPT DE VERIFICACIÓN (Ejecuta DESPUÉS de las eliminaciones)
-- =================================================================

-- Verificar registros restantes de hoy
SELECT COUNT(*) as total_ingresos_hoy FROM ingresos WHERE DATE(fecha) = CURRENT_DATE;
SELECT COUNT(*) as total_egresos_hoy FROM egresos WHERE DATE(fecha) = CURRENT_DATE;
SELECT COUNT(*) as total_pacientes_hoy FROM paciente WHERE DATE(fecha_ingreso) = CURRENT_DATE;

-- Ver últimos registros (para confirmar que se eliminaron)
SELECT * FROM ingresos WHERE DATE(fecha) = CURRENT_DATE ORDER BY fecha DESC LIMIT 5;
SELECT * FROM egresos WHERE DATE(fecha) = CURRENT_DATE ORDER BY fecha DESC LIMIT 5;
SELECT * FROM paciente WHERE DATE(fecha_ingreso) = CURRENT_DATE ORDER BY fecha_ingreso DESC LIMIT 5;
