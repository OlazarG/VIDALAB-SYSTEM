
import { postData, fetchData } from '../api.js';
import { formatCurrency, formatDate, getTodayDateString, getDateRangeFromInputs, showNotification } from '../utils.js';
import { getClientByRuc, loadClientsForPatientForm } from './clients.js';

let allMovementsData = [];

export async function loadDailySummary() {
    initPatientsTab();
    initIncomesTab();
    initExpensesTab();
}

// --- Patients ---

window.initPatientsTab = function () {
    const today = getTodayDateString();
    const dateFrom = document.getElementById('patientsDateFrom');
    const dateTo = document.getElementById('patientsDateTo');
    if (dateFrom) dateFrom.value = today;
    if (dateTo) dateTo.value = today;
    filterPatients();
}

window.filterPatients = function () {
    const [dateFrom, dateTo] = getDateRangeFromInputs('patientsDateFrom', 'patientsDateTo');
    loadPatients(dateFrom, dateTo);
}

async function loadPatients(dateFrom = null, dateTo = null) {
    try {
        const [patients, clients] = await Promise.all([
            fetchData('/api/patient'),
            fetchData('/api/clientes')
        ]);

        const clientsLookup = {};
        clients.forEach(c => {
            clientsLookup[c.id] = { nombre: c.razonSocial, telefono: c.telefono };
        });

        patients.sort((a, b) => new Date(b.fechaIngreso) - new Date(a.fechaIngreso));

        let filtered = patients;
        if (dateFrom && dateTo) {
            filtered = patients.filter(p => {
                const pDate = new Date(p.fechaIngreso);
                return pDate >= dateFrom && pDate <= dateTo;
            });
        }

        const tbody = document.getElementById('patientTableBody');
        if (tbody) {
            tbody.innerHTML = '';
            filtered.forEach(item => {
                const nombre = item.clientId && clientsLookup[item.clientId]
                    ? clientsLookup[item.clientId].nombre
                    : (item.nombre || 'N/A');
                const telefono = item.clientId && clientsLookup[item.clientId]
                    ? clientsLookup[item.clientId].telefono
                    : (item.telefono || '-');
                const row = `<tr>
                    <td>${formatDate(item.fechaIngreso)}</td>
                    <td>${nombre}</td>
                    <td>${item.motivoConsulta || '-'}</td>
                    <td>${formatCurrency(item.monto)}</td>
                    <td>${formatCurrency(item.saldo)}</td>
                    <td>${telefono}</td>
                </tr>`;
                tbody.innerHTML += row;
            });
        }
    } catch (e) { console.error(e); }
}

// --- Incomes ---

window.initIncomesTab = function () {
    // Neutralized in original
}

// --- Expenses ---

window.initExpensesTab = function () {
    const today = getTodayDateString();
    const dateFrom = document.getElementById('expensesDateFrom');
    const dateTo = document.getElementById('expensesDateTo');
    if (dateFrom) dateFrom.value = today;
    if (dateTo) dateTo.value = today;
    filterExpenses();
}

window.filterExpenses = function () {
    const [dateFrom, dateTo] = getDateRangeFromInputs('expensesDateFrom', 'expensesDateTo');
    loadExpenses(dateFrom, dateTo);
}

async function loadExpenses(dateFrom = null, dateTo = null) {
    try {
        let data = await fetchData('/api/expense');
        data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        if (dateFrom && dateTo) {
            data = data.filter(e => {
                const eDate = new Date(e.fecha);
                return eDate >= dateFrom && eDate <= dateTo;
            });
        }

        const tbody = document.getElementById('expenseTableBody');
        if (tbody) {
            tbody.innerHTML = '';
            data.forEach(item => {
                const row = `<tr>
                    <td>${formatDate(item.fecha)}</td>
                    <td>${item.beneficiario}</td>
                    <td>${formatCurrency(item.monto)}</td>
                    <td>${item.beneficiario.match(/\(([^)]+)\)/)?.[1] || '-'}</td>
                </tr>`;
                tbody.innerHTML += row;
            });
        }
    } catch (e) { console.error(e); }
}

