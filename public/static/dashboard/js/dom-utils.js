// static/dashboard/js/dom-utils.js

export function getAdminAppElement() {
    return document.getElementById('admin-app');
}

export function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function getEstadoBadgeClass(estado) {
    const norm = (estado || '').toLowerCase();
    if (norm.includes('disponible')) return 'badge-disponible';
    if (norm.includes('tratamiento')) return 'badge-tratamiento';
    if (norm.includes('temporal')) return 'badge-temporal';
    if (norm.includes('adoptado')) return 'badge-adoptado';
    return 'badge-neutral';
}
