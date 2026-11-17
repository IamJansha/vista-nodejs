# Refugio Los Pikilines — API & Dashboard (`vista-nodejs`)

Aplicación web de consulta (API REST + Dashboard minimalista) conectada a la base de datos SQLite en **3FN** del Refugio Los Pikilines.

## Requisitos Previos

- **Node.js** `v22.5+` (incluye el módulo nativo `node:sqlite` sin necesidad de compilar dependencias externas).
- Base de datos generada previamente en `../generar-db/refugio_pikilines.db` (ejecutando `python3 ../generar-db/generar_db.py`).

## Instalación y Uso

1. **Instalar dependencias:**
   ```bash
   cd vista-nodejs
   npm install
   ```

2. **Variables de entorno (`.env`):**
   ```env
   PORT=3000
   DB_PATH=../generar-db/refugio_pikilines.db
   ```

3. **Iniciar el servidor:**
   ```bash
   npm start
   ```
   *(Al iniciar, `swagger-autogen` escanea automáticamente todas las rutas y actualiza la documentación OpenAPI).*

4. **Accesos en el navegador:**
   - **Dashboard de Consulta**: `http://localhost:3000/` (o `http://localhost:3000/dashboard`)
   - **Documentación Interactiva (Swagger UI)**: `http://localhost:3000/api-docs`
   - **Índice JSON de Endpoints**: `http://localhost:3000/api`

## Estructura Rápida

```text
vista-nodejs/
├── index.js                 # Punto de entrada del servidor Express
├── config/
│   ├── swagger.js           # Autogenerador de especificación OpenAPI (swagger-autogen)
│   └── swagger-output.json  # Especificación generada automáticamente
├── db/
│   └── index.js             # Conexión nativa a SQLite (node:sqlite en modo readOnly)
├── routes/
│   ├── index.js             # Enrutador principal (API, Swagger y archivos estáticos)
│   └── services/            # Controladores con Native SQL Queries (JOIN, GROUP BY)
│       ├── resumen.js
│       ├── animales.js
│       ├── donaciones.js
│       └── refugio.js
├── structs/                 # Utilidades de formato de errores y logs en consola
├── public/static/dashboard/ # Frontend modular en ES6 (HTML, CSS y JS por partes)
└── documentos/              # Documentación detallada de arquitectura y funcionamiento
```

## Documentación Detallada

En la carpeta [`documentos/`](./documentos) encontrarás la explicación completa del sistema:

- [Arquitectura General del Sistema](./documentos/arquitectura.md)
- [Funcionamiento de la API y Consultas SQL Nativas](./documentos/funcionamiento-api-y-sql.md)
- [Funcionamiento del Dashboard Modular](./documentos/funcionamiento-dashboard.md)
- [Historial de Cambios (`CHANGELOG.md`)](./CHANGELOG.md)
