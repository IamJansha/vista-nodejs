// static/dashboard/js/dashboard-main.js
import {
    fetchResumen,
    fetchAnimales,
    fetchAnimalDetails,
    fetchDonaciones,
    fetchRefugio,
    fetchCatalogos
} from '/static/dashboard/js/api.js';
import { setupSidebarLogic } from '/static/dashboard/js/navigation.js';
import { openModal } from '/static/dashboard/js/modal.js';
import {
    populateCatalogs,
    renderResumenPart,
    renderAnimalesTablePage,
    renderAnimalDetailsModal,
    renderDonacionesList,
    renderRefugioPart
} from '/static/dashboard/js/render.js';

const PAGE_SIZE = 10;

let cachedResumen = null;
let currentResumenPart = 'kpis';

let cachedRefugio = null;
let currentRefugioPart = 'institucional';

let cachedAnimales = [];
let currentAnimalesPage = 1;

function renderCurrentAnimalesPage() {
    renderAnimalesTablePage(
        cachedAnimales,
        currentAnimalesPage,
        PAGE_SIZE,
        (newPage) => {
            currentAnimalesPage = newPage;
            renderCurrentAnimalesPage();
        },
        handleInspectAnimal
    );
}

async function loadAnimalesWithCurrentFilters() {
    const filters = {
        search: document.getElementById('filter-animal-search')?.value,
        especie: document.getElementById('filter-animal-especie')?.value,
        sexo: document.getElementById('filter-animal-sexo')?.value,
        etapa: document.getElementById('filter-animal-etapa')?.value,
        sector: document.getElementById('filter-animal-sector')?.value,
        estado: document.getElementById('filter-animal-estado')?.value
    };

    try {
        cachedAnimales = await fetchAnimales(filters);
        currentAnimalesPage = 1;
        renderCurrentAnimalesPage();
    } catch (err) {
        console.error('Error cargando animales:', err);
    }
}

async function handleInspectAnimal(idAnimal) {
    const modalBody = document.querySelector('#animal-details-modal .modal-body');
    if (modalBody) {
        modalBody.innerHTML = '<p>Cargando ficha...</p>';
    }
    openModal('animal-details-modal');

    try {
        const detalle = await fetchAnimalDetails(idAnimal);
        renderAnimalDetailsModal(detalle);
    } catch (err) {
        if (modalBody) {
            modalBody.innerHTML = `<p>Error al cargar el animal: ${err.message}</p>`;
        }
    }
}

async function loadDonacionesWithCurrentFilters() {
    const filters = {
        search: document.getElementById('filter-donacion-search')?.value,
        tipo: document.getElementById('filter-donacion-tipo')?.value,
        desde: document.getElementById('filter-donacion-desde')?.value,
        hasta: document.getElementById('filter-donacion-hasta')?.value
    };

    try {
        const donaciones = await fetchDonaciones(filters);
        renderDonacionesList(donaciones);
    } catch (err) {
        console.error('Error cargando donaciones:', err);
    }
}

function setupSubNavListeners() {
    // Sub-navegación por partes para Resúmenes
    const resumenSubnav = document.getElementById('resumen-subnav');
    resumenSubnav?.querySelectorAll('.sub-tab').forEach((btn) => {
        btn.addEventListener('click', () => {
            resumenSubnav.querySelectorAll('.sub-tab').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            currentResumenPart = btn.dataset.part;
            renderResumenPart(cachedResumen, currentResumenPart);
        });
    });

    // Sub-navegación por partes para Refugio
    const refugioSubnav = document.getElementById('refugio-subnav');
    refugioSubnav?.querySelectorAll('.sub-tab').forEach((btn) => {
        btn.addEventListener('click', () => {
            refugioSubnav.querySelectorAll('.sub-tab').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            currentRefugioPart = btn.dataset.part;
            renderRefugioPart(cachedRefugio, currentRefugioPart);
        });
    });
}

function setupFilterListeners() {
    const animalForm = document.getElementById('animales-filter-form');
    if (animalForm) {
        animalForm.addEventListener('submit', (e) => e.preventDefault());
        animalForm.querySelectorAll('select').forEach((sel) => {
            sel.addEventListener('change', loadAnimalesWithCurrentFilters);
        });

        let searchTimer;
        document.getElementById('filter-animal-search')?.addEventListener('input', () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(loadAnimalesWithCurrentFilters, 200);
        });

        document.getElementById('btn-reset-animales')?.addEventListener('click', () => {
            animalForm.reset();
            loadAnimalesWithCurrentFilters();
        });
    }

    const donacionForm = document.getElementById('donaciones-filter-form');
    if (donacionForm) {
        donacionForm.addEventListener('submit', (e) => e.preventDefault());
        donacionForm.querySelectorAll('select, input[type="date"]').forEach((el) => {
            el.addEventListener('change', loadDonacionesWithCurrentFilters);
        });

        let searchTimer;
        document.getElementById('filter-donacion-search')?.addEventListener('input', () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(loadDonacionesWithCurrentFilters, 200);
        });

        document.getElementById('btn-reset-donaciones')?.addEventListener('click', () => {
            donacionForm.reset();
            loadDonacionesWithCurrentFilters();
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    setupSidebarLogic();
    setupSubNavListeners();
    setupFilterListeners();

    try {
        const [catalogos, resumen, animales, donaciones, refugio] = await Promise.all([
            fetchCatalogos(),
            fetchResumen(),
            fetchAnimales(),
            fetchDonaciones(),
            fetchRefugio()
        ]);

        cachedResumen = resumen;
        cachedAnimales = animales;
        cachedRefugio = refugio;

        populateCatalogs(catalogos);
        renderResumenPart(cachedResumen, currentResumenPart);
        renderCurrentAnimalesPage();
        renderDonacionesList(donaciones);
        renderRefugioPart(cachedRefugio, currentRefugioPart);
    } catch (err) {
        console.error('Error inicializando el panel:', err);
    }
});
