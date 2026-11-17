// static/dashboard/js/render.js
import { escapeHtml } from '/static/dashboard/js/dom-utils.js';

/**
 * Rellena los <select> de filtros con los catálogos 3FN.
 */
export function populateCatalogs(catalogos) {
    if (!catalogos) return;

    const fillSelect = (selectId, items, labelKey = 'nombre') => {
        const el = document.getElementById(selectId);
        if (!el || !Array.isArray(items)) return;
        const firstOpt = el.querySelector('option');
        el.innerHTML = '';
        if (firstOpt) el.appendChild(firstOpt);

        items.forEach((item) => {
            const val = item[labelKey];
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = val;
            el.appendChild(opt);
        });
    };

    fillSelect('filter-animal-especie', catalogos.especies, 'nombre');
    fillSelect('filter-animal-etapa', catalogos.etapas, 'nombre');
    fillSelect('filter-animal-sector', catalogos.sectores, 'nombre');
    fillSelect('filter-animal-estado', catalogos.estados, 'nombre');
    fillSelect('filter-donacion-tipo', catalogos.tiposInsumo, 'nombre');
}

/**
 * Renderiza UNA sola parte del resumen a la vez según la pestaña activa.
 */
export function renderResumenPart(data, partKey) {
    const container = document.getElementById('resumen-part-container');
    if (!container || !data) return;

    if (partKey === 'kpis') {
        const k = data.kpis || {};
        const items = [
            { label: 'Total Animales Censados', value: k.total_animales },
            { label: 'Perros Registrados', value: k.total_perros },
            { label: 'Gatos Registrados (Catio)', value: k.total_gatos },
            { label: 'Disponibles para Adopción', value: k.disponibles_adopcion },
            { label: 'Esterilizados al Día', value: k.esterilizados_al_dia },
            { label: 'Donaciones Registradas', value: k.donaciones_registradas }
        ];

        container.innerHTML = `
            <div class="kpi-grid">
                ${items
                    .map(
                        (i) => `
                    <div class="kpi-card">
                        <span class="kpi-value">${escapeHtml(i.value)}</span>
                        <span class="kpi-label">${escapeHtml(i.label)}</span>
                    </div>
                `
                    )
                    .join('')}
            </div>
        `;
        return;
    }

    if (partKey === 'estados') {
        const rows = data.porEstado || [];
        container.innerHTML = `
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Estado Actual</th>
                            <th>Cantidad de Animales</th>
                            <th>Porcentaje del Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows
                            .map(
                                (r) => `
                            <tr>
                                <td>${escapeHtml(r.estado)}</td>
                                <td>${r.cantidad}</td>
                                <td>${r.porcentaje_total}%</td>
                            </tr>
                        `
                            )
                            .join('')}
                    </tbody>
                </table>
            </div>
        `;
        return;
    }

    if (partKey === 'etapas') {
        const rows = data.porEtapa || [];
        container.innerHTML = `
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Etapa de Edad</th>
                            <th>Cantidad de Animales</th>
                            <th>Porcentaje del Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows
                            .map(
                                (r) => `
                            <tr>
                                <td>${escapeHtml(r.etapa)}</td>
                                <td>${r.cantidad}</td>
                                <td>${r.porcentaje_total}%</td>
                            </tr>
                        `
                            )
                            .join('')}
                    </tbody>
                </table>
            </div>
        `;
        return;
    }

    if (partKey === 'especies') {
        const rows = data.porEspecieSexo || [];
        container.innerHTML = `
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Especie</th>
                            <th>Machos</th>
                            <th>Hembras</th>
                            <th>Total Censado</th>
                            <th>Población Total Refugio</th>
                            <th>Capacidad Máxima</th>
                            <th>Ocupación</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows
                            .map(
                                (r) => `
                            <tr>
                                <td>${escapeHtml(r.especie)}</td>
                                <td>${r.macho}</td>
                                <td>${r.hembra}</td>
                                <td>${r.total_censado}</td>
                                <td>${r.poblacion_total_refugio}</td>
                                <td>${r.capacidad_maxima}</td>
                                <td>${r.porcentaje_ocupacion_refugio}%</td>
                            </tr>
                        `
                            )
                            .join('')}
                    </tbody>
                </table>
            </div>
        `;
        return;
    }

    if (partKey === 'sectores') {
        const rows = data.porSector || [];
        container.innerHTML = `
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Sector</th>
                            <th>Descripción</th>
                            <th>Animales Censados</th>
                            <th>Porcentaje</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows
                            .map(
                                (r) => `
                            <tr>
                                <td>${escapeHtml(r.sector)}</td>
                                <td>${escapeHtml(r.descripcion || '-')}</td>
                                <td>${r.cantidad}</td>
                                <td>${r.porcentaje_total}%</td>
                            </tr>
                        `
                            )
                            .join('')}
                    </tbody>
                </table>
            </div>
        `;
        return;
    }

    if (partKey === 'veterinario') {
        const rows = data.controlVeterinario || [];
        container.innerHTML = `
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Control Veterinario</th>
                            <th>Al Día (Sí)</th>
                            <th>Pendiente / Parcial / No</th>
                            <th>Porcentaje al Día</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows
                            .map(
                                (r) => `
                            <tr>
                                <td>${escapeHtml(r.control_veterinario)}</td>
                                <td>${r.al_dia_si}</td>
                                <td>${r.pendiente_parcial_no}</td>
                                <td>${r.porcentaje_al_dia}%</td>
                            </tr>
                        `
                            )
                            .join('')}
                    </tbody>
                </table>
            </div>
        `;
        return;
    }

    if (partKey === 'insumos') {
        const rows = data.insumosRecibidos || [];
        container.innerHTML = `
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Tipo de Insumo</th>
                            <th>Entregas Registradas</th>
                            <th>Total Cantidad</th>
                            <th>Unidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows
                            .map(
                                (r) => `
                            <tr>
                                <td>${escapeHtml(r.tipo_insumo)}</td>
                                <td>${r.registros}</td>
                                <td>${r.total_cantidad}</td>
                                <td>${escapeHtml(r.unidad)}</td>
                            </tr>
                        `
                            )
                            .join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

/**
 * Renderiza la tabla de animales paginada (ej. 10 por página) para recorrer sin saturar la pantalla.
 */
export function renderAnimalesTablePage(animales, page, pageSize, onPageChange, onInspectAnimal) {
    const container = document.getElementById('animales-table-container');
    const countLabel = document.getElementById('animales-count-label');
    const paginationEl = document.getElementById('animales-pagination');
    if (!container) return;

    const total = Array.isArray(animales) ? animales.length : 0;
    if (countLabel) {
        countLabel.textContent = `${total} registro${total === 1 ? '' : 's'}`;
    }

    if (total === 0) {
        container.innerHTML = '<div class="box">No se encontraron animales con esos filtros.</div>';
        if (paginationEl) paginationEl.innerHTML = '';
        return;
    }

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const startIdx = (currentPage - 1) * pageSize;
    const pageItems = animales.slice(startIdx, startIdx + pageSize);

    container.innerHTML = `
        <div class="table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Especie</th>
                        <th>Sexo</th>
                        <th>Etapa</th>
                        <th>Tamaño</th>
                        <th>Sector</th>
                        <th>Estado</th>
                        <th>Esterilizado</th>
                        <th>Descripción Física</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${pageItems
                        .map(
                            (a) => `
                        <tr>
                            <td><strong>${escapeHtml(a.id_animal)}</strong></td>
                            <td>${escapeHtml(a.especie)}</td>
                            <td>${escapeHtml(a.sexo)}</td>
                            <td>${escapeHtml(a.etapa_edad)}</td>
                            <td>${escapeHtml(a.tamano)}</td>
                            <td>${escapeHtml(a.sector)}</td>
                            <td>${escapeHtml(a.estado_actual)}</td>
                            <td>${escapeHtml(a.esterilizado || '-')}</td>
                            <td>${escapeHtml(a.descripcion_fisica)}</td>
                            <td>
                                <button type="button" class="btn btn-inspect-animal" data-id="${escapeHtml(a.id_animal)}">
                                    Ver ficha
                                </button>
                            </td>
                        </tr>
                    `
                        )
                        .join('')}
                </tbody>
            </table>
        </div>
    `;

    container.querySelectorAll('.btn-inspect-animal').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            if (id && typeof onInspectAnimal === 'function') {
                onInspectAnimal(id);
            }
        });
    });

    if (paginationEl) {
        paginationEl.innerHTML = `
            <span>Mostrando ${startIdx + 1} - ${startIdx + pageItems.length} de ${total}</span>
            <div class="pagination-controls">
                <button type="button" class="btn" id="btn-prev-page" ${currentPage <= 1 ? 'disabled' : ''}>Anterior</button>
                <span>Página ${currentPage} de ${totalPages}</span>
                <button type="button" class="btn" id="btn-next-page" ${currentPage >= totalPages ? 'disabled' : ''}>Siguiente</button>
            </div>
        `;

        paginationEl.querySelector('#btn-prev-page')?.addEventListener('click', () => {
            if (currentPage > 1) onPageChange(currentPage - 1);
        });
        paginationEl.querySelector('#btn-next-page')?.addEventListener('click', () => {
            if (currentPage < totalPages) onPageChange(currentPage + 1);
        });
    }
}

/**
 * Renderiza el modal limpio con el detalle de un animal.
 */
export function renderAnimalDetailsModal(animal) {
    const modalBody = document.querySelector('#animal-details-modal .modal-body');
    if (!modalBody || !animal) return;

    const fm = animal.ficha_medica || {};

    modalBody.innerHTML = `
        <h3 style="margin:0 0 4px 0;">Ficha de Animal: ${escapeHtml(animal.id_animal)}</h3>
        <small style="color:#666;">${escapeHtml(animal.especie)} • ${escapeHtml(animal.sexo)} • ${escapeHtml(animal.etapa_edad)}</small>

        <ul class="detail-list">
            <li><span class="label">Estado actual</span><span class="value">${escapeHtml(animal.estado_actual)}</span></li>
            <li><span class="label">Tamaño</span><span class="value">${escapeHtml(animal.tamano)}</span></li>
            <li><span class="label">Sector</span><span class="value">${escapeHtml(animal.sector)}</span></li>
            <li><span class="label">Fecha de ingreso</span><span class="value">${escapeHtml(animal.fecha_ingreso || 'No registrada')}</span></li>
            <li><span class="label">Referencia foto</span><span class="value">${escapeHtml(animal.codigo_foto || animal.nota_ubicacion || '-')}</span></li>
            <li><span class="label">Descripción física</span><span class="value">${escapeHtml(animal.descripcion_fisica)}</span></li>
            <li><span class="label">Temperamento</span><span class="value">${escapeHtml(animal.temperamento_convivencia || '-')}</span></li>
            <li><span class="label">Esterilizado</span><span class="value">${escapeHtml(fm.esterilizado || '-')}</span></li>
            <li><span class="label">Vacunas al día</span><span class="value">${escapeHtml(fm.vacunas_al_dia || 'No especificado')}</span></li>
            <li><span class="label">Detalle de vacunas</span><span class="value">${escapeHtml(fm.detalle_vacunas || '-')}</span></li>
            <li><span class="label">Desparasitado</span><span class="value">${escapeHtml(fm.desparasitado || '-')}</span></li>
            <li><span class="label">Condiciones especiales</span><span class="value">${escapeHtml(fm.condiciones_especiales || 'Ninguna')}</span></li>
        </ul>
    `;
}

/**
 * Renderiza la tabla de donaciones.
 */
export function renderDonacionesList(donaciones) {
    const container = document.getElementById('donaciones-list-container');
    const countLabel = document.getElementById('donaciones-count-label');
    if (!container) return;

    const total = Array.isArray(donaciones) ? donaciones.length : 0;
    if (countLabel) {
        countLabel.textContent = `${total} registro${total === 1 ? '' : 's'}`;
    }

    if (total === 0) {
        container.innerHTML = '<div class="box">No se encontraron donaciones con esos filtros.</div>';
        return;
    }

    container.innerHTML = `
        <div class="table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Tipo de Insumo</th>
                        <th>Descripción</th>
                        <th>Cantidad</th>
                        <th>Donante</th>
                        <th>Observaciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${donaciones
                        .map(
                            (d) => `
                        <tr>
                            <td><strong>${escapeHtml(d.id_donacion)}</strong></td>
                            <td style="white-space:nowrap;">${escapeHtml(d.fecha)}</td>
                            <td>${escapeHtml(d.tipo_insumo)}</td>
                            <td>${escapeHtml(d.descripcion_producto)}</td>
                            <td style="white-space:nowrap;">${escapeHtml(d.cantidad)} ${escapeHtml(d.unidad)}</td>
                            <td>${escapeHtml(d.donante_grupo)}</td>
                            <td>${escapeHtml(d.observaciones || '-')}</td>
                        </tr>
                    `
                        )
                        .join('')}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Renderiza una sola parte de la vista de Info del Refugio a la vez.
 */
export function renderRefugioPart(refugioData, partKey) {
    const container = document.getElementById('refugio-part-container');
    if (!container || !refugioData) return;

    if (partKey === 'institucional') {
        const rows = refugioData.fichaInstitucional || [];
        container.innerHTML = `
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width:260px;">Dato Institucional</th>
                            <th>Detalle</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows
                            .map(
                                (r) => `
                            <tr>
                                <td><strong>${escapeHtml(r.clave)}</strong></td>
                                <td>${escapeHtml(r.valor)}</td>
                            </tr>
                        `
                            )
                            .join('')}
                    </tbody>
                </table>
            </div>
        `;
        return;
    }

    if (partKey === 'capacidad') {
        const rows = refugioData.capacidadYConsumo || [];
        container.innerHTML = `
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Especie</th>
                            <th>Capacidad Máxima</th>
                            <th>Población Total Refugio</th>
                            <th>Muestra en BD</th>
                            <th>Promedio Diario</th>
                            <th>Consumo Semanal</th>
                            <th>Consumo Mensual</th>
                            <th>Detalle</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows
                            .map(
                                (c) => `
                            <tr>
                                <td><strong>${escapeHtml(c.especie)}</strong></td>
                                <td>${c.capacidad_maxima}</td>
                                <td>${c.poblacion_total_refugio}</td>
                                <td>${c.muestra_censada_bd}</td>
                                <td>${c.promedio_diario_kg} kg/día</td>
                                <td>${c.consumo_semanal_kg} kg/sem</td>
                                <td>${c.consumo_mensual_kg} kg/mes</td>
                                <td>${escapeHtml(c.detalle_consumo || '-')}</td>
                            </tr>
                        `
                            )
                            .join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}
