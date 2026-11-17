// models/index.js
// Definición de Modelos (OpenAPI 3.0 Schemas) para la API del Refugio Los Pikilines (3FN)

const schemas = {
    // =========================================================================
    // 1. CATÁLOGOS Y ENTIDADES BASE (3FN)
    // =========================================================================
    CatalogoEspecie: {
        type: 'object',
        description: 'Registro del catálogo de especies del refugio (Tabla: especies).',
        required: ['id_especie', 'nombre'],
        properties: {
            id_especie: {
                type: 'integer',
                description: 'Identificador único de la especie (PK).',
                example: 1
            },
            nombre: {
                type: 'string',
                enum: ['Perro', 'Gato'],
                description: 'Nombre de la especie.',
                example: 'Perro'
            }
        }
    },

    EtapaEdad: {
        type: 'object',
        description: 'Catálogo de etapas de vida del animal (Tabla: etapas_edad).',
        required: ['id_etapa', 'nombre', 'orden'],
        properties: {
            id_etapa: {
                type: 'integer',
                description: 'Identificador único de la etapa de edad (PK).',
                example: 3
            },
            nombre: {
                type: 'string',
                enum: ['Cachorro', 'Joven', 'Adulto', 'Senior'],
                description: 'Nombre de la etapa de edad.',
                example: 'Adulto'
            },
            orden: {
                type: 'integer',
                description: 'Orden cronológico de la etapa (1 = Cachorro ... 4 = Senior).',
                example: 3
            }
        }
    },

    Tamano: {
        type: 'object',
        description: 'Catálogo de tamaños físicos del animal (Tabla: tamanos).',
        required: ['id_tamano', 'nombre', 'orden'],
        properties: {
            id_tamano: {
                type: 'integer',
                description: 'Identificador único del tamaño (PK).',
                example: 2
            },
            nombre: {
                type: 'string',
                enum: ['Chico', 'Mediano', 'Grande'],
                description: 'Categoría de tamaño del animal.',
                example: 'Mediano'
            },
            orden: {
                type: 'integer',
                description: 'Orden de escala del tamaño (1 = Chico, 2 = Mediano, 3 = Grande).',
                example: 2
            }
        }
    },

    EstadoAnimal: {
        type: 'object',
        description: 'Catálogo de estados de adopción o situación clínica (Tabla: estados_animal).',
        required: ['id_estado', 'nombre'],
        properties: {
            id_estado: {
                type: 'integer',
                description: 'Identificador único del estado (PK).',
                example: 1
            },
            nombre: {
                type: 'string',
                enum: ['Disponible', 'En tratamiento', 'Hogar temporal', 'Adoptado'],
                description: 'Nombre del estado actual del animal.',
                example: 'Disponible'
            }
        }
    },

    Sector: {
        type: 'object',
        description: 'Catálogo de sectores físicos dentro del refugio (Tabla: sectores).',
        required: ['id_sector', 'nombre'],
        properties: {
            id_sector: {
                type: 'integer',
                description: 'Identificador único del sector (PK).',
                example: 1
            },
            nombre: {
                type: 'string',
                enum: ['Patio Principal', 'Sala Max', 'Jaula de cachorros', 'Catio'],
                description: 'Nombre del sector del refugio.',
                example: 'Patio Principal'
            },
            descripcion: {
                type: 'string',
                nullable: true,
                description: 'Descripción funcional del sector.',
                example: 'Sector general de caniles y patio de convivencia canina'
            }
        }
    },

    TipoInsumo: {
        type: 'object',
        description: 'Catálogo de categorías de insumos recibidos en donación (Tabla: tipos_insumo).',
        required: ['id_tipo_insumo', 'nombre', 'unidad_predeterminada'],
        properties: {
            id_tipo_insumo: {
                type: 'integer',
                description: 'Identificador único del tipo de insumo (PK).',
                example: 1
            },
            nombre: {
                type: 'string',
                enum: [
                    'Alimento Perro',
                    'Alimento Gato',
                    'Piedritas Sanitarias',
                    'Medicamentos',
                    'Limpieza',
                    'Mantas/Accesorios',
                    'Otro'
                ],
                description: 'Nombre de la categoría de insumo.',
                example: 'Alimento Perro'
            },
            unidad_predeterminada: {
                type: 'string',
                description: 'Unidad de medida predeterminada para este tipo de insumo.',
                example: 'kg'
            }
        }
    },

    Donante: {
        type: 'object',
        description: 'Catálogo de personas, empresas o grupos solidarios donantes (Tabla: donantes).',
        required: ['id_donante', 'nombre_grupo'],
        properties: {
            id_donante: {
                type: 'integer',
                description: 'Identificador único del donante (PK).',
                example: 8
            },
            nombre_grupo: {
                type: 'string',
                description: 'Nombre del grupo solidario, institución o donante particular.',
                example: 'Visita Universitaria - Proyecto Base de Datos'
            }
        }
    },

    InfoRefugioItem: {
        type: 'object',
        description: 'Par clave-valor de la ficha institucional del refugio (Tabla: info_refugio).',
        required: ['id_info', 'clave', 'valor'],
        properties: {
            id_info: {
                type: 'integer',
                description: 'Identificador único del registro informativo (PK).',
                example: 1
            },
            clave: {
                type: 'string',
                description: 'Nombre del atributo o sección institucional.',
                example: 'Nombre del Refugio'
            },
            valor: {
                type: 'string',
                description: 'Detalle o contenido asociado a la clave.',
                example: 'Refugio Los Pikilines (Personería Jurídica N.º 16.539)'
            }
        }
    },

    FichaMedica: {
        type: 'object',
        nullable: true,
        description: 'Ficha médica y control sanitario del animal (Relación 1:1 en tabla ficha_medica).',
        required: ['id_ficha', 'esterilizado', 'desparasitado'],
        properties: {
            id_ficha: {
                type: 'integer',
                description: 'Identificador único de la ficha médica (PK).',
                example: 1
            },
            esterilizado: {
                type: 'string',
                enum: ['Sí', 'No', 'Pendiente'],
                description: 'Estado de castración / esterilización del animal.',
                example: 'Sí'
            },
            vacunas_al_dia: {
                type: 'string',
                nullable: true,
                enum: ['Sí', 'Parcial', 'No', null],
                description: 'Estado del esquema de vacunación.',
                example: 'Sí'
            },
            detalle_vacunas: {
                type: 'string',
                nullable: true,
                description: 'Detalle de las dosis y vacunas aplicadas (ej. Heptuple, Antirrábica, Triple Felina).',
                example: 'Heptuple y Antirrábica al día'
            },
            desparasitado: {
                type: 'string',
                enum: ['Sí', 'Pendiente', 'No'],
                description: 'Estado de desparasitación interna/externa.',
                example: 'Sí'
            },
            condiciones_especiales: {
                type: 'string',
                nullable: true,
                description: 'Observaciones clínicas, tratamientos activos o dietas especiales.',
                example: 'Seguimiento geriátrico y dieta blanda especial'
            }
        }
    },

    // =========================================================================
    // 2. MODELOS DE ANIMALES (/api/animales)
    // =========================================================================
    AnimalListado: {
        type: 'object',
        description: 'Vista consolidada de un animal con sus catálogos y resumen médico (JOIN 3FN).',
        required: [
            'id_animal',
            'especie',
            'sexo',
            'etapa_edad',
            'tamano',
            'sector',
            'estado_actual',
            'descripcion_fisica',
            'raza_color_senas'
        ],
        properties: {
            id_animal: {
                type: 'string',
                description: 'Código único del animal en el refugio (formato PK-XXX).',
                example: 'PK-001'
            },
            nombre: {
                type: 'string',
                nullable: true,
                description: 'Nombre propio del animal (puede ser null si aún no tiene nombre asignado).',
                example: null
            },
            especie: {
                type: 'string',
                enum: ['Perro', 'Gato'],
                description: 'Nombre de la especie.',
                example: 'Perro'
            },
            sexo: {
                type: 'string',
                enum: ['Macho', 'Hembra'],
                description: 'Sexo biológico del animal.',
                example: 'Macho'
            },
            etapa_edad: {
                type: 'string',
                enum: ['Cachorro', 'Joven', 'Adulto', 'Senior'],
                description: 'Etapa de edad actual.',
                example: 'Senior'
            },
            tamano: {
                type: 'string',
                enum: ['Chico', 'Mediano', 'Grande'],
                description: 'Tamaño físico del animal.',
                example: 'Grande'
            },
            sector: {
                type: 'string',
                enum: ['Patio Principal', 'Sala Max', 'Jaula de cachorros', 'Catio'],
                description: 'Sector del refugio donde se aloja.',
                example: 'Sala Max'
            },
            estado_actual: {
                type: 'string',
                enum: ['Disponible', 'En tratamiento', 'Hogar temporal', 'Adoptado'],
                description: 'Estado actual respecto a adopción o internación.',
                example: 'En tratamiento'
            },
            descripcion_fisica: {
                type: 'string',
                description: 'Descripción normalizada de raza, pelaje y señas particulares.',
                example: 'Mestizo, pelaje marrón claro con hocico canoso'
            },
            codigo_foto: {
                type: 'string',
                nullable: true,
                description: 'Código de la fotografía tomada en el relevamiento (ej. IMG_3121).',
                example: 'IMG_3121'
            },
            nota_ubicacion: {
                type: 'string',
                nullable: true,
                description: 'Nota adicional sobre su ubicación o camada.',
                example: null
            },
            raza_color_senas: {
                type: 'string',
                description: 'Texto original completo del relevamiento (incluyendo metadatos de sector/foto).',
                example: 'Mestizo, pelaje marrón claro con hocico canoso (Sala Max - IMG_3121)'
            },
            fecha_ingreso: {
                type: 'string',
                nullable: true,
                description: 'Fecha de ingreso al refugio en formato ISO (YYYY-MM-DD).',
                example: '2024-01-15'
            },
            temperamento_convivencia: {
                type: 'string',
                nullable: true,
                description: 'Comportamiento con humanos y otros animales del refugio.',
                example: 'Tranquilo y muy dócil'
            },
            esterilizado: {
                type: 'string',
                enum: ['Sí', 'No', 'Pendiente'],
                description: 'Indica si está esterilizado/castrado.',
                example: 'Sí'
            },
            vacunas_al_dia: {
                type: 'string',
                nullable: true,
                enum: ['Sí', 'Parcial', 'No', null],
                description: 'Estado del esquema de vacunación.',
                example: 'Sí'
            },
            detalle_vacunas: {
                type: 'string',
                nullable: true,
                description: 'Detalle de las vacunas aplicadas.',
                example: 'Heptuple y Antirrábica al día'
            },
            desparasitado: {
                type: 'string',
                enum: ['Sí', 'Pendiente', 'No'],
                description: 'Estado de desparasitación.',
                example: 'Sí'
            },
            condiciones_especiales: {
                type: 'string',
                nullable: true,
                description: 'Condiciones médicas especiales, medicación o dieta.',
                example: 'Seguimiento geriátrico y dieta blanda especial'
            }
        }
    },

    AnimalDetalle: {
        type: 'object',
        description: 'Detalle completo de un animal incluyendo claves foráneas de catálogos y su objeto ficha_medica anidado.',
        required: [
            'id_animal',
            'id_especie',
            'especie',
            'sexo',
            'id_etapa',
            'etapa_edad',
            'id_tamano',
            'tamano',
            'id_sector',
            'sector',
            'id_estado',
            'estado_actual',
            'descripcion_fisica',
            'raza_color_senas',
            'ficha_medica'
        ],
        properties: {
            id_animal: {
                type: 'string',
                description: 'Código único del animal en el refugio (PK).',
                example: 'PK-001'
            },
            nombre: {
                type: 'string',
                nullable: true,
                description: 'Nombre del animal.',
                example: null
            },
            id_especie: {
                type: 'integer',
                description: 'ID de la especie (FK -> especies.id_especie).',
                example: 1
            },
            especie: {
                type: 'string',
                enum: ['Perro', 'Gato'],
                description: 'Nombre de la especie.',
                example: 'Perro'
            },
            sexo: {
                type: 'string',
                enum: ['Macho', 'Hembra'],
                description: 'Sexo del animal.',
                example: 'Macho'
            },
            id_etapa: {
                type: 'integer',
                description: 'ID de la etapa de edad (FK -> etapas_edad.id_etapa).',
                example: 4
            },
            etapa_edad: {
                type: 'string',
                enum: ['Cachorro', 'Joven', 'Adulto', 'Senior'],
                description: 'Nombre de la etapa de edad.',
                example: 'Senior'
            },
            id_tamano: {
                type: 'integer',
                description: 'ID del tamaño (FK -> tamanos.id_tamano).',
                example: 3
            },
            tamano: {
                type: 'string',
                enum: ['Chico', 'Mediano', 'Grande'],
                description: 'Nombre del tamaño físico.',
                example: 'Grande'
            },
            id_sector: {
                type: 'integer',
                description: 'ID del sector (FK -> sectores.id_sector).',
                example: 2
            },
            sector: {
                type: 'string',
                enum: ['Patio Principal', 'Sala Max', 'Jaula de cachorros', 'Catio'],
                description: 'Nombre del sector donde habita.',
                example: 'Sala Max'
            },
            sector_descripcion: {
                type: 'string',
                nullable: true,
                description: 'Descripción del sector donde se aloja el animal.',
                example: 'Sector de internación clínica, geriátricos y cuidados intensivos'
            },
            id_estado: {
                type: 'integer',
                description: 'ID del estado actual (FK -> estados_animal.id_estado).',
                example: 2
            },
            estado_actual: {
                type: 'string',
                enum: ['Disponible', 'En tratamiento', 'Hogar temporal', 'Adoptado'],
                description: 'Nombre del estado actual del animal.',
                example: 'En tratamiento'
            },
            descripcion_fisica: {
                type: 'string',
                description: 'Descripción física limpia (raza, color, señas).',
                example: 'Mestizo, pelaje marrón claro con hocico canoso'
            },
            codigo_foto: {
                type: 'string',
                nullable: true,
                description: 'Código de fotografía del relevamiento.',
                example: 'IMG_3121'
            },
            nota_ubicacion: {
                type: 'string',
                nullable: true,
                description: 'Nota de ubicación específica o camada.',
                example: null
            },
            raza_color_senas: {
                type: 'string',
                description: 'Descripción original completa del relevamiento.',
                example: 'Mestizo, pelaje marrón claro con hocico canoso (Sala Max - IMG_3121)'
            },
            fecha_ingreso: {
                type: 'string',
                nullable: true,
                description: 'Fecha de ingreso al refugio (YYYY-MM-DD).',
                example: '2024-01-15'
            },
            temperamento_convivencia: {
                type: 'string',
                nullable: true,
                description: 'Carácter y convivencia del animal.',
                example: 'Tranquilo y muy dócil'
            },
            ficha_medica: {
                $ref: '#/components/schemas/FichaMedica'
            }
        }
    },

    // =========================================================================
    // 3. MODELOS DE DONACIONES (/api/donaciones)
    // =========================================================================
    Donacion: {
        type: 'object',
        description: 'Registro de donación o insumo recibido con su tipo de insumo y grupo donante (JOIN 3FN).',
        required: [
            'id_donacion',
            'fecha',
            'id_tipo_insumo',
            'tipo_insumo',
            'descripcion_producto',
            'cantidad',
            'unidad',
            'id_donante',
            'donante_grupo'
        ],
        properties: {
            id_donacion: {
                type: 'string',
                description: 'Código único de la donación (formato DON-XXX).',
                example: 'DON-008'
            },
            fecha: {
                type: 'string',
                description: 'Fecha de recepción de la donación (YYYY-MM-DD).',
                example: '2026-11-14'
            },
            id_tipo_insumo: {
                type: 'integer',
                description: 'ID del tipo de insumo (FK -> tipos_insumo.id_tipo_insumo).',
                example: 1
            },
            tipo_insumo: {
                type: 'string',
                description: 'Nombre de la categoría de insumo donado.',
                example: 'Alimento Perro'
            },
            descripcion_producto: {
                type: 'string',
                description: 'Detalle de los productos o insumos entregados.',
                example: 'Bolsas de alimento balanceado adulto y cachorro entregadas en visita universitaria'
            },
            cantidad: {
                type: 'number',
                description: 'Cantidad numérica recibida (> 0).',
                example: 45
            },
            unidad: {
                type: 'string',
                description: 'Unidad de medida de la donación (kg, unidades, bolsas, litros).',
                example: 'kg'
            },
            id_donante: {
                type: 'integer',
                description: 'ID del donante (FK -> donantes.id_donante).',
                example: 8
            },
            donante_grupo: {
                type: 'string',
                description: 'Nombre del donante, campaña o grupo solidario.',
                example: 'Visita Universitaria - Proyecto Base de Datos'
            },
            observaciones: {
                type: 'string',
                nullable: true,
                description: 'Observaciones adicionales o destino del insumo dentro del refugio.',
                example: 'Entrega presencial durante el relevamiento fotográfico del sábado'
            }
        }
    },

    // =========================================================================
    // 4. MODELOS DE RESUMEN Y ESTADÍSTICAS (/api/resumen)
    // =========================================================================
    ResumenKPIs: {
        type: 'object',
        description: 'Indicadores clave de rendimiento (KPIs) generales del refugio.',
        required: [
            'total_animales',
            'total_perros',
            'total_gatos',
            'disponibles_adopcion',
            'esterilizados_al_dia',
            'donaciones_registradas'
        ],
        properties: {
            total_animales: {
                type: 'integer',
                description: 'Total de animales censados en la base de datos.',
                example: 48
            },
            total_perros: {
                type: 'integer',
                description: 'Total de perros censados en la muestra.',
                example: 38
            },
            total_gatos: {
                type: 'integer',
                description: 'Total de gatos censados en la muestra.',
                example: 10
            },
            disponibles_adopcion: {
                type: 'integer',
                description: 'Cantidad de animales con estado "Disponible" para adopción.',
                example: 36
            },
            esterilizados_al_dia: {
                type: 'integer',
                description: 'Cantidad de animales con esterilización confirmada ("Sí").',
                example: 36
            },
            donaciones_registradas: {
                type: 'integer',
                description: 'Total de registros de donaciones cargados.',
                example: 12
            }
        }
    },

    ResumenEspecieSexo: {
        type: 'object',
        description: 'Estadística poblacional, ocupación y consumo alimenticio desglosado por especie y sexo.',
        required: [
            'id_especie',
            'especie',
            'macho',
            'hembra',
            'total_censado',
            'poblacion_total_refugio',
            'capacidad_maxima',
            'porcentaje_ocupacion_refugio',
            'consumo_semanal_kg',
            'consumo_mensual_kg',
            'promedio_diario_kg'
        ],
        properties: {
            id_especie: {
                type: 'integer',
                description: 'Identificador de la especie.',
                example: 1
            },
            especie: {
                type: 'string',
                enum: ['Perro', 'Gato'],
                description: 'Nombre de la especie.',
                example: 'Perro'
            },
            macho: {
                type: 'integer',
                description: 'Cantidad de machos censados de esta especie.',
                example: 20
            },
            hembra: {
                type: 'integer',
                description: 'Cantidad de hembras censadas de esta especie.',
                example: 18
            },
            total_censado: {
                type: 'integer',
                description: 'Total de animales censados individualmente en la tabla animales.',
                example: 38
            },
            poblacion_total_refugio: {
                type: 'integer',
                description: 'Población total real alojada en el refugio para esta especie.',
                example: 105
            },
            capacidad_maxima: {
                type: 'integer',
                description: 'Capacidad máxima instalada en el refugio para esta especie.',
                example: 120
            },
            porcentaje_ocupacion_refugio: {
                type: 'number',
                description: 'Porcentaje de ocupación real sobre la capacidad máxima.',
                example: 87.5
            },
            consumo_semanal_kg: {
                type: 'number',
                description: 'Consumo semanal estimado de alimento balanceado (en kg).',
                example: 210
            },
            consumo_mensual_kg: {
                type: 'number',
                description: 'Consumo mensual estimado de alimento balanceado (en kg).',
                example: 900
            },
            promedio_diario_kg: {
                type: 'number',
                description: 'Promedio diario de consumo de alimento (en kg/día).',
                example: 30
            }
        }
    },

    ResumenEtapa: {
        type: 'object',
        description: 'Distribución de animales por etapa de edad.',
        required: ['id_etapa', 'etapa', 'cantidad', 'porcentaje_total'],
        properties: {
            id_etapa: {
                type: 'integer',
                description: 'Identificador de la etapa de edad.',
                example: 3
            },
            etapa: {
                type: 'string',
                enum: ['Cachorro', 'Joven', 'Adulto', 'Senior'],
                description: 'Nombre de la etapa de edad.',
                example: 'Adulto'
            },
            cantidad: {
                type: 'integer',
                description: 'Cantidad de animales en esta etapa.',
                example: 22
            },
            porcentaje_total: {
                type: 'number',
                description: 'Porcentaje que representa sobre el total de animales censados.',
                example: 45.8
            }
        }
    },

    ResumenEstado: {
        type: 'object',
        description: 'Distribución de animales según su estado de adopción o internación.',
        required: ['id_estado', 'estado', 'cantidad', 'porcentaje_total'],
        properties: {
            id_estado: {
                type: 'integer',
                description: 'Identificador del estado.',
                example: 1
            },
            estado: {
                type: 'string',
                enum: ['Disponible', 'En tratamiento', 'Hogar temporal', 'Adoptado'],
                description: 'Nombre del estado.',
                example: 'Disponible'
            },
            cantidad: {
                type: 'integer',
                description: 'Cantidad de animales en este estado.',
                example: 36
            },
            porcentaje_total: {
                type: 'number',
                description: 'Porcentaje sobre el total de animales censados.',
                example: 75.0
            }
        }
    },

    ResumenSector: {
        type: 'object',
        description: 'Distribución de animales alojados en cada sector físico del refugio.',
        required: ['id_sector', 'sector', 'cantidad', 'porcentaje_total'],
        properties: {
            id_sector: {
                type: 'integer',
                description: 'Identificador del sector.',
                example: 1
            },
            sector: {
                type: 'string',
                description: 'Nombre del sector.',
                example: 'Patio Principal'
            },
            descripcion: {
                type: 'string',
                nullable: true,
                description: 'Descripción funcional del sector.',
                example: 'Sector general de caniles y patio de convivencia canina'
            },
            cantidad: {
                type: 'integer',
                description: 'Cantidad de animales censados en este sector.',
                example: 27
            },
            porcentaje_total: {
                type: 'number',
                description: 'Porcentaje sobre el total de animales censados.',
                example: 56.3
            }
        }
    },

    ResumenControlVeterinario: {
        type: 'object',
        description: 'Métrica comparativa de cobertura sanitaria (Esterilizado, Vacunación, Desparasitación).',
        required: ['control_veterinario', 'al_dia_si', 'pendiente_parcial_no', 'porcentaje_al_dia'],
        properties: {
            control_veterinario: {
                type: 'string',
                enum: ['Esterilizado', 'Vacunación', 'Desparasitación'],
                description: 'Tipo de control clínico evaluado.',
                example: 'Esterilizado'
            },
            al_dia_si: {
                type: 'integer',
                description: 'Cantidad de animales con el control completamente al día ("Sí").',
                example: 36
            },
            pendiente_parcial_no: {
                type: 'integer',
                description: 'Cantidad de animales con control pendiente, parcial o negativo.',
                example: 12
            },
            porcentaje_al_dia: {
                type: 'number',
                description: 'Porcentaje de animales con el control al día.',
                example: 75.0
            }
        }
    },

    ResumenInsumo: {
        type: 'object',
        description: 'Totalizador de donaciones recibidas agrupadas por tipo de insumo.',
        required: ['id_tipo_insumo', 'tipo_insumo', 'registros', 'total_cantidad', 'unidad'],
        properties: {
            id_tipo_insumo: {
                type: 'integer',
                description: 'Identificador del tipo de insumo.',
                example: 1
            },
            tipo_insumo: {
                type: 'string',
                description: 'Nombre de la categoría de insumo.',
                example: 'Alimento Perro'
            },
            registros: {
                type: 'integer',
                description: 'Cantidad de donaciones registradas para este insumo.',
                example: 3
            },
            total_cantidad: {
                type: 'number',
                description: 'Suma total de cantidades donadas en esta categoría.',
                example: 255
            },
            unidad: {
                type: 'string',
                description: 'Unidad de medida predeterminada del insumo.',
                example: 'kg'
            }
        }
    },

    ResumenDashboard: {
        type: 'object',
        description: 'Respuesta integral del dashboard con todos los bloques de agregación de Resumen_Consultas.',
        required: [
            'kpis',
            'porEspecieSexo',
            'porEtapa',
            'porEstado',
            'porSector',
            'controlVeterinario',
            'insumosRecibidos'
        ],
        properties: {
            kpis: {
                $ref: '#/components/schemas/ResumenKPIs'
            },
            porEspecieSexo: {
                type: 'array',
                description: 'Resumen poblacional y de consumo por especie y sexo.',
                items: {
                    $ref: '#/components/schemas/ResumenEspecieSexo'
                }
            },
            porEtapa: {
                type: 'array',
                description: 'Distribución por etapas de edad.',
                items: {
                    $ref: '#/components/schemas/ResumenEtapa'
                }
            },
            porEstado: {
                type: 'array',
                description: 'Distribución por estado de adopción/tratamiento.',
                items: {
                    $ref: '#/components/schemas/ResumenEstado'
                }
            },
            porSector: {
                type: 'array',
                description: 'Distribución por sectores del refugio.',
                items: {
                    $ref: '#/components/schemas/ResumenSector'
                }
            },
            controlVeterinario: {
                type: 'array',
                description: 'Estado de cobertura sanitaria (esterilización, vacunas, desparasitación).',
                items: {
                    $ref: '#/components/schemas/ResumenControlVeterinario'
                }
            },
            insumosRecibidos: {
                type: 'array',
                description: 'Totales acumulados de donaciones por tipo de insumo.',
                items: {
                    $ref: '#/components/schemas/ResumenInsumo'
                }
            }
        }
    },

    // =========================================================================
    // 5. MODELOS DE INFORMACIÓN DEL REFUGIO Y CATÁLOGOS (/api/refugio)
    // =========================================================================
    DatosGeneralesRefugio: {
        type: 'object',
        description: 'Mapa clave-valor de acceso directo con la información institucional del refugio.',
        additionalProperties: {
            type: 'string'
        },
        example: {
            'Nombre del Refugio': 'Refugio Los Pikilines (Personería Jurídica N.º 16.539)',
            'Fundador / Iniciativa': 'Carlos Ruiz (Un Policía Rescata)',
            'Ubicación / Zona': 'Gran Asunción, Paraguay (En proyecto de traslado a zona menos poblada - Presupuesto Gs. 500.000.000)',
            'Contacto / Redes Sociales': '@refugiolospikilines / @un_policia_rescata | Adopciones: 0982-988-922 | Visitas: 0983-273-938 | Fundador: 0981-623-777'
        }
    },

    CapacidadConsumoEspecie: {
        type: 'object',
        description: 'Parámetros de capacidad instalada, población total y consumo de alimento por especie.',
        required: [
            'id_especie',
            'especie',
            'capacidad_maxima',
            'poblacion_total_refugio',
            'muestra_censada_bd',
            'consumo_semanal_kg',
            'consumo_mensual_kg',
            'promedio_diario_kg'
        ],
        properties: {
            id_especie: {
                type: 'integer',
                description: 'Identificador de la especie.',
                example: 1
            },
            especie: {
                type: 'string',
                enum: ['Perro', 'Gato'],
                description: 'Nombre de la especie.',
                example: 'Perro'
            },
            capacidad_maxima: {
                type: 'integer',
                description: 'Capacidad máxima del refugio para esta especie.',
                example: 120
            },
            poblacion_total_refugio: {
                type: 'integer',
                description: 'Población total real en el refugio.',
                example: 105
            },
            muestra_censada_bd: {
                type: 'integer',
                description: 'Cantidad de individuos relevados en la tabla animales.',
                example: 38
            },
            consumo_semanal_kg: {
                type: 'number',
                description: 'Kilogramos de alimento consumidos por semana.',
                example: 210.0
            },
            consumo_mensual_kg: {
                type: 'number',
                description: 'Kilogramos de alimento consumidos por mes.',
                example: 900.0
            },
            promedio_diario_kg: {
                type: 'number',
                description: 'Kilogramos de alimento consumidos en promedio por día.',
                example: 30.0
            },
            detalle_consumo: {
                type: 'string',
                nullable: true,
                description: 'Desglose del consumo diario por sector o categoría.',
                example: 'Alimento Perros (25 kg general + 5 kg cachorros/internados)'
            }
        }
    },

    RefugioInfoCompleta: {
        type: 'object',
        description: 'Información institucional completa del refugio y parámetros poblacionales/alimenticios.',
        required: ['datosGenerales', 'fichaInstitucional', 'capacidadYConsumo'],
        properties: {
            datosGenerales: {
                $ref: '#/components/schemas/DatosGeneralesRefugio'
            },
            fichaInstitucional: {
                type: 'array',
                description: 'Listado ordenado de registros de la tabla info_refugio.',
                items: {
                    $ref: '#/components/schemas/InfoRefugioItem'
                }
            },
            capacidadYConsumo: {
                type: 'array',
                description: 'Capacidad máxima, población y consumo de alimento por especie.',
                items: {
                    $ref: '#/components/schemas/CapacidadConsumoEspecie'
                }
            }
        }
    },

    RefugioCatalogos: {
        type: 'object',
        description: 'Conjunto de todos los catálogos normalizados (3FN) para poblar selectores y filtros en el frontend.',
        required: [
            'especies',
            'etapas',
            'tamanos',
            'estados',
            'sectores',
            'tiposInsumo',
            'donantes'
        ],
        properties: {
            especies: {
                type: 'array',
                items: { $ref: '#/components/schemas/CatalogoEspecie' }
            },
            etapas: {
                type: 'array',
                items: { $ref: '#/components/schemas/EtapaEdad' }
            },
            tamanos: {
                type: 'array',
                items: { $ref: '#/components/schemas/Tamano' }
            },
            estados: {
                type: 'array',
                items: { $ref: '#/components/schemas/EstadoAnimal' }
            },
            sectores: {
                type: 'array',
                items: { $ref: '#/components/schemas/Sector' }
            },
            tiposInsumo: {
                type: 'array',
                items: { $ref: '#/components/schemas/TipoInsumo' }
            },
            donantes: {
                type: 'array',
                items: { $ref: '#/components/schemas/Donante' }
            }
        }
    },

    // =========================================================================
    // 6. MODELOS DE ERROR (structs/errors.js)
    // =========================================================================
    ErrorNotFound: {
        type: 'object',
        description: 'Respuesta estándar cuando un recurso solicitado por ID no existe (HTTP 404).',
        required: [
            'errorCode',
            'errorMessage',
            'numericErrorCode',
            'originatingService',
            'intent'
        ],
        properties: {
            errorCode: {
                type: 'string',
                description: 'Código identificador del error.',
                example: 'errors.com.pikilines.common.not_found'
            },
            errorMessage: {
                type: 'string',
                description: 'Mensaje descriptivo legible para el usuario.',
                example: "Error: El recurso 'animal' (PK-999) no fue encontrado."
            },
            messageVars: {
                type: 'array',
                description: 'Variables interpoladas en el mensaje de error.',
                items: {
                    type: 'string'
                },
                example: ['animal', 'PK-999']
            },
            numericErrorCode: {
                type: 'integer',
                description: 'Código numérico interno del error.',
                example: 1004
            },
            originatingService: {
                type: 'string',
                description: 'Módulo o servicio que originó el error.',
                example: 'animales'
            },
            intent: {
                type: 'string',
                description: 'Entorno de ejecución.',
                example: 'prod'
            }
        }
    },

    ErrorServidor: {
        type: 'object',
        description: 'Respuesta de error interno del servidor (HTTP 500).',
        required: ['error'],
        properties: {
            error: {
                type: 'string',
                description: 'Descripción del error ocurrido en el servidor.',
                example: 'Error interno del servidor al procesar la consulta.'
            }
        }
    }
};

module.exports = {
    schemas
};