// --- Movements (Planilla) ---

window.initMovementsTab = function () {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const dateFrom = document.getElementById('movementsDateFrom');
    const dateTo = document.getElementById('movementsDateTo');
    if (dateFrom) dateFrom.value = todayStr;
    if (dateTo) dateTo.value = todayStr;
    filterMovements();
}

window.filterMovements = function () {
    const dateFromInput = document.getElementById('movementsDateFrom');
    const dateToInput = document.getElementById('movementsDateTo');

    if (!dateFromInput || !dateToInput) return; // Guard

    if (!dateFromInput.value || !dateToInput.value) {
        showNotification('Por favor seleccione ambas fechas', 'warning');
        return;
    }
    const [yearFrom, monthFrom, dayFrom] = dateFromInput.value.split('-').map(Number);
    const dateFrom = new Date(yearFrom, monthFrom - 1, dayFrom, 0, 0, 0, 0);

    const [yearTo, monthTo, dayTo] = dateToInput.value.split('-').map(Number);
    const dateTo = new Date(yearTo, monthTo - 1, dayTo, 23, 59, 59, 999);

    loadMovements(dateFrom, dateTo);
}

window.loadMovements = async function (dateFrom = null, dateTo = null) {
    try {
        const [patients, incomes, expenses, clients] = await Promise.all([
            fetchData('/api/patient'),
            fetchData('/api/income'),
            fetchData('/api/expense'),
            fetchData('/api/clientes')
        ]);

        const clientsLookup = {};
        clients.forEach(c => clientsLookup[c.id] = c.razonSocial);

        let allMovements = [];

        patients.forEach(p => {
            const clientName = p.clientId ? clientsLookup[p.clientId] || 'Cliente Desconocido' : (p.nombre || 'Sin Cliente');
            allMovements.push({
                date: new Date(p.fechaIngreso),
                type: 'Ingreso',
                category: 'VENTA',
                description: clientName,
                motivo: p.motivoConsulta || '-',
                usuario: p.usuario || 'Sistema',
                paymentMethod: p.metodoPago || 'Efectivo',
                income: p.monto,
                expense: 0
            });
        });

        incomes.forEach(i => {
            allMovements.push({
                date: new Date(i.fecha),
                type: i.tipo === 'CAJA_CHICA' ? 'Caja Chica' : 'Otro Ingreso',
                category: i.tipo || 'VENTA',
                description: i.observacion,
                usuario: i.usuario || 'Sistema',
                paymentMethod: i.metodoPago || '-',
                income: i.monto,
                expense: 0
            });
        });

        expenses.forEach(e => {
            allMovements.push({
                date: new Date(e.fecha),
                type: 'Egreso',
                category: 'EGRESO',
                description: e.beneficiario,
                usuario: e.usuario || 'Sistema',
                paymentMethod: e.metodoPago || '-',
                income: 0,
                expense: e.monto
            });
        });

        allMovements.sort((a, b) => a.date - b.date);

        if (dateFrom && dateTo) {
            allMovements = allMovements.filter(m => m.date >= dateFrom && m.date <= dateTo);
        }

        const tbody = document.getElementById('movementsBody');
        if (tbody) {
            tbody.innerHTML = '';
            let runningBalance = 0;
            let pettyCashTotal = 0;
            let revenueTotal = 0;
            let cashIncomeTotal = 0;

            allMovements.forEach(m => {
                runningBalance += (m.income - m.expense);
                if (m.category === 'CAJA_CHICA') pettyCashTotal += m.income;
                else if (m.category === 'VENTA') revenueTotal += m.income;

                if (m.paymentMethod === 'Efectivo' && m.income > 0) {
                    cashIncomeTotal += m.income;
                }

                const row = `<tr>
                    <td style="padding: 4px 8px;">${m.date.toLocaleString('es-PY', { hour12: false })}</td>
                    <td style="padding: 4px 8px;">${m.type}</td>
                    <td style="padding: 4px 8px;">${m.description}</td>
                    <td style="padding: 4px 8px;">${m.motivo || '-'}</td>
                    <td style="padding: 4px 8px;">${m.usuario}</td>
                    <td style="padding: 4px 8px;">${m.paymentMethod}</td>
                    <td style="padding: 4px 8px; color: ${m.income > 0 ? 'green' : 'inherit'}; text-align: right;">${m.income > 0 ? formatCurrency(m.income) : '-'}</td>
                    <td style="padding: 4px 8px; color: ${m.expense > 0 ? 'red' : 'inherit'}; text-align: right;">${m.expense > 0 ? formatCurrency(m.expense) : '-'}</td>
                    <td style="padding: 4px 8px; font-weight: bold; text-align: right;">${formatCurrency(runningBalance)}</td>
                </tr>`;
                tbody.innerHTML += row;
            });

            if (document.getElementById('totalPettyCash')) document.getElementById('totalPettyCash').textContent = formatCurrency(pettyCashTotal);
            if (document.getElementById('totalRevenue')) document.getElementById('totalRevenue').textContent = formatCurrency(revenueTotal);
            if (document.getElementById('totalCashBox')) document.getElementById('totalCashBox').textContent = formatCurrency(runningBalance);
            if (document.getElementById('totalCashIncome')) {
                document.getElementById('totalCashIncome').textContent = formatCurrency(cashIncomeTotal);
            }
        }

        // Patients small table in Movements
        const patientsTbody = document.getElementById('patientsBody');
        if (patientsTbody) {
            patientsTbody.innerHTML = '';
            let filteredPatients = patients;
            if (dateFrom && dateTo) {
                filteredPatients = filteredPatients.filter(p => {
                    const pDate = new Date(p.fechaIngreso);
                    return pDate >= dateFrom && pDate <= dateTo;
                });
            }
            filteredPatients.sort((a, b) => new Date(a.fechaIngreso) - new Date(b.fechaIngreso));
            filteredPatients.forEach(p => {
                const clientName = p.clientId ? clientsLookup[p.clientId] || 'Cliente Desconocido' : '-';
                const row = `<tr>
                    <td style="padding: 4px 8px;">${new Date(p.fechaIngreso).toLocaleString('es-PY', { hour12: false })}</td>
                    <td style="padding: 4px 8px;">${clientName}</td>
                    <td style="padding: 4px 8px;">${p.motivoConsulta || '-'}</td>
                    <td style="padding: 4px 8px;">${p.usuario || 'Sistema'}</td>
                    <td style="padding: 4px 8px; text-align: right;">${formatCurrency(p.monto)}</td>
                </tr>`;
                patientsTbody.innerHTML += row;
            });
        }

        if (!dateFrom && !dateTo) allMovementsData = allMovements;

    } catch (e) { console.error("Error loading movements:", e); }
}

