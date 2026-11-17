# Changelog

Todos los cambios notables de **`vista-nodejs`** (API y Dashboard del Refugio Los Pikilines) están documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.0] - 2026-11-17

### Added
- **Dashboard Web Minimalista por Partes (`public/static/dashboard/`)**:
  - Estructura base de la vista principal en `html/dashboard.html` servida en `/` y `/dashboard`.
  - Hoja de estilos `css/dashboard.css` con diseño plano, monocromático, sin animaciones ni sobrecarga visual.
  - Navegación lateral principal (`navigation.js`) dividida en 4 secciones:
    1. **Resúmenes Estadísticos**: Navegación por sub-pestañas para visualizar una sola tabla o bloque de indicadores a la vez (`Indicadores Generales`, `Por Estado Actual`, `Por Etapa de Edad`, `Por Especie y Sexo`, `Por Sector`, `Control Veterinario`, `Insumos Recibidos`).
    2. **Censo de Animales**: Tabla paginada de a 10 registros (`Anterior` / `Siguiente`) con buscador en tiempo real y selectores de filtro cargados dinámicamente desde los catálogos de la base de datos (`Especie`, `Sexo`, `Etapa`, `Sector`, `Estado`).
    3. **Donaciones e Insumos**: Vista tabular con filtros por búsqueda de texto, categoría de insumo y rango de fechas (`Desde` / `Hasta`).
    4. **Datos del Refugio**: Navegación por sub-pestañas separando `Datos Institucionales` y `Capacidad y Consumo de Alimento`.
  - Modal de detalle (`modal.js`) para consultar la ficha completa y el control veterinario (`ficha_medica`) de cada animal al seleccionar `"Ver ficha"`.
  - Arquitectura JavaScript modular en ES6:
    - `js/api.js`: Cliente HTTP centralizado (`apiFetch`, `fetchResumen`, `fetchAnimales`, `fetchAnimalDetails`, `fetchDonaciones`, `fetchRefugio`, `fetchCatalogos`).
    - `js/render.js`: Renderizado por partes de tablas, indicadores, controles de paginación y modal de ficha médica.
    - `js/dashboard-main.js`: Inicialización de vistas, estado de paginación, pestañas y eventos de filtrado.
    - `js/dom-utils.js`: Utilidades de escape seguro de HTML (`escapeHtml`) y selectores del contenedor principal.

- **API REST de Consulta con Express y SQLite Nativo**:
  - Servidor Express (`index.js`) y enrutador principal (`routes/index.js`).
  - Conexión de solo lectura a `../generar-db/refugio_pikilines.db` mediante `node:sqlite` (`db/index.js`) ejecutando consultas SQL nativas (`JOIN`, `GROUP BY`, `CASE WHEN`).
  - Endpoints de consulta en `routes/services/`:
    - `GET /api/resumen` (y sub-rutas `/kpis`, `/especies`, `/etapas`, `/estados`, `/sectores`, `/veterinario`, `/insumos`).
    - `GET /api/animales` (con filtros combinables por query string) y `GET /api/animales/:id`.
    - `GET /api/donaciones` (con filtros por tipo, donante, fechas y búsqueda) y `GET /api/donaciones/:id`.
    - `GET /api/refugio` y `GET /api/refugio/catalogos`.
  - Documentación interactiva **Swagger UI** en `/api-docs` autogenerada al iniciar el servidor con `swagger-autogen` (`config/swagger.js`).
