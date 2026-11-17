// static/dashboard/js/navigation.js
import { getAdminAppElement } from '/static/dashboard/js/dom-utils.js';

export function setupSidebarLogic(onViewChange) {
    const adminApp = getAdminAppElement();
    if (!adminApp) return;

    const viewLinks = adminApp.querySelectorAll('.sidebar [data-view]');
    viewLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            const viewId = link.dataset.view;
            if (!viewId) return;
            e.preventDefault();
            showDashboardView(viewId);
            if (typeof onViewChange === 'function') {
                onViewChange(viewId);
            }
        });
    });
}

export function showDashboardView(viewId) {
    const adminApp = getAdminAppElement();
    if (!adminApp) return;

    adminApp.querySelectorAll('.dashboard-view').forEach((view) => {
        view.classList.toggle('active', view.id === viewId);
    });

    adminApp.querySelectorAll('.sidebar .nav-link[data-view]').forEach((link) => {
        link.classList.toggle('active', link.dataset.view === viewId);
    });
}
