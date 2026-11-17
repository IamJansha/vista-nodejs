// routes/services/animales.js
const express = require('express');
const router = express.Router();
const db = require('../../db');
const errors = require('../../structs/errors');
const logs = require('../../structs/logs');

// --- RUTA GET /api/animales ---
// Consulta nativa con JOINs sobre las tablas normalizadas (3FN) y filtros opcionales
router.get('/', async (req, res) => {
    /*
        #swagger.tags = ['Animales']
        #swagger.summary = 'Listar animales del refugio con filtros opcionales'
        #swagger.description = 'Ejecuta una consulta SQL nativa con JOIN sobre las tablas normalizadas (animales, especies, etapas_edad, tamanos, sectores, estados_animal y ficha_medica). Permite filtrar por catálogos o búsqueda libre.'
        #swagger.parameters['especie'] = {
            in: 'query',
            description: 'Filtrar por especie del animal',
            required: false,
            schema: { '@enum': ['Perro', 'Gato'] }
        }
        #swagger.parameters['sexo'] = {
            in: 'query',
            description: 'Filtrar por sexo biológico',
            required: false,
            schema: { '@enum': ['Macho', 'Hembra'] }
        }
        #swagger.parameters['etapa'] = {
            in: 'query',
            description: 'Filtrar por etapa de edad',
            required: false,
            schema: { '@enum': ['Cachorro', 'Joven', 'Adulto', 'Senior'] }
        }
        #swagger.parameters['tamano'] = {
            in: 'query',
            description: 'Filtrar por tamaño físico',
            required: false,
            schema: { '@enum': ['Chico', 'Mediano', 'Grande'] }
        }
        #swagger.parameters['sector'] = {
            in: 'query',
            description: 'Filtrar por sector del refugio',
            required: false,
            schema: { '@enum': ['Patio Principal', 'Sala Max', 'Jaula de cachorros', 'Catio'] }
        }
        #swagger.parameters['estado'] = {
            in: 'query',
            description: 'Filtrar por estado de adopción o internación',
            required: false,
            schema: { '@enum': ['Disponible', 'En tratamiento', 'Hogar temporal', 'Adoptado'] }
        }
        #swagger.parameters['esterilizado'] = {
            in: 'query',
            description: 'Filtrar por estado de esterilización en ficha médica',
            required: false,
            schema: { '@enum': ['Sí', 'No', 'Pendiente'] }
        }
        #swagger.parameters['vacunas'] = {
            in: 'query',
            description: 'Filtrar por estado de vacunación al día',
            required: false,
            schema: { '@enum': ['Sí', 'Parcial', 'No'] }
        }
        #swagger.parameters['desparasitado'] = {
            in: 'query',
            description: 'Filtrar por estado de desparasitación',
            required: false,
            schema: { '@enum': ['Sí', 'Pendiente', 'No'] }
        }
        #swagger.parameters['search'] = {
            in: 'query',
            description: 'Búsqueda de texto libre por código (PK-XXX), nombre, descripción física, temperamento o condiciones médicas',
            required: false,
            schema: { type: 'string' }
        }
        #swagger.responses[200] = {
            description: 'Listado de animales obtenido exitosamente.',
            content: {
                'application/json': {
                    schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/AnimalListado' }
                    }
                }
            }
        }
        #swagger.responses[500] = {
            description: 'Error interno del servidor al obtener animales.',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorServidor' }
                }
            }
        }
    */
    const {
        especie,
        sexo,
        etapa,
        tamano,
        sector,
        estado,
        esterilizado,
        vacunas,
        desparasitado,
        search
    } = req.query;

    try {
        const conditions = [];
        const queryParams = [];

        let baseQuery = `
            SELECT
                a.id_animal,
                a.nombre,
                e.nombre AS especie,
                a.sexo,
                et.nombre AS etapa_edad,
                t.nombre AS tamano,
                s.nombre AS sector,
                es.nombre AS estado_actual,
                a.descripcion_fisica,
                a.codigo_foto,
                a.nota_ubicacion,
                a.raza_color_senas_original AS raza_color_senas,
                a.fecha_ingreso,
                a.temperamento_convivencia,
                fm.esterilizado,
                fm.vacunas_al_dia,
                fm.detalle_vacunas,
                fm.desparasitado,
                fm.condiciones_especiales
            FROM animales a
            INNER JOIN especies e ON a.id_especie = e.id_especie
            INNER JOIN etapas_edad et ON a.id_etapa = et.id_etapa
            INNER JOIN tamanos t ON a.id_tamano = t.id_tamano
            INNER JOIN sectores s ON a.id_sector = s.id_sector
            INNER JOIN estados_animal es ON a.id_estado = es.id_estado
            LEFT JOIN ficha_medica fm ON a.id_animal = fm.id_animal
        `;

        if (especie) {
            conditions.push('LOWER(e.nombre) = LOWER(?)');
            queryParams.push(especie);
        }
        if (sexo) {
            conditions.push('LOWER(a.sexo) = LOWER(?)');
            queryParams.push(sexo);
        }
        if (etapa) {
            conditions.push('LOWER(et.nombre) = LOWER(?)');
            queryParams.push(etapa);
        }
        if (tamano) {
            conditions.push('LOWER(t.nombre) = LOWER(?)');
            queryParams.push(tamano);
        }
        if (sector) {
            conditions.push('LOWER(s.nombre) = LOWER(?)');
            queryParams.push(sector);
        }
        if (estado) {
            conditions.push('LOWER(es.nombre) = LOWER(?)');
            queryParams.push(estado);
        }
        if (esterilizado) {
            conditions.push('LOWER(fm.esterilizado) = LOWER(?)');
            queryParams.push(esterilizado);
        }
        if (vacunas) {
            conditions.push('LOWER(fm.vacunas_al_dia) = LOWER(?)');
            queryParams.push(vacunas);
        }
        if (desparasitado) {
            conditions.push('LOWER(fm.desparasitado) = LOWER(?)');
            queryParams.push(desparasitado);
        }
        if (search) {
            conditions.push(`(
                LOWER(a.id_animal) LIKE LOWER(?)
                OR LOWER(COALESCE(a.nombre, '')) LIKE LOWER(?)
                OR LOWER(a.descripcion_fisica) LIKE LOWER(?)
                OR LOWER(COALESCE(a.temperamento_convivencia, '')) LIKE LOWER(?)
                OR LOWER(COALESCE(fm.condiciones_especiales, '')) LIKE LOWER(?)
            )`);
            const pattern = `%${search.trim()}%`;
            queryParams.push(pattern, pattern, pattern, pattern, pattern);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const queryText = `${baseQuery} ${whereClause} ORDER BY a.id_animal ASC`;

        const result = await db.query(queryText, queryParams);
        res.json(result.rows);
    } catch (err) {
        logs.error(`Error al obtener animales: ${err.stack}`);
        res.status(500).json({ error: 'Error interno del servidor al obtener animales.' });
    }
});

// --- RUTA GET /api/animales/:id ---
// Obtiene el detalle completo de un animal y su ficha médica asociada
router.get('/:id', async (req, res) => {
    /*
        #swagger.tags = ['Animales']
        #swagger.summary = 'Obtener detalle de un animal por ID y su ficha médica'
        #swagger.description = 'Devuelve la información completa del animal identificado por su código (ej. PK-001), incluyendo los IDs de catálogos normalizados y su objeto ficha_medica asociado.'
        #swagger.parameters['id'] = {
            in: 'path',
            description: 'Código único del animal (ej. PK-001 a PK-048)',
            required: true,
            '@schema': { type: 'string', example: 'PK-001' }
        }
        #swagger.responses[200] = {
            description: 'Detalle del animal y su ficha médica.',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/AnimalDetalle' }
                }
            }
        }
        #swagger.responses[404] = {
            description: 'Animal no encontrado.',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorNotFound' }
                }
            }
        }
        #swagger.responses[500] = {
            description: 'Error interno del servidor al obtener el detalle del animal.',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorServidor' }
                }
            }
        }
    */
    const idAnimal = req.params.id.toUpperCase();

    try {
        const animalQuery = `
            SELECT
                a.id_animal,
                a.nombre,
                e.id_especie,
                e.nombre AS especie,
                a.sexo,
                et.id_etapa,
                et.nombre AS etapa_edad,
                t.id_tamano,
                t.nombre AS tamano,
                s.id_sector,
                s.nombre AS sector,
                s.descripcion AS sector_descripcion,
                es.id_estado,
                es.nombre AS estado_actual,
                a.descripcion_fisica,
                a.codigo_foto,
                a.nota_ubicacion,
                a.raza_color_senas_original AS raza_color_senas,
                a.fecha_ingreso,
                a.temperamento_convivencia
            FROM animales a
            INNER JOIN especies e ON a.id_especie = e.id_especie
            INNER JOIN etapas_edad et ON a.id_etapa = et.id_etapa
            INNER JOIN tamanos t ON a.id_tamano = t.id_tamano
            INNER JOIN sectores s ON a.id_sector = s.id_sector
            INNER JOIN estados_animal es ON a.id_estado = es.id_estado
            WHERE UPPER(a.id_animal) = ?
        `;

        const animal = await db.queryOne(animalQuery, [idAnimal]);
        if (!animal) {
            return res.status(404).json(errors.notFound('animal', idAnimal, 'animales'));
        }

        const fichaQuery = `
            SELECT
                id_ficha,
                esterilizado,
                vacunas_al_dia,
                detalle_vacunas,
                desparasitado,
                condiciones_especiales
            FROM ficha_medica
            WHERE id_animal = ?
        `;
        const fichaMedica = await db.queryOne(fichaQuery, [animal.id_animal]);

        res.json({
            ...animal,
            ficha_medica: fichaMedica
        });
    } catch (err) {
        logs.error(`Error al obtener animal ${idAnimal}: ${err.stack}`);
        res.status(500).json({ error: 'Error interno del servidor al obtener el detalle del animal.' });
    }
});

module.exports = router;
