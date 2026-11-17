// static/dashboard/js/api.js

/**
 * Realiza una petición fetch limpia con manejo centralizado de errores JSON/HTTP.
 * @param {string} url - Endpoint relativo o URL completa.
 * @param {object} options - Opciones adicionales para fetch.
 * @returns {Promise<any>} Respuesta JSON parseada.
 */
async function apiFetch(url, options = {}) {
    const fetchOptions = {
        method: 'GET',
        ...options,
        headers: {
            Accept: 'application/json',
            ...(options.headers || {})
        }
    };

    const response = await fetch(url, fetchOptions);
    let responseData = {};
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        responseData = await response.json();
    } else if (!response.ok) {
        responseData = { error: (await response.text()) || response.statusText };
    }

    if (!response.ok) {
        const errorMessage = responseData?.errorMessage || responseData?.error || `HTTP error ${response.status}`;
        const err = new Error(errorMessage);
        err.status = response.status;
        err.data = responseData;
        throw err;
    }

    return responseData;
}

/**
 * Obtiene el resumen estadístico completo (/api/resumen).
 */
export async function fetchResumen() {
    return apiFetch('/api/resumen');
}

/**
 * Obtiene el listado de animales con filtros opcionales (/api/animales).
 * @param {object} filters - Objeto con filtros opcionales.
 */
export async function fetchAnimales(filters = {}) {
    const url = new URL('/api/animales', window.location.origin);
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== '') {
            url.searchParams.append(key, String(value).trim());
        }
    });
    return apiFetch(url.toString());
}

/**
 * Obtiene la ficha completa de un animal por su ID (/api/animales/:id).
 * @param {string} idAnimal - Ej. 'PK-001'
 */
export async function fetchAnimalDetails(idAnimal) {
    if (!idAnimal) throw new Error('Se requiere el ID del animal.');
    return apiFetch(`/api/animales/${encodeURIComponent(idAnimal)}`);
}

/**
 * Obtiene el listado de donaciones con filtros opcionales (/api/donaciones).
 * @param {object} filters - Objeto con filtros opcionales.
 */
export async function fetchDonaciones(filters = {}) {
    const url = new URL('/api/donaciones', window.location.origin);
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== '') {
            url.searchParams.append(key, String(value).trim());
        }
    });
    return apiFetch(url.toString());
}

/**
 * Obtiene la información institucional y capacidad/consumo del refugio (/api/refugio).
 */
export async function fetchRefugio() {
    return apiFetch('/api/refugio');
}

/**
 * Obtiene todos los catálogos 3FN para poblar los selectores de filtros (/api/refugio/catalogos).
 */
export async function fetchCatalogos() {
    return apiFetch('/api/refugio/catalogos');
}
