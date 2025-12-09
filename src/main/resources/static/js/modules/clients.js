
import { postData, fetchData } from '../api.js';
import { showNotification } from '../utils.js';

let allClientsData = [];
let patientClientsMap = {};

// --- Exports for other modules ---

export async function loadClientsTable() {
    try {
        const clients = await fetchData('/api/clientes');
        allClientsData = clients;
        const tbody = document.getElementById('clientsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        clients.forEach(c => {
            const row = `<tr style="cursor: pointer;" onclick="openVisitHistory(${c.id}, '${c.razonSocial}')">
                <td>${c.ruc}</td>
                <td>${c.razonSocial}</td>
                <td>${c.email || '-'}</td>
                <td>${c.telefono || '-'}</td>
                <td class="actions">
                    <i class="fas fa-edit action-btn" title="Editar" onclick="editClient(event, ${c.id})"></i>
                    <i class="fas fa-trash action-btn action-delete" title="Eliminar" onclick="deleteClient(event, ${c.id})"></i>
                </td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (e) { console.error(e); }
}

export async function loadClientsForPatientForm() {
    try {
        const clients = await fetchData('/api/clientes');
        const datalist = document.getElementById('patientClientList');
        if (!datalist) return;

        datalist.innerHTML = '';
        patientClientsMap = {};
        clients.forEach(c => {
            const option = document.createElement('option');
            option.value = c.ruc;
            datalist.appendChild(option);
            patientClientsMap[c.ruc] = c;
        });
    } catch (e) { console.error("Error loading clients for patient form:", e); }
}

export function getClientByRuc(ruc) {
    return patientClientsMap[ruc];
}

// --- Window Functions (for HTML attributes) ---

window.editClient = function (event, id) {
    if (event) event.stopPropagation();
    const client = allClientsData.find(c => c.id === id);
    if (client) {
        document.getElementById('clientModalId').value = client.id;
        document.getElementById('clientModalRuc').value = client.ruc;
        document.getElementById('clientModalName').value = client.razonSocial;
        document.getElementById('clientModalEmail').value = client.email || '';
        document.getElementById('clientModalPhone').value = client.telefono || '';
        document.getElementById('clientModalAddress').value = client.direccion || '';
        openClientModal();
    }
}

window.deleteClient = async function (event, id) {
    if (event) event.stopPropagation();
    if (confirm('¿Está seguro de eliminar este cliente?')) {
        try {
            const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showNotification('Cliente eliminado', 'success');
                loadClientsTable();
                loadClientsForPatientForm();
            } else {
                try {
                    const errorJson = await res.json();
                    if (errorJson.message && errorJson.message.includes('ConstraintViolation')) {
                        showNotification('No se puede eliminar: El cliente tiene registros asociados.', 'error');
                        return;
                    }
                } catch (e) { /* ignore */ }
                showNotification('Error al eliminar. Verifique que no tenga datos asociados.', 'error');
            }
        } catch (e) {
            console.error(e);
            showNotification('Error de conexión', 'error');
        }
    }
}

window.openClientModal = function () {
    document.getElementById('clientModal').classList.add('active');
}

window.closeClientModal = function () {
    document.getElementById('clientModal').classList.remove('active');
}

window.saveClientAndRegisterPatient = async function () {
    const ruc = document.getElementById('clientModalRuc').value;
    let savedClient = null;

    // Check if client already exists (using the map from loadClientsForPatientForm)
    if (patientClientsMap[ruc]) {
        savedClient = patientClientsMap[ruc];
        showNotification('Cliente ya existente. Usando registro actual.', 'info');
    } else {
        const data = {
            ruc: ruc,
            razonSocial: document.getElementById('clientModalName').value,
            email: document.getElementById('clientModalEmail').value,
            telefono: document.getElementById('clientModalPhone').value,
            direccion: document.getElementById('clientModalAddress').value
        };

        savedClient = await postData('/api/clientes', data, () => {
            loadClientsTable();
            loadClientsForPatientForm();
        });
    }

    if (savedClient) {
        document.getElementById('clientModalForm').reset();
        closeClientModal();

        // Switch to Pacientes tab
        // Assuming access to showSection and openTab globally or re-implementing logic
        if (window.showSection) window.showSection('inventario', document.querySelector('.nav-link[onclick*="inventario"]'));

        // Trigger tab open manually
        const patientsTabContent = document.getElementById('tab-pacientes');
        if (patientsTabContent) {
            // Hide others
            document.querySelectorAll('.tab-content').forEach(tc => {
                tc.style.display = 'none';
                tc.classList.remove('active');
            });
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

            patientsTabContent.style.display = 'block';
            patientsTabContent.classList.add('active');
            const tabBtn = document.querySelector('button[onclick*="tab-pacientes"]');
            if (tabBtn) tabBtn.classList.add('active');
        }

        // Pre-fill patient form
        document.getElementById('patientClientSearch').value = savedClient.ruc;
        document.getElementById('patientClientId').value = savedClient.id;
        document.getElementById('patientName').value = savedClient.razonSocial;
        document.getElementById('patientPhone').value = savedClient.telefono || '';
    }
}

window.filterClients = function () {
    const searchTerm = document.getElementById('clientSearchInput').value.toLowerCase();
    const tbody = document.getElementById('clientsTableBody');
    tbody.innerHTML = '';
    const filtered = allClientsData.filter(c => {
        return (c.ruc && c.ruc.toLowerCase().includes(searchTerm)) ||
            (c.razonSocial && c.razonSocial.toLowerCase().includes(searchTerm)) ||
            (c.email && c.email.toLowerCase().includes(searchTerm)) ||
            (c.telefono && c.telefono.toLowerCase().includes(searchTerm));
    });
    filtered.forEach(c => {
        const row = `<tr style="cursor: pointer;" onclick="openVisitHistory(${c.id}, '${c.razonSocial}')">
            <td>${c.ruc}</td>
            <td>${c.razonSocial}</td>
            <td>${c.email || '-'}</td>
            <td>${c.telefono || '-'}</td>
            <td class="actions">
                <i class="fas fa-edit action-btn" title="Editar" onclick="editClient(event, ${c.id})"></i>
                <i class="fas fa-trash action-btn action-delete" title="Eliminar" onclick="deleteClient(event, ${c.id})"></i>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}
window.openVisitHistory = async function (clientId, clientName) {
    document.getElementById('visitHistoryClientName').textContent = `Expediente: ${clientName}`;
    document.getElementById('clientVisitHistoryModal').classList.add('active');

    // Dependent on movements module logic? 
    // We can fetch patients here directly or use a helper. 
    // For modularity, I'll implement the fetch here to avoid circular dep on movements.js
    try {
        const allPatients = await fetchData('/api/patient');
        const clientVisits = allPatients.filter(p => p.clientId == clientId);

        const tbody = document.getElementById('visitHistoryTableBody');
        tbody.innerHTML = '';
        if (clientVisits.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #999;">No hay visitas registradas para este cliente</td></tr>';
            return;
        }

        // Need formatDate and formatCurrency
        // They are not global, but I can use the imported ones? No, string template needs them?
        // Ah, I need to format in JS before putting into string.
        const { formatDate, formatCurrency } = await import('../utils.js'); // Dynamic import or just use top level

        clientVisits.forEach(visit => {
            const row = `<tr>
                <td>${formatDate(visit.fechaIngreso)}</td>
                <td>${visit.motivoConsulta || '-'}</td>
                <td>${formatCurrency(visit.monto)}</td>
                <td>${formatCurrency(visit.saldo)}</td>
                <td>${visit.observacion || '-'}</td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (e) {
        console.error("Error loading client visits:", e);
        showNotification('Error al cargar el historial de visitas', 'error');
    }
}

window.closeVisitHistoryModal = function () {
    tbody.innerHTML += row;
});
    } catch (e) { console.error(e); }
}

export async function loadClientsForPatientForm() {
    try {
        const clients = await fetchData('/api/clientes');
        const datalist = document.getElementById('patientClientList');
        if (!datalist) return;

        datalist.innerHTML = '';
        patientClientsMap = {};
        clients.forEach(c => {
            const option = document.createElement('option');
            option.value = c.ruc;
            datalist.appendChild(option);
            patientClientsMap[c.ruc] = c;
        });
    } catch (e) { console.error("Error loading clients for patient form:", e); }
}

export function getClientByRuc(ruc) {
    return patientClientsMap[ruc];
}

// --- Window Functions (for HTML attributes) ---

window.editClient = function (event, id) {
    if (event) event.stopPropagation();
    const client = allClientsData.find(c => c.id === id);
    if (client) {
        document.getElementById('clientModalId').value = client.id;
        document.getElementById('clientModalRuc').value = client.ruc;
        document.getElementById('clientModalName').value = client.razonSocial;
        document.getElementById('clientModalEmail').value = client.email || '';
        document.getElementById('clientModalPhone').value = client.telefono || '';
        document.getElementById('clientModalAddress').value = client.direccion || '';
        openClientModal();
    }
}

window.deleteClient = async function (event, id) {
    if (event) event.stopPropagation();
    if (confirm('¿Está seguro de eliminar este cliente?')) {
        try {
            const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showNotification('Cliente eliminado', 'success');
                loadClientsTable();
                loadClientsForPatientForm();
            } else {
                try {
                    const errorJson = await res.json();
                    if (errorJson.message && errorJson.message.includes('ConstraintViolation')) {
                        showNotification('No se puede eliminar: El cliente tiene registros asociados.', 'error');
                        return;
                    }
                } catch (e) { /* ignore */ }
                showNotification('Error al eliminar. Verifique que no tenga datos asociados.', 'error');
            }
        } catch (e) {
            console.error(e);
            showNotification('Error de conexión', 'error');
        }
    }
}

window.openClientModal = function () {
    document.getElementById('clientModal').classList.add('active');
}

window.closeClientModal = function () {
    document.getElementById('clientModal').classList.remove('active');
}

window.saveClientAndRegisterPatient = async function () {
    const ruc = document.getElementById('clientModalRuc').value;
    let savedClient = null;

    // Check if client already exists (using the map from loadClientsForPatientForm)
    if (patientClientsMap[ruc]) {
        savedClient = patientClientsMap[ruc];
        showNotification('Cliente ya existente. Usando registro actual.', 'info');
    } else {
        const data = {
            ruc: ruc,
            razonSocial: document.getElementById('clientModalName').value,
            email: document.getElementById('clientModalEmail').value,
            telefono: document.getElementById('clientModalPhone').value,
            direccion: document.getElementById('clientModalAddress').value
        };

        savedClient = await postData('/api/clientes', data, () => {
            loadClientsTable();
            loadClientsForPatientForm();
        });
    }

    if (savedClient) {
        document.getElementById('clientModalForm').reset();
        closeClientModal();

        // Switch to Pacientes tab
        // Assuming access to showSection and openTab globally or re-implementing logic
        if (window.showSection) window.showSection('inventario', document.querySelector('.nav-link[onclick*="inventario"]'));

        // Trigger tab open manually
        const patientsTabContent = document.getElementById('tab-pacientes');
        if (patientsTabContent) {
            // Hide others
            document.querySelectorAll('.tab-content').forEach(tc => {
                tc.style.display = 'none';
                tc.classList.remove('active');
            });
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

            patientsTabContent.style.display = 'block';
            patientsTabContent.classList.add('active');
            const tabBtn = document.querySelector('button[onclick*="tab-pacientes"]');
            if (tabBtn) tabBtn.classList.add('active');
        }

        // Pre-fill patient form
        document.getElementById('patientClientSearch').value = savedClient.ruc;
        document.getElementById('patientClientId').value = savedClient.id;
        document.getElementById('patientName').value = savedClient.razonSocial;
        document.getElementById('patientPhone').value = savedClient.telefono || '';
    }
}

window.filterClients = function () {
    const searchTerm = document.getElementById('clientSearchInput').value.toLowerCase();
    const tbody = document.getElementById('clientsTableBody');
    tbody.innerHTML = '';
    const filtered = allClientsData.filter(c => {
        return (c.ruc && c.ruc.toLowerCase().includes(searchTerm)) ||
            (c.razonSocial && c.razonSocial.toLowerCase().includes(searchTerm)) ||
            (c.email && c.email.toLowerCase().includes(searchTerm)) ||
            (c.telefono && c.telefono.toLowerCase().includes(searchTerm));
    });
    filtered.forEach(c => {
        const row = `<tr style="cursor: pointer;" onclick="openVisitHistory(${c.id}, '${c.razonSocial}')">
            <td>${c.ruc}</td>
            <td>${c.razonSocial}</td>
            <td>${c.email || '-'}</td>
            <td>${c.telefono || '-'}</td>
            <td class="actions">
                <i class="fas fa-edit action-btn" title="Editar" onclick="editClient(event, ${c.id})"></i>
                <i class="fas fa-trash action-btn action-delete" title="Eliminar" onclick="deleteClient(event, ${c.id})"></i>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}
window.openVisitHistory = async function (clientId, clientName) {
    document.getElementById('visitHistoryClientName').textContent = `Expediente: ${clientName}`;
    document.getElementById('clientVisitHistoryModal').classList.add('active');

    // Dependent on movements module logic? 
    // We can fetch patients here directly or use a helper. 
    // For modularity, I'll implement the fetch here to avoid circular dep on movements.js
    try {
        const allPatients = await fetchData('/api/patient');
        const clientVisits = allPatients.filter(p => p.clientId == clientId);

        const tbody = document.getElementById('visitHistoryTableBody');
        tbody.innerHTML = '';
        if (clientVisits.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #999;">No hay visitas registradas para este cliente</td></tr>';
            return;
        }

        // Need formatDate and formatCurrency
        // They are not global, but I can use the imported ones? No, string template needs them?
        // Ah, I need to format in JS before putting into string.
        const { formatDate, formatCurrency } = await import('../utils.js'); // Dynamic import or just use top level

        clientVisits.forEach(visit => {
            const row = `<tr>
                <td>${formatDate(visit.fechaIngreso)}</td>
                <td>${visit.motivoConsulta || '-'}</td>
                <td>${formatCurrency(visit.monto)}</td>
                <td>${formatCurrency(visit.saldo)}</td>
                <td>${visit.observacion || '-'}</td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (e) {
        console.error("Error loading client visits:", e);
        showNotification('Error al cargar el historial de visitas', 'error');
    }
}

window.closeVisitHistoryModal = function () {
    document.getElementById('clientVisitHistoryModal').classList.remove('active');
}

// --- Listeners ---


// --- Init ---
export function init() {
    const form = document.getElementById('clientModalForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                ruc: document.getElementById('clientModalRuc').value,
                razonSocial: document.getElementById('clientModalName').value,
                email: document.getElementById('clientModalEmail').value,
                telefono: document.getElementById('clientModalPhone').value,
                direccion: document.getElementById('clientModalAddress').value
            };
            // Note: clientModalId handling was not in the original listener logic strangely, 
            // but the editClient function sets it. It might be used by backend if provided?
            // Original code just sent data. I'll stick to data.

            await postData('/api/clientes', data, () => {
                loadClientsTable();
                loadClientsForPatientForm();
            });
            e.target.reset();
            closeClientModal();
        });
    }
}
