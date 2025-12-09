========================================================================
PLAN PARA LIMPIAR TABLAS DUPLICADAS Y EVITAR QUE SE RECREEN
========================================================================

PROBLEMA IDENTIFICADO:
- Tablas duplicadas: income, expense, patient_entry
- ddl-auto=update en application.properties (recreaba tablas automáticamente)

SOLUCIÓN IMPLEMENTADA:
========================================================================

PASO 1: ✅ CAMBIAR CONFIGURACIÓN HIBERNTE
Archivo: src/main/resources/application.properties
Cambio: spring.jpa.hibernate.ddl-auto=update → validate

Esto evita que Hibernate recree tablas automáticamente.

PASO 2: LIMPIAR TABLAS DUPLICADAS (ejecutar en PostgreSQL)
Archivo: cleanup_duplicate_tables.sql

SQL:
  DROP TABLE IF EXISTS income CASCADE;
  DROP TABLE IF EXISTS expense CASCADE;
  DROP TABLE IF EXISTS patient_entry CASCADE;

PASO 3: REINICIAR LA APLICACIÓN
Con validate, solo validará que el schema coincida con las entidades.
No recreará ni modificará tablas.

PASO 4: VERIFICAR (Opcional)
Ejecutar en pgAdmin:
  SELECT * FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  ORDER BY table_name;

Debe mostrar SOLO estas tablas:
  - cliente
  - detalle_factura
  - egresos (NO expense)
  - factura
  - ingresos (NO income)
  - pacientes (NO patient_entry)
  - usuarios

========================================================================
CAMBIOS REALIZADOS:
========================================================================

✅ 1. application.properties
   - ddl-auto cambiado de "update" a "validate"

✅ 2. cleanup_duplicate_tables.sql
   - Script para eliminar tablas no usadas

✅ 3. delete_today_movements_simple.sql
   - Actualizado con nombres de tablas correctas

========================================================================
PRÓXIMOS PASOS:
========================================================================

1. Ejecutar: cleanup_duplicate_tables.sql en PostgreSQL
2. Cambiar application.properties (YA HECHO)
3. Reiniciar la aplicación
4. Verificar que no haya errores de validación

Si tienes dudas o si necesitas volver a ddl-auto=update 
para agregar nuevas entidades, avísame.