// --- Exports Logic ---
window.openExportModal = function () {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('exportDateFrom').value = today;
    document.getElementById('exportDateTo').value = today;
    document.getElementById('exportModal').classList.add('active');
}

window.closeExportModal = function () {
    document.getElementById('exportModal').classList.remove('active');
}

window.executeExport = async function () {
    const dateFromStr = document.getElementById('exportDateFrom').value;
    const dateToStr = document.getElementById('exportDateTo').value;
    const [yearFrom, monthFrom, dayFrom] = dateFromStr.split('-').map(Number);
    const dateFrom = new Date(yearFrom, monthFrom - 1, dayFrom, 0, 0, 0, 0);
    const [yearTo, monthTo, dayTo] = dateToStr.split('-').map(Number);
    const dateTo = new Date(yearTo, monthTo - 1, dayTo, 23, 59, 59, 999);

    if (!allMovementsData || allMovementsData.length === 0) {
        await loadMovements();
    }

    const filtered = allMovementsData.filter(m => m.date >= dateFrom && m.date <= dateTo);
    if (filtered.length === 0) {
        showNotification('No hay movimientos', 'warning');
        return;
    }

    const excelData = [];
    let runningBalance = 0;
    filtered.forEach(m => {
        runningBalance += (m.income - m.expense);
        excelData.push({
            'Fecha': m.date.toLocaleString('es-PY', { hour12: false }),
            'Tipo': m.type,
            'Descripción': m.description,
            'Motivo': m.motivo || '-',
            'Método Pago': m.paymentMethod,
            'Ingreso': m.income > 0 ? m.income.toLocaleString('es-PY') + ' Gs.' : '',
            'Egreso': m.expense > 0 ? m.expense.toLocaleString('es-PY') + ' Gs.' : '',
            'Saldo Acumulado': runningBalance.toLocaleString('es-PY') + ' Gs.'
        });
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Movimientos');
    XLSX.writeFile(wb, `Movimientos_${dateFromStr}_${dateToStr}.xlsx`);
    closeExportModal();
    showNotification('Exportado exitosamente', 'success');
}

// --- Init ---

export function init() {
    // Patient Form
    const pForm = document.getElementById('patientForm');
    if (pForm) {
        pForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const clientId = document.getElementById('patientClientId').value;
            const patientName = document.getElementById('patientName').value;

            if (!clientId && !patientName) {
                showNotification('Por favor seleccione un cliente o ingrese el nombre', 'warning');
                return;
            }

            const data = {
                fechaIngreso: document.getElementById('patientDate').value,
                monto: parseFloat(document.getElementById('patientAmount').value),
                saldo: parseFloat(document.getElementById('patientBalance').value || 0),
                observacion: document.getElementById('patientObservation').value,
                metodoPago: document.getElementById('patientPaymentMethod').value
            };

            if (clientId) {
                data.clientId = parseInt(clientId);
                data.motivoConsulta = document.getElementById('patientVisitReason').value;
            } else {
                data.nombre = patientName;
                data.telefono = document.getElementById('patientPhone').value;
            }

            await postData('/api/patient', data, () => loadPatients());
            e.target.reset();
            document.getElementById('patientClientId').value = '';
        });

        // Client Search in Patient Form
        const input = document.getElementById('patientClientSearch');
        if (input) {
            input.addEventListener('input', (e) => {
                const val = e.target.value;
                const client = getClientByRuc(val);
                if (client) {
                    document.getElementById('patientClientId').value = client.id;
                    document.getElementById('patientName').value = client.razonSocial;
                    document.getElementById('patientPhone').value = client.telefono || '';
                } else {
                    document.getElementById('patientClientId').value = '';
                    document.getElementById('patientName').value = '';
                    document.getElementById('patientPhone').value = '';
                }
            });
        }
    }

    // Income Forms
    const pcForm = document.getElementById('pettyCashForm');
    if (pcForm) {
        pcForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                fecha: document.getElementById('pettyCashDate').value,
                observacion: document.getElementById('pettyCashObservation').value || 'Apertura de Caja',
                monto: parseFloat(document.getElementById('pettyCashAmount').value),
                tipo: 'CAJA_CHICA',
                metodoPago: document.getElementById('pettyCashPaymentMethod').value
            };
            await postData('/api/income', data, loadDailySummary); // Reload all?
            e.target.reset();
            showNotification('Caja Chica abierta', 'success');
        });
    }

    const iForm = document.getElementById('incomeForm');
    if (iForm) {
        iForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                fecha: document.getElementById('incomeDate').value,
                observacion: document.getElementById('incomeConcept').value + (document.getElementById('incomeObservation').value ? ' - ' + document.getElementById('incomeObservation').value : ''),
                monto: parseFloat(document.getElementById('incomeAmount').value),
                tipo: 'VENTA',
                metodoPago: document.getElementById('incomePaymentMethod').value
            };
            await postData('/api/income', data, loadDailySummary);
            e.target.reset();
        });
    }

    // Expense Form
    const eForm = document.getElementById('expenseForm');
    if (eForm) {
        eForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                fecha: document.getElementById('expenseDate').value,
                beneficiario: document.getElementById('expenseConcept').value + ' (' + document.getElementById('expenseCategory').value + ')',
                monto: parseFloat(document.getElementById('expenseAmount').value),
                metodoPago: document.getElementById('expensePaymentMethod').value
            };
            await postData('/api/expense', data, loadExpenses);
            e.target.reset();
        });
    }
}
