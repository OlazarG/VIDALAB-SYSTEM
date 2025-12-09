
import * as Auth from './modules/auth.js';
import * as Clients from './modules/clients.js';
import * as Movements from './modules/movements.js';
import * as Invoices from './modules/invoices.js';
import * as Utils from './utils.js';

// --- Global Navigation ---

window.showSection = function (sectionId, element) {
    document.querySelectorAll('.section-view').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    if (element) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        element.classList.add('active');
    }

    if (sectionId === 'clientes') Clients.loadClientsTable();
    if (sectionId === 'usuarios') Auth.loadUsers();
    if (sectionId === 'inventario') Movements.loadDailySummary();
}

window.openTab = function (evt, tabName) {
    document.querySelectorAll('.tab-content').forEach(tc => {
        tc.style.display = 'none';
        tc.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabName).style.display = 'block';
    setTimeout(() => document.getElementById(tabName).classList.add('active'), 10);
    if (evt && evt.currentTarget) evt.currentTarget.classList.add('active');

    if (tabName === 'tab-pacientes') Movements.initPatientsTab();
    if (tabName === 'tab-ingresos') Movements.initIncomesTab();
    if (tabName === 'tab-egresos') Movements.initExpensesTab();
    if (tabName === 'tab-movimientos') Movements.initMovementsTab();
}

// --- Component Loading ---

async function loadComponent(id, path) {
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`Failed to load ${path}`);
        const html = await res.text();
        document.getElementById(id).innerHTML = html;
    } catch (e) {
        console.error(e);
        document.getElementById(id).innerHTML = `<div class="error">Error loading component ${path}</div>`;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Load all HTML fragments
    await Promise.all([
        loadComponent('sidebar-container', 'components/sidebar.html'),
        loadComponent('dashboard', 'components/dashboard.html'),
        loadComponent('inventario', 'components/movements.html'), // Inventario = Planilla
        loadComponent('clientes', 'components/clients.html'),
        loadComponent('usuarios', 'components/users.html'),
        loadComponent('modals-container', 'components/modals.html')
    ]);

    // Initialize Modules (attach listeners)
    Auth.init();
    Auth.checkAuth();
    Clients.init();
    Movements.init();
    Invoices.init();

    // Set initial state
    Movements.loadDailySummary(); // Preload data if needed? Or just wait for click.
    // Dashboard actions if any?
});
