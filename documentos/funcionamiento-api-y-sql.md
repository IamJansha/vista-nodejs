# Funcionamiento de la API y Consultas SQL Nativas

La API es de **acceso libre y solo lectura (`GET`)**. En lugar de utilizar un ORM que oculte las consultas, todos los servicios en `routes/services/` ejecutan **Native SQL Queries** parametrizadas contra las tablas normalizadas en **3FN** (`animales`, `ficha_medica`, `especies`, `etapas_edad`, `tamanos`, `sectores`, `estados_animal`, `donaciones`, `tipos_insumo`, `donantes`, `info_refugio`).

---

## 1. Servicio de Resúmenes (`routes/services/resumen.js`)

Resuelve las consultas analíticas y de agregación equivalentes a la hoja `Resumen_Consultas` del relevamiento original:

| Endpoint | Descripción | Técnica SQL empleada |
| :--- | :--- | :--- |
| `GET /api/resumen` | Devuelve todos los bloques estadísticos en una sola llamada JSON. | Ejecución concurrente (`Promise.all`) de las 7 consultas de agregación. |
| `GET /api/resumen/kpis` | Indicadores clave (total animales, perros, gatos, disponibles, esterilizados, donaciones). | Subconsultas escalares `SELECT (SELECT COUNT(*) ...)`. |
| `GET /api/resumen/especies` | Población por especie, desglose Macho/Hembra, capacidad máxima y consumo de alimento. | `LEFT JOIN`, `GROUP BY` y conteo condicional `SUM(CASE WHEN a.sexo = 'Macho' THEN 1 ELSE 0 END)`. |
| `GET /api/resumen/etapas` | Cantidad y porcentaje de animales por etapa (`Cachorro`, `Joven`, `Adulto`, `Senior`). | `LEFT JOIN`, `GROUP BY` y cálculo porcentual con `ROUND(... * 100.0 / NULLIF(..., 0), 1)`. |
| `GET /api/resumen/estados` | Cantidad y porcentaje por estado (`Disponible`, `En tratamiento`, `Hogar temporal`, `Adoptado`). | `LEFT JOIN` sobre `estados_animal` y `GROUP BY`. |
| `GET /api/resumen/sectores` | Distribución de animales por sector del refugio (`Patio Principal`, `Catio`, `Jaula de cachorros`, `Sala Max`). | `LEFT JOIN` sobre `sectores` ordenado por cantidad descendente. |
| `GET /api/resumen/veterinario` | Comparativa `Al Día (Sí)` vs `Pendiente/Parcial/No` para Esterilización, Vacunación y Desparasitación. | Triple consulta unificada con `UNION ALL` y agregaciones `SUM(CASE WHEN ...)`. |
| `GET /api/resumen/insumos` | Cantidad de entregas y suma total acumulada por cada tipo de insumo. | `LEFT JOIN` entre `tipos_insumo` y `donaciones` con `COUNT` y `COALESCE(SUM(d.cantidad), 0)`. |

---

## 2. Servicio de Animales (`routes/services/animales.js`)

### `GET /api/animales`
Reconstruye la información normalizada mediante `INNER JOIN` con los 5 catálogos (`especies`, `etapas_edad`, `tamanos`, `sectores`, `estados_animal`) y `LEFT JOIN` con `ficha_medica`.

Construye dinámicamente la cláusula `WHERE` de forma segura (con parámetros `?` para prevenir inyección SQL) según los filtros enviados en `req.query`:
- `especie` (ej. `Perro`, `Gato`)
- `sexo` (`Macho`, `Hembra`)
- `etapa` (`Cachorro`, `Joven`, `Adulto`, `Senior`)
- `tamano` (`Chico`, `Mediano`, `Grande`)
- `sector` (`Patio Principal`, `Sala Max`, `Jaula de cachorros`, `Catio`)
- `estado` (`Disponible`, `En tratamiento`, `Hogar temporal`, `Adoptado`)
- `esterilizado` (`Sí`, `No`, `Pendiente`)
- `vacunas` (`Sí`, `Parcial`)
- `desparasitado` (`Sí`, `Pendiente`)
- `search` (búsqueda parcial con `LIKE %...%` sobre código `PK-xxx`, nombre, descripción física, temperamento y condiciones especiales).

### `GET /api/animales/:id`
Recibe el código del animal (ej. `PK-001`), consulta primero los datos del animal junto con la descripción de su sector, y luego consulta su registro `1:1` en `ficha_medica`, devolviendo un objeto JSON con la propiedad `ficha_medica` anidada. Si el ID no existe, responde con HTTP `404` usando la estructura estándar de `structs/errors.js`.

---

## 3. Servicio de Donaciones (`routes/services/donaciones.js`)

### `GET /api/donaciones`
Une `donaciones` con `tipos_insumo` y `donantes` mediante `INNER JOIN`. Permite filtrar por:
- `tipo`: nombre del tipo de insumo.
- `donante`: coincidencia parcial en el nombre del grupo donante.
- `desde` y `hasta`: filtro por rango de fechas (`d.fecha >= ?` y `d.fecha <= ?`).
- `search`: búsqueda libre en código (`DON-xxx`), producto, donante u observaciones.

### `GET /api/donaciones/:id`
Devuelve el detalle de una donación específica (ej. `DON-001`) o HTTP `404` si no existe.

---

## 4. Servicio de Refugio y Catálogos (`routes/services/refugio.js`)

- `GET /api/refugio`: devuelve los pares clave-valor de `info_refugio` (nombre legal, fundador, contactos, equipo de trabajo, costos operativos mensuales y necesidades urgentes) junto con la tabla comparativa de capacidad máxima, población total y consumo de alimento por especie.
- `GET /api/refugio/catalogos`: devuelve en una sola respuesta todas las tablas de catálogo (`especies`, `etapas`, `tamanos`, `estados`, `sectores`, `tiposInsumo`, `donantes`) para que el frontend llene sus `<select>` sin hardcodear valores.
