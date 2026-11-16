// routes/services/refugio.js
const express = require('express');
const router = express.Router();
const db = require('../../db');
const logs = require('../../structs/logs');

// --- RUTA GET /api/refugio ---
// Devuelve la información institucional del refugio y capacidad/consumo por especie
router.get('/', async (req, res) => {
    try {
        const infoResult = await db.query('SELECT id_info, clave, valor FROM info_refugio ORDER BY id_info ASC');

        const capacidadConsumoQuery = `
            SELECT
                e.id_especie,
                e.nombre AS especie,
                e.capacidad_maxima,
                e.poblacion_total_refugio,
                COUNT(a.id_animal) AS muestra_censada_bd,
                e.consumo_semanal_kg,
                e.consumo_mensual_kg,
                e.promedio_diario_kg,
                e.detalle_consumo
            FROM especies e
            LEFT JOIN animales a ON e.id_especie = a.id_especie
            GROUP BY e.id_especie, e.nombre, e.capacidad_maxima, e.poblacion_total_refugio,
                     e.consumo_semanal_kg, e.consumo_mensual_kg, e.promedio_diario_kg, e.detalle_consumo
            ORDER BY e.id_especie ASC
        `;
        const especiesResult = await db.query(capacidadConsumoQuery);

        // Objeto clave-valor adicional para acceso directo desde el frontend
        const datosGenerales = {};
        for (const row of infoResult.rows) {
            datosGenerales[row.clave] = row.valor;
        }

        res.json({
            datosGenerales,
            fichaInstitucional: infoResult.rows,
            capacidadYConsumo: especiesResult.rows
        });
    } catch (err) {
        logs.error(`Error al obtener datos del refugio: ${err.stack}`);
        res.status(500).json({ error: 'Error interno del servidor al obtener información del refugio.' });
    }
});

// --- RUTA GET /api/refugio/catalogos ---
// Devuelve todos los catálogos 3FN para poblar filtros (selects) en el frontend
router.get('/catalogos', async (req, res) => {
    try {
        const [
            especies,
            etapas,
            tamanos,
            estados,
            sectores,
            tiposInsumo,
            donantes
        ] = await Promise.all([
            db.query('SELECT id_especie, nombre FROM especies ORDER BY id_especie ASC'),
            db.query('SELECT id_etapa, nombre, orden FROM etapas_edad ORDER BY orden ASC'),
            db.query('SELECT id_tamano, nombre, orden FROM tamanos ORDER BY orden ASC'),
            db.query('SELECT id_estado, nombre FROM estados_animal ORDER BY id_estado ASC'),
            db.query('SELECT id_sector, nombre, descripcion FROM sectores ORDER BY id_sector ASC'),
            db.query('SELECT id_tipo_insumo, nombre, unidad_predeterminada FROM tipos_insumo ORDER BY id_tipo_insumo ASC'),
            db.query('SELECT id_donante, nombre_grupo FROM donantes ORDER BY id_donante ASC')
        ]);

        res.json({
            especies: especies.rows,
            etapas: etapas.rows,
            tamanos: tamanos.rows,
            estados: estados.rows,
            sectores: sectores.rows,
            tiposInsumo: tiposInsumo.rows,
            donantes: donantes.rows
        });
    } catch (err) {
        logs.error(`Error al obtener catálogos: ${err.stack}`);
        res.status(500).json({ error: 'Error interno del servidor al obtener los catálogos.' });
    }
});

module.exports = router;
