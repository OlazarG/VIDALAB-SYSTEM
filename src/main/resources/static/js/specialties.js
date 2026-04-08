// Logic for Especialidades Section

let currentSpecialtyKey = null;

function initSpecialtiesSection() {
    console.log("Initializing Specialties Section");
    renderSpecialtyTabs();

    // Select the first one by default if not selected
    if (!currentSpecialtyKey) {
        const firstKey = Object.keys(SPECIALTIES_CONFIG)[0];
        if (firstKey) {
            selectSpecialty(firstKey);
        }
    }
}

function renderSpecialtyTabs() {
    const container = document.getElementById('specialtiesTabsContainer');
    if (!container) return;

    container.innerHTML = '';

    Object.keys(SPECIALTIES_CONFIG).forEach(key => {
        const config = SPECIALTIES_CONFIG[key];
        const btn = document.createElement('button');
        btn.className = `tab-btn ${currentSpecialtyKey === key ? 'active' : ''}`;
        btn.textContent = config.label;
        btn.onclick = () => selectSpecialty(key);
        container.appendChild(btn);
    });
}

function selectSpecialty(key) {
    currentSpecialtyKey = key;

    // Update active tab
    const tabs = document.querySelectorAll('#specialtiesTabsContainer .tab-btn');
    tabs.forEach(t => {
        if (t.textContent === SPECIALTIES_CONFIG[key].label) {
            t.classList.add('active');
        } else {
            t.classList.remove('active');
        }
    });

    // Update Header Info
    const config = SPECIALTIES_CONFIG[key];
    const infoText = document.getElementById('specialtyInfoText');
    if (infoText) {
        let ruleText = '';
        if (config.type === 'PERCENTAGE') {
            const dr = Math.round(config.doctor * 100);
            const cl = Math.round((1 - config.doctor) * 100);
            ruleText = `Regla: ${dr}% Doctor / ${cl}% Clínica`;
        } else if (config.type === 'FIXED') {
            ruleText = `Regla: ${formatCurrency(config.doctor)} Fijo Doctor`;
        } else if (config.type === 'COMPLEX') {
            ruleText = `Regla: Diarte 50% / Rodrigo 40% / Clínica 10%`;
        }
        infoText.textContent = `${config.label} - ${ruleText}`;
    }

    // Initialize date inputs if empty
    setTodayDateInputs('specialtyDateFrom', 'specialtyDateTo');

    // Load Data
    loadSpecialtyData(key);
}

async function loadSpecialtyData(key) {
    try {
        const dateFromStr = document.getElementById('specialtyDateFrom').value;
        const dateToStr = document.getElementById('specialtyDateTo').value;

        let url = '/api/patient?size=10000';
        if (dateFromStr && dateToStr) {
            url += `&startDate=${dateFromStr}&endDate=${dateToStr}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Error fetching data");

        const pageData = await res.json();
        const allPatients = pageData.content || [];

        // Filter by Category = Key
        const filteredPatients = allPatients.filter(p => p.categoria === key);

        renderSpecialtyTable(filteredPatients, key);

    } catch (e) {
        console.error(e);
        if (typeof showNotification === 'function') showNotification('Error cargando datos de especialidad', 'error');
    }
}

function renderSpecialtyTable(patients, key) {
    const tbody = document.getElementById('specialtyTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const config = SPECIALTIES_CONFIG[key];

    let totalIngresos = 0;
    let totalDoctor = 0;
    let totalClinica = 0;

    if (patients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay registros en este periodo</td></tr>';
    } else {
        patients.forEach(p => {
            let clientName = p.nombre || 'Sin nombre';
            if (p.clientId && window.clientsLookup && window.clientsLookup[p.clientId]) {
                clientName = window.clientsLookup[p.clientId].nombre;
            } else if (p.nombreCliente && p.nombreCliente !== 'Sin Cliente') {
                clientName = p.nombreCliente;
            }

            // Calculate Split
            let doctorPay = 0;
            let clinicShare = 0;
            let doctorPayDisplay = '';

            if (config.type === 'PERCENTAGE') {
                doctorPay = p.monto * config.doctor;
                clinicShare = p.monto - doctorPay;
                doctorPayDisplay = formatCurrency(doctorPay);
            } else if (config.type === 'FIXED') {
                doctorPay = config.doctor;
                clinicShare = Math.max(0, p.monto - doctorPay);
                doctorPayDisplay = formatCurrency(doctorPay);
            } else if (config.type === 'COMPLEX') {
                // Diarte 50%, Rodrigo 40%, Clinic 10%
                const diarteShare = p.monto * config.rules.diarte;
                const rodrigoShare = p.monto * config.rules.rodrigo;
                doctorPay = diarteShare + rodrigoShare;
                clinicShare = p.monto - doctorPay;

                doctorPayDisplay = `<div style="font-size:0.85em;">
                    <div>Diarte: ${formatCurrency(diarteShare)}</div>
                    <div style="color:#666;">Rodrigo: ${formatCurrency(rodrigoShare)}</div>
                </div>`;
            }

            totalIngresos += p.monto;
            totalDoctor += doctorPay;
            totalClinica += clinicShare;

            const row = `<tr>
                <td>${new Date(p.fechaIngreso).toLocaleString('es-PY', { hour12: false })}</td>
                <td>${clientName}</td>
                <td>${p.motivoConsulta || '-'}</td>
                <td style="text-align: right;">${formatCurrency(p.monto)}</td>
                <td style="text-align: right; color: #ef6c00;">${doctorPayDisplay}</td>
                <td>${p.usuario || '-'}</td>
            </tr>`;
            tbody.innerHTML += row;
        });
    }

    // Update Totals
    document.getElementById('spTotalIngresos').textContent = formatCurrency(totalIngresos);
    document.getElementById('spTotalDoctor').textContent = formatCurrency(totalDoctor);
    document.getElementById('spTotalClinica').textContent = formatCurrency(totalClinica);
}

window.filterSpecialty = function () {
    if (currentSpecialtyKey) {
        loadSpecialtyData(currentSpecialtyKey);
    }
}
