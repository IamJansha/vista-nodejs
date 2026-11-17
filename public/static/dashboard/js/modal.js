// static/dashboard/js/modal.js
import { getAdminAppElement } from '/static/dashboard/js/dom-utils.js';

export function openModal(modalId) {
    const adminApp = getAdminAppElement();
    const modal = adminApp?.querySelector(`#${modalId}`);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        setupModalCloseListeners(modalId);
    }
}

export function closeModal(modalId) {
    const adminApp = getAdminAppElement();
    const modal = adminApp?.querySelector(`#${modalId}`);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

export function setupModalCloseListeners(modalId) {
    const adminApp = getAdminAppElement();
    const modal = adminApp?.querySelector(`#${modalId}`);
    if (!modal) return;

    const closeButton = modal.querySelector('.close-button');

    const handleCloseButtonClick = () => closeModal(modalId);
    const handleClickOutside = (event) => {
        if (event.target === modal) closeModal(modalId);
    };
    const handleEscapeKey = (event) => {
        if (event.key === 'Escape') closeModal(modalId);
    };

    if (modal.__modalCloseListeners) {
        const prev = modal.__modalCloseListeners;
        prev.closeButton?.removeEventListener('click', prev.closeHandler);
        window.removeEventListener('click', prev.outsideHandler);
        document.removeEventListener('keydown', prev.escapeHandler);
    }

    closeButton?.addEventListener('click', handleCloseButtonClick);
    window.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    modal.__modalCloseListeners = {
        closeButton,
        closeHandler: handleCloseButtonClick,
        outsideHandler: handleClickOutside,
        escapeHandler: handleEscapeKey
    };
}
