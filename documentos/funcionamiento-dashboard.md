# Funcionamiento del Dashboard Modular

El frontend está ubicado en `public/static/dashboard/` y sigue un diseño **minimalista, monocromático y por partes**, evitando mostrar demasiada información simultáneamente en pantalla.

---

## 1. Organización de Archivos

```text
public/static/dashboard/
├── html/
│   └── dashboard.html      # Estructura base (barra lateral + 4 secciones + modal)
├── css/
│   └── dashboard.css       # Estilos en blanco, negro y escala de grises sin animaciones
└── js/
    ├── api.js              # Peticiones fetch hacia /api/*
    ├── dom-utils.js        # Escape de HTML (prevención XSS) y selectores base
    ├── navigation.js       # Cambio entre las 4 vistas principales de la barra lateral
    ├── modal.js            # Apertura y cierre del modal de ficha médica (clic, botón o tecla Esc)
    ├── render.js           # Generación de tablas HTML, indicadores y paginación
    └── dashboard-main.js   # Punto de entrada, estado de pestañas, filtros y paginación
```

---

## 2. Flujo de Inicialización (`dashboard-main.js`)

Al dispararse el evento `DOMContentLoaded`:

1. Se inicializa la barra lateral (`setupSidebarLogic()`), las sub-pestañas (`setupSubNavListeners()`) y los eventos de los formularios de filtro (`setupFilterListeners()`).
2. Se realizan en paralelo (`Promise.all`) las peticiones iniciales a la API mediante `api.js`:
   - `fetchCatalogos()` -> llena automáticamente los `<select>` de filtros con `populateCatalogs()`.
   - `fetchResumen()` -> guarda en memoria (`cachedResumen`) las métricas y renderiza únicamente la primera pestaña activa (`Indicadores Generales`).
   - `fetchAnimales()` -> guarda la lista en `cachedAnimales` y muestra la **Página 1** (primeros 10 animales).
   - `fetchDonaciones()` -> renderiza la tabla de donaciones.
   - `fetchRefugio()` -> guarda en `cachedRefugio` y muestra la primera pestaña (`Datos Institucionales`).

---

## 3. Recorrido de la Información por Partes

Para mantener la pantalla limpia y fácil de leer, el sistema utiliza tres mecanismos:

1. **Vistas Principales (Barra Lateral)**:
   - Permite alternar entre `1. Resúmenes`, `2. Animales`, `3. Donaciones` y `4. Datos del Refugio` ocultando las demás secciones.
2. **Sub-pestañas (`.sub-tab`) en Resúmenes y Refugio**:
   - En **Resúmenes**, cada botón (`Indicadores Generales`, `Por Estado Actual`, `Por Etapa de Edad`, `Por Especie y Sexo`, `Por Sector`, `Control Veterinario`, `Insumos Recibidos`) invoca `renderResumenPart(cachedResumen, partKey)`, reemplazando el contenedor por **una sola tabla a la vez**.
   - En **Datos del Refugio**, las sub-pestañas alternan entre `Datos Institucionales` y `Capacidad y Consumo de Alimento`.
3. **Paginación en Tabla de Animales (`PAGE_SIZE = 10`) y Modal bajo demanda**:
   - La tabla de animales muestra máximo **10 filas por página** con controles `Anterior` y `Siguiente`.
   - Los datos extensos de control veterinario (`ficha_medica`, vacunas detalladas, temperamento y condiciones especiales) no recargan la tabla principal: se consultan en vivo desde `GET /api/animales/:id` únicamente cuando el usuario hace clic en **`Ver ficha`**.
