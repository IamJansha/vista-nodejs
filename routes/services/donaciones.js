// routes/services/donaciones.js
const express = require('express');
const router = express.Router();
const db = require('../../db');
const errors = require('../../structs/errors');
const logs = require('../../structs/logs');

// --- RUTA GET /api/donaciones ---
// Consulta nativa con JOINs sobre donaciones, tipos_insumo y donantes
router.get('/', async (req, res) => {
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
