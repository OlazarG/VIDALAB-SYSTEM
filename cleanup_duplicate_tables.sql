-- =================================================================
-- SCRIPT PARA ELIMINAR TABLAS DUPLICADAS/NO USADAS
-- Base de Datos: PostgreSQL - DB_VIDA_TEST
-- =================================================================
-- ADVERTENCIA: Este script eliminará tablas que parecen no estar en uso
-- Revisa primero que realmente no se usan antes de ejecutar

BEGIN TRANSACTION;

-- Mostrar información de las tablas antes de eliminar
SELECT 'Eliminando tablas duplicadas/no usadas...' AS paso;

-- 1. Eliminar tabla 'income' si existe (duplicada de 'ingresos')
DROP TABLE IF EXISTS income CASCADE;

-- 2. Eliminar tabla 'expense' si existe (duplicada de 'egresos')
DROP TABLE IF EXISTS expense CASCADE;

-- 3. Eliminar tabla 'patient_entry' si existe (duplicada de 'pacientes')
DROP TABLE IF EXISTS patient_entry CASCADE;

SELECT 'Tablas eliminadas exitosamente' AS resultado;

-- Confirmamos los cambios
COMMIT;

-- =================================================================
-- VERIFICACIÓN: Ejecuta esto después para confirmar
-- =================================================================

-- Ver las tablas que quedan en el esquema public
SELECT 
    table_name 
FROM 
    information_schema.tables 
WHERE 
    table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY 
    table_name;
