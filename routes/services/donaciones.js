// routes/services/donaciones.js
const express = require('express');
const router = express.Router();
const db = require('../../db');
const errors = require('../../structs/errors');
const logs = require('../../structs/logs');

// --- RUTA GET /api/donaciones ---
// Consulta nativa con JOINs sobre donaciones, tipos_insumo y donantes
router.get('/', async (req, res) => {
    /*
        #swagger.tags = ['Donaciones']
        #swagger.summary = 'Listar donaciones e insumos recibidos'
        #swagger.description = 'Consulta las donaciones registradas uniendo las tablas normalizadas donaciones, tipos_insumo y donantes. Permite filtrar por categoría de insumo, donante, rango de fechas o búsqueda libre.'
        #swagger.parameters['tipo'] = {
            in: 'query',
            description: 'Filtrar por nombre del tipo de insumo',
            required: false,
            schema: {
                '@enum': [
                    'Alimento Perro',
                    'Alimento Gato',
                    'Piedritas Sanitarias',
                    'Medicamentos',
                    'Limpieza',
                    'Mantas/Accesorios',
                    'Otro'
                ]
            }
        }
        #swagger.parameters['donante'] = {
            in: 'query',
            description: 'Filtrar por coincidencia parcial en el nombre del grupo o persona donante',
            required: false,
            schema: { type: 'string' }
        }
        #swagger.parameters['desde'] = {
            in: 'query',
            description: 'Fecha inicial en formato YYYY-MM-DD (inclusive)',
            required: false,
            '@schema': { type: 'string', example: '2026-09-01' }
        }
        #swagger.parameters['hasta'] = {
            in: 'query',
            description: 'Fecha final en formato YYYY-MM-DD (inclusive)',
            required: false,
            '@schema': { type: 'string', example: '2026-11-30' }
        }
        #swagger.parameters['search'] = {
            in: 'query',
            description: 'Búsqueda libre por código (DON-XXX), descripción del producto, donante u observaciones',
            required: false,
            schema: { type: 'string' }
        }
        #swagger.responses[200] = {
            description: 'Listado de donaciones obtenido exitosamente.',
            content: {
                'application/json': {
                    schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Donacion' }
                    }
                }
            }
        }
        #swagger.responses[500] = {
            description: 'Error interno del servidor al obtener donaciones.',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorServidor' }
                }
            }
        }
    */
    const { tipo, donante, desde, hasta, search } = req.query;

    try {
        const conditions = [];
        const queryParams = [];

        const baseQuery = `
            SELECT
                d.id_donacion,
                d.fecha,
                ti.id_tipo_insumo,
                ti.nombre AS tipo_insumo,
                d.descripcion_producto,
                d.cantidad,
                d.unidad,
                dn.id_donante,
                dn.nombre_grupo AS donante_grupo,
                d.observaciones
            FROM donaciones d
            INNER JOIN tipos_insumo ti ON d.id_tipo_insumo = ti.id_tipo_insumo
            INNER JOIN donantes dn ON d.id_donante = dn.id_donante
        `;

        if (tipo) {
            conditions.push('LOWER(ti.nombre) = LOWER(?)');
            queryParams.push(tipo);
        }
        if (donante) {
            conditions.push('LOWER(dn.nombre_grupo) LIKE LOWER(?)');
            queryParams.push(`%${donante.trim()}%`);
        }
        if (desde) {
            conditions.push('d.fecha >= ?');
            queryParams.push(desde);
        }
        if (hasta) {
            conditions.push('d.fecha <= ?');
            queryParams.push(hasta);
        }
        if (search) {
            conditions.push(`(
                LOWER(d.id_donacion) LIKE LOWER(?)
                OR LOWER(ti.nombre) LIKE LOWER(?)
                OR LOWER(d.descripcion_producto) LIKE LOWER(?)
                OR LOWER(dn.nombre_grupo) LIKE LOWER(?)
                OR LOWER(COALESCE(d.observaciones, '')) LIKE LOWER(?)
            )`);
            const pattern = `%${search.trim()}%`;
            queryParams.push(pattern, pattern, pattern, pattern, pattern);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const queryText = `${baseQuery} ${whereClause} ORDER BY d.fecha DESC, d.id_donacion ASC`;

        const result = await db.query(queryText, queryParams);
        res.json(result.rows);
    } catch (err) {
        logs.error(`Error al obtener donaciones: ${err.stack}`);
        res.status(500).json({ error: 'Error interno del servidor al obtener donaciones.' });
    }
});

// --- RUTA GET /api/donaciones/:id ---
router.get('/:id', async (req, res) => {
    /*
        #swagger.tags = ['Donaciones']
        #swagger.summary = 'Obtener detalle de una donación por ID'
        #swagger.description = 'Devuelve el registro completo de una donación específica identificada por su código (ej. DON-001).'
        #swagger.parameters['id'] = {
            in: 'path',
            description: 'Código único de la donación (ej. DON-001 a DON-012)',
            required: true,
            '@schema': { type: 'string', example: 'DON-008' }
        }
        #swagger.responses[200] = {
            description: 'Detalle de la donación.',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/Donacion' }
                }
            }
        }
        #swagger.responses[404] = {
            description: 'Donación no encontrada.',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorNotFound' }
                }
            }
        }
        #swagger.responses[500] = {
            description: 'Error interno del servidor al obtener la donación.',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorServidor' }
                }
            }
        }
    */
    const idDonacion = req.params.id.toUpperCase();

    try {
        const queryText = `
            SELECT
                d.id_donacion,
                d.fecha,
                ti.id_tipo_insumo,
                ti.nombre AS tipo_insumo,
                d.descripcion_producto,
                d.cantidad,
                d.unidad,
                dn.id_donante,
                dn.nombre_grupo AS donante_grupo,
                d.observaciones
            FROM donaciones d
            INNER JOIN tipos_insumo ti ON d.id_tipo_insumo = ti.id_tipo_insumo
            INNER JOIN donantes dn ON d.id_donante = dn.id_donante
            WHERE UPPER(d.id_donacion) = ?
        `;

        const donacion = await db.queryOne(queryText, [idDonacion]);
        if (!donacion) {
            return res.status(404).json(errors.notFound('donacion', idDonacion, 'donaciones'));
        }

        res.json(donacion);
    } catch (err) {
        logs.error(`Error al obtener donación ${idDonacion}: ${err.stack}`);
        res.status(500).json({ error: 'Error interno del servidor al obtener la donación.' });
    }
});

module.exports = router;
