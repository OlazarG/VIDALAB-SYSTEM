const getLocalStr = (d) => {
    const date = d || new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

window.loadMovements = async function (dateFrom = null, dateTo = null, render = true) {
    try {
        const dateStartStr = dateFrom ? getLocalStr(dateFrom) : getLocalStr();
        const dateEndStr = dateTo ? getLocalStr(dateTo) : dateStartStr;

        // Use Promise.allSettled to be more robust, or just Promise.all
        // Request large page size to get "all" records for the daily report aggregation
        // Since we moved to pagination, the default is 20, which breaks this report. we request 10000 to be safe.
        const [patientsRes, incomesRes, expensesRes, clientsRes, summaryRes] = await Promise.all([
            fetch(`/api/patient?startDate=${dateStartStr}&endDate=${dateEndStr}&size=10000`),
            fetch(`/api/income?startDate=${dateStartStr}&endDate=${dateEndStr}&size=10000`),
            fetch(`/api/expense?startDate=${dateStartStr}&endDate=${dateEndStr}&size=10000`),
            fetch('/api/clientes?size=10000'), // We need all clients for the lookup map
            fetch(`/api/caja/summary?date=${dateStartStr}`)
        ]);

        // Helper to get array from potential Page object
        const getContent = async (res) => {
            const data = await res.json();
            return Array.isArray(data) ? data : (data.content || []);
        };

        const patients = await getContent(patientsRes);
        const incomes = await getContent(incomesRes);
        const expenses = await getContent(expensesRes);
        const clients = await getContent(clientsRes);

        // Expose globally for other tabs
        window.allPatientsData = patients;
        window.allClientsData = clients;

        let summaryData = null;
        try {
            summaryData = await summaryRes.json();
        } catch (e) { console.warn("Could not load summary data", e); }

        // Store summary data globally
        window.currentDailySummary = summaryData;
        if (typeof updateClosureDashboard === 'function') {
            updateClosureDashboard(summaryData);
        }

        // Create client lookup map
        const clientsLookup = {};
        if (Array.isArray(clients)) {
            clients.forEach(c => {
                clientsLookup[c.id] = c.razonSocial;
            });
        }

        let allMovements = [];

        // Normalize Data
        patients.forEach(p => {
            const clientName = p.clientId ? clientsLookup[p.clientId] || 'Cliente Desconocido' : (p.nombre || 'Sin Cliente');
            allMovements.push({
                date: new Date(p.fechaIngreso),
                type: 'Ingreso',
                category: 'VENTA',
                description: clientName,
                motivo: p.motivoConsulta ? (p.motivoConsulta + (p.motivoEdicion ? ` <span style="font-size: 0.85em; color: #e65100; font-style: italic;">(Editado: ${p.motivoEdicion})</span>` : '')) : '-',
                usuario: p.usuario || 'Sistema',
                paymentMethod: p.metodoPago || 'Efectivo',
                income: p.monto,
                expense: 0,
                originalData: p // Keep original for details like motivoEdicion
            });
        });

        incomes.forEach(i => {
            if (i.tipo === 'CIERRE_CAJA') {
                try {
                    const details = JSON.parse(i.observacion);
                    const diff = details.diferencia || 0;
                    const diffColor = diff === 0 ? '#2e7d32' : (diff > 0 ? '#2e7d32' : '#c62828');
                    const diffText = diff === 0 ? 'Exacto' : (diff > 0 ? `Sobrante: ${formatCurrency(diff)}` : `Faltante: ${formatCurrency(diff)}`);

                    allMovements.push({
                        date: new Date(i.fecha),
                        type: 'CIERRE DE CAJA',
                        category: 'CIERRE',
                        description: 'Cierre de Caja Diario',
                        motivo: details.observaciones || '',
                        usuario: i.usuario || 'Sistema',
                        paymentMethod: 'N/A',
                        income: 0,
                        expense: 0,
                        isClosure: true,
                        closureDetails: {
                            expectedCash: details.expectedCash,
                            realCash: details.realCash,
                            diff: diff,
                            diffText: diffText,
                            diffColor: diffColor,
                            // Map new fields
                            totalEfectivo: details.totalEfectivo,
                            digitalTotal: details.digitalTotal,
                            saldoAcumulado: details.saldoAcumulado
                        }
                    });
                } catch (e) {
                    allMovements.push({
                        date: new Date(i.fecha), type: 'CIERRE DE CAJA', category: 'CIERRE', description: 'Cierre de Caja (Error)', motivo: '-', usuario: i.usuario || 'Sistema', paymentMethod: 'N/A', income: 0, expense: 0, isClosure: true, closureDetails: null
                    });
                }
            } else {
                allMovements.push({
                    date: new Date(i.fecha),
                    type: i.tipo === 'CAJA_CHICA' ? 'Caja Chica' : 'Otro Ingreso',
                    category: i.tipo || 'VENTA',
                    description: i.observacion,
                    motivo: i.motivoEdicion ? `<span style="font-size: 0.85em; color: #e65100; font-style: italic;">Editado: ${i.motivoEdicion}</span>` : '-', // Styled edit reason with standard prefix
                    usuario: i.usuario || 'Sistema',
                    paymentMethod: i.metodoPago || 'Efectivo',
                    income: i.monto,
                    expense: 0,
                    originalData: i
                });
            }
        });

        expenses.forEach(e => {
            allMovements.push({
                date: new Date(e.fecha),
                type: 'Egreso',
                category: e.categoria || 'EGRESO',
                description: e.beneficiario,
                description: e.beneficiario,
                motivo: e.motivoEdicion ? `<span style="font-size: 0.85em; color: #e65100; font-style: italic;">Editado: ${e.motivoEdicion}</span>` : '-', // Styled edit reason with standard prefix
                usuario: e.usuario || 'Sistema',
                paymentMethod: e.metodoPago || 'Efectivo',
                income: 0,
                expense: e.monto,
                originalData: e
            });
        });

        // Sort by Date
        allMovements.sort((a, b) => a.date - b.date);

        // Filter by date range if provided
        if (dateFrom && dateTo) {
            allMovements = allMovements.filter(m => {
                return m.date >= dateFrom && m.date <= dateTo;
            });
        }

        if (render) {
            const tbody = document.getElementById('movementsBody');
            if (tbody) {
                tbody.innerHTML = '';
                let runningBalance = 0;

                // Variables for Sticky Header
                let totalIngresosView = 0;
                let totalEgresosView = 0;
                let totalAperturaCaja = 0;

                // New separated counters
                let cashIncome = 0;
                let cashExpense = 0;
                let digitalIncome = 0;
                let digitalExpense = 0;

                allMovements.forEach(m => {
                    if (!m.isClosure) {
                        // Global totals (keep for reference/saldo total)
                        runningBalance += (m.income - m.expense);

                        // Exclude Apertura de Caja (identified as 'Caja Chica') from Header Totals
                        if (m.type !== 'Caja Chica') {
                            totalIngresosView += m.income;
                        }
                        totalEgresosView += m.expense;

                        // Append Edit Reason if exists
                        // Append Edit Reason if exists AND not already in 'motivo' column
                        let descriptionDisplay = m.description;
                        if (m.originalData && m.originalData.motivoEdicion) {
                            // If the main motive column already shows the edit reason (e.g. Incomes/Expenses/Patients), don't duplicate it in description
                            // Check if motivo contains the edit reason (since we now append it styled)
                            if (!m.motivo.includes(m.originalData.motivoEdicion)) {
                                descriptionDisplay += ` <span style="font-size: 0.85em; color: #e65100; font-style: italic;">(Editado: ${m.originalData.motivoEdicion})</span>`;
                            }
                        }

                        // Classification by Payment Method
                        // Normalize payment method check (case insensitive or partial match could be safer, but strict for now)
                        const isCash = m.paymentMethod === 'Efectivo';

                        if (m.income > 0) {
                            if (isCash) {
                                // Exclude Apertura from Cash Income Counter for header
                                if (m.type !== 'Caja Chica') {
                                    cashIncome += m.income;
                                }
                            }
                            else digitalIncome += m.income;
                        }

                        if (m.expense > 0) {
                            if (isCash) cashExpense += m.expense;
                            else digitalExpense += m.expense;
                        }

                        if (m.type === 'Caja Chica') {
                            totalAperturaCaja += m.income;
                            // Apertura de Caja Styling (Green)
                            const openingHtml = `
                                <td colspan="9" style="padding: 0;">
                                    <div class="closure-row-content" style="background: #e8f5e9; border-left: 5px solid #4caf50; padding: 15px; display: flex; align-items: center; justify-content: space-between; margin: 10px 0;">
                                        <div style="display: flex; gap: 15px; align-items: center;">
                                            <div style="background: #4caf50; color: white; padding: 10px; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                                                <i class="fas fa-door-open"></i>
                                            </div>
                                            <div>
                                                <h4 style="margin: 0; color: #2e7d32;">APERTURA DE CAJA</h4>
                                                <span style="font-size: 0.9em; color: #555;">${m.date.toLocaleString('es-PY', { hour12: false })}</span>
                                            </div>
                                        </div>
                                        <div style="display: flex; gap: 30px; text-align: center;">
                                            <div>
                                                <div style="font-size: 0.8em; color: #555;">Monto Inicial</div>
                                                <strong style="color: #333; font-size: 1.1em;">${formatCurrency(m.income)}</strong>
                                            </div>
                                            <div>
                                                <div style="font-size: 0.8em; color: #555;">Responsable</div>
                                                <strong style="color: #333;">${m.usuario}</strong>
                                            </div>
                                        </div>
                                        <div style="max-width: 200px; font-size: 0.85em; color: #666; font-style: italic;">
                                            "${m.motivo || 'Inicio de operaciones'}"
                                        </div>
                                    </div>
                                </td>`;
                            tbody.innerHTML += `<tr class="opening-row-tr">${openingHtml}</tr>`;

                        } else if (m.category === 'RECEPCION_TURNO') {
                            // Handover Logic
                            // This does NOT affect the calculations for THIS shift's running balance in the same way (it's a check point)
                            // But usually we subtract it from the view totals if we don't want to double count? 
                            // The user previous prompt said: "exclude them from balance and total income calculations"
                            // So we reverse the addition we just did above for global views?
                            runningBalance -= (m.income);
                            totalIngresosView -= m.income;
                            // Also reverse from our new counters
                            if (isCash) cashIncome -= m.income;
                            else digitalIncome -= m.income;


                            // Handover Styling (Blue)
                            const handoverHtml = `
                                <td colspan="9" style="padding: 0;">
                                    <div class="closure-row-content" style="background: #e3f2fd; border-left: 5px solid #2196f3; padding: 15px; display: flex; align-items: center; justify-content: space-between; margin: 10px 0;">
                                        <div style="display: flex; gap: 15px; align-items: center;">
                                            <div style="background: #2196f3; color: white; padding: 10px; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                                                <i class="fas fa-hand-holding-usd"></i>
                                            </div>
                                            <div>
                                                <h4 style="margin: 0; color: #1565c0;">RECEPCIÓN DE TURNO</h4>
                                                <span style="font-size: 0.9em; color: #555;">${m.date.toLocaleString('es-PY', { hour12: false })}</span>
                                            </div>
                                        </div>
                                        <div style="display: flex; gap: 30px; text-align: center;">
                                            <div>
                                                <div style="font-size: 0.8em; color: #555;">Monto Verificado</div>
                                                <strong style="color: #333; font-size: 1.1em;">${formatCurrency(m.income)}</strong>
                                            </div>
                                            <div>
                                                <div style="font-size: 0.8em; color: #555;">Responsable</div>
                                                <strong style="color: #333;">${m.usuario}</strong>
                                            </div>
                                        </div>
                                        <div style="max-width: 200px; font-size: 0.85em; color: #666; font-style: italic;">
                                            "${m.motivo || 'Traspaso de caja'}"
                                        </div>
                                    </div>
                                </td>`;
                            tbody.innerHTML += `<tr class="handover-row-tr">${handoverHtml}</tr>`;

                        } else {
                            // Normal Row Logic
                            // Nothing special calculation-wise, already handled at top of loop

                            // RENDER STANDARD ROW
                            const row = `<tr>
                                <td style="padding: 4px 8px;">${m.date.toLocaleString('es-PY', { hour12: false })}</td>
                                <td style="padding: 4px 8px;">
                                    <span class="badge ${m.type === 'Ingreso' ? 'badge-success' : 'badge-danger'}">${m.type}</span>
                                </td>
                                <td style="padding: 4px 8px;" title="${m.description}">${descriptionDisplay}</td>
                                <td style="padding: 4px 8px;">${m.motivo || '-'}</td>
                                <td style="padding: 4px 8px;">${m.usuario}</td>
                                <td style="padding: 4px 8px;">${m.paymentMethod}</td>
                                <td style="padding: 4px 8px; color: ${m.income > 0 ? 'green' : 'inherit'}; text-align: right;">${m.income > 0 ? formatCurrency(m.income) : '-'}</td>
                                <td style="padding: 4px 8px; color: ${m.expense > 0 ? 'red' : 'inherit'}; text-align: right;">${m.expense > 0 ? formatCurrency(m.expense) : '-'}</td>
                                <td style="padding: 4px 8px; font-weight: bold; text-align: right;">${formatCurrency(runningBalance)}</td>
                            </tr>`;
                            tbody.innerHTML += row;
                        }
                    }

                    if (m.isClosure) {
                        // Render CLOSURE ROW
                        let closureHtml = '';
                        if (m.closureDetails) {
                            closureHtml = `
                                <td colspan="9" style="padding: 0;">
                                    <div class="closure-row-content" style="background: #fff3e0; border-left: 5px solid #ff9800; padding: 15px; display: flex; align-items: center; justify-content: space-between; margin: 10px 0;">
                                        <div style="display: flex; gap: 15px; align-items: center;">
                                            <div style="background: #ff9800; color: white; padding: 10px; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                                                <i class="fas fa-check"></i>
                                            </div>
                                            <div>
                                                <h4 style="margin: 0; color: #e65100;">CIERRE DE CAJA</h4>
                                                <span style="font-size: 0.9em; color: #555;">${m.date.toLocaleString('es-PY', { hour12: false })}</span>
                                            </div>
                                        </div>
                                        
                                        <div style="display: flex; gap: 30px; text-align: center;">
                                            <div style="background: rgba(255, 255, 255, 0.5); padding: 5px 10px; border-radius: 8px;">
                                                <div style="font-size: 0.75em; color: #555;">Efectivo en Caja</div>
                                                <strong style="color: #2e7d32;">${formatCurrency(m.closureDetails.totalEfectivo || 0)}</strong>
                                            </div>
                                            <div style="background: rgba(255, 255, 255, 0.5); padding: 5px 10px; border-radius: 8px;">
                                                <div style="font-size: 0.75em; color: #555;">Digital Neto</div>
                                                <strong style="color: #7b1fa2;">${formatCurrency(m.closureDetails.digitalTotal || 0)}</strong>
                                            </div>
                                            <div style="background: rgba(255, 255, 255, 0.5); padding: 5px 10px; border-radius: 8px;">
                                                <div style="font-size: 0.75em; color: #555;">Saldo Total</div>
                                                <strong style="color: #1565c0;">${formatCurrency(m.closureDetails.saldoAcumulado || 0)}</strong>
                                            </div>
                                            
                                            <div style="border-left: 1px solid #ddd; padding-left: 15px;">
                                                <div style="font-size: 0.8em; color: #555;">Esperado</div>
                                                <strong style="color: #333;">${formatCurrency(m.closureDetails.expectedCash)}</strong>
                                            </div>
                                            <div>
                                                <div style="font-size: 0.8em; color: #555;">Declarado</div>
                                                <strong style="color: #333;">${formatCurrency(m.closureDetails.realCash)}</strong>
                                            </div>
                                            <div>
                                                <div style="font-size: 0.8em; color: #555;">Diferencia</div>
                                                <strong style="color: ${m.closureDetails.diffColor};">${m.closureDetails.diffText}</strong>
                                            </div>
                                            <div>
                                                <div style="font-size: 0.8em; color: #555;">Responsable</div>
                                                <strong style="color: #333;">${m.usuario}</strong>
                                            </div>
                                        </div>
                                        
                                        <div style="max-width: 200px; font-size: 0.85em; color: #666; font-style: italic;">
                                            "${m.motivo}"
                                        </div>
                                    </div>
                                </td>`;
                        } else {
                            closureHtml = `<td colspan="9">Error en datos de cierre</td>`;
                        }
                        tbody.innerHTML += `<tr class="closure-row-tr">${closureHtml}</tr>`;
                    }
                });

                // Update Sticky Header Totals
                const headerIngresos = document.getElementById('headerTotalIngresos');
                const headerEgresos = document.getElementById('headerTotalEgresos');
                const headerSaldo = document.getElementById('headerSaldoTotal');
                const headerRecaudacion = document.getElementById('headerRecaudacionTotal');
                const headerDigital = document.getElementById('headerTotalDigital');

                if (headerIngresos) headerIngresos.textContent = formatCurrency(totalIngresosView);
                if (headerEgresos) headerEgresos.textContent = formatCurrency(totalEgresosView);
                if (headerSaldo) headerSaldo.textContent = formatCurrency(totalIngresosView - totalEgresosView);

                // Efectivo en Caja = Cash Income (inc. Apertura) - Cash Expenses
                // totalAperturaCaja is usually 'Efectivo', so it's already in cashIncome
                if (headerRecaudacion) headerRecaudacion.textContent = formatCurrency(cashIncome - cashExpense);

                if (headerDigital) headerDigital.textContent = formatCurrency(digitalIncome - digitalExpense);
            }
        }

        // --- Populate Cash Operations History (Control de Caja) ---
        const historyGrid = document.getElementById('cashOperationsHistoryGrid');
        if (historyGrid) {
            historyGrid.innerHTML = '';

            // Get Start and End of TODAY
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const ops = allMovements.filter(m => {
                const isToday = m.date >= todayStart && m.date <= todayEnd;
                const isOpType = (m.isClosure) ||
                    (m.category === 'RECEPCION_TURNO') ||
                    (m.type === 'Caja Chica' && m.income > 0); // Valid Apertura heuristic based on existing code
                return isToday && isOpType;
            });

            if (ops.length === 0) {
                historyGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #999; padding: 20px;">No hay operaciones registradas hoy.</div>';
            } else {
                ops.forEach(op => {
                    let typeLabel, typeColor, iconClass, amount;

                    if (op.isClosure) {
                        typeLabel = 'CIERRE DE CAJA';
                        typeColor = '#e65100'; // Orange
                        iconClass = 'fas fa-check';
                        // Safety check for closure details
                        amount = (op.closureDetails && op.closureDetails.realCash) ? op.closureDetails.realCash : 0;
                    } else if (op.category === 'RECEPCION_TURNO') {
                        typeLabel = 'RECEPCIÓN DE TURNO';
                        typeColor = '#1565c0'; // Blue
                        iconClass = 'fas fa-hand-holding-usd';
                        amount = op.income || 0;
                    } else {
                        typeLabel = 'APERTURA DE CAJA';
                        typeColor = '#2e7d32'; // Green
                        iconClass = 'fas fa-door-open';
                        amount = op.income;
                    }

                    const card = document.createElement('div');
                    card.style.cssText = `background: white; border: 1px solid #ddd; border-left: 4px solid ${typeColor}; border-radius: 6px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);`;
                    card.innerHTML = `
                        <div style="display: flex; gap: 12px; align-items: flex-start;">
                            <div style="background: ${typeColor}15; color: ${typeColor}; padding: 8px; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <i class="${iconClass}"></i>
                            </div>
                            <div style="flex: 1;">
                                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                                    <h5 style="margin: 0; color: ${typeColor}; font-weight: 600;">${typeLabel}</h5>
                                    <span style="font-size: 0.8em; color: #666;">${op.date.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div style="font-size: 0.9em; color: #333; margin-bottom: 4px;">
                                    <strong>${formatCurrency(amount)}</strong> <span style="color: #666; font-size: 0.9em;">(Declarado)</span>
                                </div>
                                <div style="font-size: 0.85em; color: #666;">
                                    <i class="fas fa-user-circle" style="font-size: 0.9em;"></i> ${op.usuario}
                                </div>
                                ${op.motivo ? `<div style="font-size: 0.8em; color: #888; margin-top: 5px; font-style: italic;">"${op.motivo}"</div>` : ''}
                            </div>
                        </div>
                    `;
                    historyGrid.appendChild(card);
                });
            }
        }

        // --- Populate Patients Table ---
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

        if (typeof document.getElementById('totalCashBox') !== 'undefined' && document.getElementById('totalCashBox')) {
            // document.getElementById('totalCashBox').textContent = ... // If needed
        }

        if (!dateFrom && !dateTo) {
            window.allMovementsData = allMovements;
        }

    } catch (e) {
        console.error("Error loading movements:", e);
        if (typeof showNotification === 'function') {
            showNotification('Error cargando movimientos: ' + e.message, 'error');
        } else {
            alert('Error cargando movimientos: ' + e.message);
        }
    }
}

// Helper Functions
window.initCashControlTab = function () {
    console.log("Initializing Cash Control Tab");
    loadMovements();
}

window.initPatientsTab = function () {
    console.log("Initializing Patients Tab");
    loadPatients();
}

window.initIncomesTab = function () {
    console.log("Initializing Incomes Tab");
    loadIncomes();
}

window.initExpensesTab = function () {
    console.log("Initializing Expenses Tab");
    loadExpenses();
}

window.updateClosureDashboard = function (data) {
    if (!data) return;

    const expectedCash = data.saldoTeoricoEfectivo;
    const expectedDigital = data.saldoTeoricoDigital;
    const expectedTotal = data.saldoTotal;

    const elExpCash = document.getElementById('expectedCash');
    if (elExpCash) elExpCash.textContent = formatCurrency(expectedCash);

    const elExpDig = document.getElementById('expectedDigital');
    if (elExpDig) elExpDig.textContent = formatCurrency(expectedDigital);

    const elExpTot = document.getElementById('expectedTotal');
    if (elExpTot) elExpTot.textContent = formatCurrency(expectedTotal);

    // Setup real-time calculation logic
    const realCashInput = document.getElementById('realCashInput');
    const diffDisplay = document.getElementById('cashDifferenceDisplay');

    if (realCashInput) {
        realCashInput.oninput = function () {
            let valStr = this.value.replace(/\./g, '').replace(/,/g, '.');
            const val = parseFloat(valStr) || 0;
            const diff = val - expectedCash;

            const diffValInput = document.getElementById('cashDifferenceValue');
            if (diffValInput) diffValInput.value = diff;

            if (diffDisplay) {
                if (Math.abs(diff) < 1 && val > 0) {
                    diffDisplay.textContent = "Exacto (0 ₲)";
                    diffDisplay.style.background = "#e8f5e9";
                    diffDisplay.style.color = "#2e7d32";
                } else if (diff > 0) {
                    diffDisplay.textContent = `Sobrante: +${formatCurrency(diff)}`;
                    diffDisplay.style.background = "#e8f5e9";
                    diffDisplay.style.color = "#2e7d32";
                } else if (diff < 0) {
                    diffDisplay.textContent = `Faltante: ${formatCurrency(diff)}`;
                    diffDisplay.style.background = "#ffebee";
                    diffDisplay.style.color = "#c62828";
                } else {
                    diffDisplay.textContent = "-";
                    diffDisplay.style.background = "#f5f5f5";
                    diffDisplay.style.color = "#999";
                }
            }
        };
    }
}

// Initialize listeners when script loads (or on DOMContentLoaded)
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('autoCashClosureForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!window.currentDailySummary) return;

            const realCashInput = document.getElementById('realCashInput');
            const realCash = parseFloat(realCashInput.value.replace(/\./g, '')) || 0;
            const expectedCash = window.currentDailySummary.saldoTeoricoEfectivo;
            const difference = realCash - expectedCash;

            const closureData = {
                fecha: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, -1),
                tipo: 'CIERRE_CAJA',
                monto: 0,
                observacion: JSON.stringify({
                    expectedCash: expectedCash,
                    realCash: realCash,
                    diferencia: difference,
                    totalIngresado: window.currentDailySummary.totalIngresos,
                    totalEgresado: window.currentDailySummary.totalEgresos,
                    // Save specific snapshots requested
                    totalEfectivo: window.currentDailySummary.saldoTeoricoEfectivo,
                    digitalTotal: window.currentDailySummary.saldoTeoricoDigital,
                    saldoAcumulado: window.currentDailySummary.saldoTotal,
                    cajaChica: window.currentDailySummary.saldoCajaChica || 0,
                    observaciones: document.getElementById('closureObservation').value
                }),
                usuario: document.getElementById('currentUserDisplay') ? document.getElementById('currentUserDisplay').textContent : 'Admin',
                metodoPago: 'N/A'
            };

            try {
                const res = await fetch('/api/income', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(closureData)
                });
                if (res.ok) {
                    if (typeof showNotification === 'function') {
                        showNotification('Cierre registrado correctamente', 'success');
                    } else {
                        alert('Cierre registrado correctamente');
                    }
                    realCashInput.value = '';
                    if (document.getElementById('closureObservation')) document.getElementById('closureObservation').value = '';
                    if (document.getElementById('cashDifferenceDisplay')) document.getElementById('cashDifferenceDisplay').textContent = '-';

                    loadMovements();
                } else {
                    if (typeof showNotification === 'function') {
                        showNotification('Error al registrar cierre', 'error');
                    } else {
                        alert('Error al registrar cierre');
                    }
                }
            } catch (err) { console.error(err); }
        });
    }
});


// --- Pagination Implementation ---

const paginationState = {
    pacientes: { page: 0, size: 20 },
    ingresos: { page: 0, size: 20 },
    egresos: { page: 0, size: 20 },
    clientes: { page: 0, size: 20 }
};

window.changePageSize = function (type, size) {
    paginationState[type].size = parseInt(size);
    paginationState[type].page = 0;
    reloadGrid(type);
};

window.prevPage = function (type) {
    if (paginationState[type].page > 0) {
        paginationState[type].page--;
        reloadGrid(type);
    }
};

window.nextPage = function (type) {
    paginationState[type].page++;
    reloadGrid(type);
};

function reloadGrid(type) {
    if (type === 'pacientes') filterPatients();
    else if (type === 'ingresos') filterIncomes();
    else if (type === 'egresos') filterExpenses();
    else if (type === 'clientes') loadClientsTable();
}

function updatePaginationControls(type, data) {
    const pageInfo = document.getElementById(`pageInfo-${type}`);
    if (pageInfo) {
        pageInfo.textContent = `Página ${data.number + 1} de ${data.totalPages}`;
    }
}

// Global scope overriding
window.loadClientsTable = async function () {
    try {
        const { page, size } = paginationState.clientes;
        const res = await fetch(`/api/clientes?page=${page}&size=${size}`);
        if (!res.ok) throw new Error('Failed to load clients');
        const pageData = await res.json();
        const clients = pageData.content;

        // Populate global allClientsData if needed (maybe separate fetch if strictly needed for lookup)
        // Here assuming we only rely on what's visible or a separate full load
        // But for consistency let's update it partially or logic will fail?
        // Actually, Datalist needs ALL clients.
        // We can check if window.allClientsData is populated, if not fetch ALL once.
        if (!window.allClientsData || window.allClientsData.length === 0) {
            // Background fetch all for autocomplete coverage
            fetch('/api/clientes?size=10000').then(r => r.json()).then(pageObj => {
                const all = pageObj.content || [];
                window.allClientsData = all;
                // Re-run autocomplete population if needed
                if (typeof loadClientsForPatientForm === 'function') {
                    loadClientsForPatientForm();
                }
            });
        }

        const tbody = document.getElementById('clientsTableBody');

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
        updatePaginationControls('clientes', pageData);

    } catch (e) { console.error(e); }
}

// Helper to set date inputs to today if empty
// Helper to set date inputs to today if empty
function setTodayDateInputs(fromId, toId) {
    try {
        const fromInput = document.getElementById(fromId);
        const toInput = document.getElementById(toId);

        // Use local time YYYY-MM-DD to avoid UTC issues
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        if (fromInput && !fromInput.value) {
            fromInput.value = todayStr;
        }
        if (toInput && !toInput.value) {
            toInput.value = todayStr;
        }
    } catch (e) { console.error("Error setting default dates:", e); }
}

window.initPatientsTab = function () {
    console.log("Initializing Patients Tab");
    setTodayDateInputs('patientsDateFrom', 'patientsDateTo');
    paginationState.pacientes.page = 0;
    // Call filterPatients instead of loadPatients so it picks up the date values
    filterPatients();
}

window.initIncomesTab = function () {
    console.log("Initializing Incomes Tab");
    setTodayDateInputs('incomesDateFrom', 'incomesDateTo');
    paginationState.ingresos.page = 0;
    filterIncomes();
}

window.initExpensesTab = function () {
    console.log("Initializing Expenses Tab");
    setTodayDateInputs('expensesDateFrom', 'expensesDateTo');
    paginationState.egresos.page = 0;
    filterExpenses();
}

window.loadClientsGridTab = function () {
    console.log("Initializing Clients Tab");
    paginationState.clientes.page = 0;
    loadClientsTable();
}


// --- 4. PATIENTS MANAGEMENT ---

window.loadPatients = async function (dateFrom = null, dateTo = null) {
    try {
        // Fallback to inputs if no arguments provided (e.g. pagination)
        if (!dateFrom && !dateTo) {
            const inputFrom = document.getElementById('patientsDateFrom');
            const inputTo = document.getElementById('patientsDateTo');
            if (inputFrom && inputFrom.value && inputTo && inputTo.value) {
                const [y1, m1, d1] = inputFrom.value.split('-');
                const [y2, m2, d2] = inputTo.value.split('-');
                dateFrom = new Date(y1, m1 - 1, d1);
                dateTo = new Date(y2, m2 - 1, d2);
            }
        }

        const { page, size } = paginationState.pacientes;
        let url = `/api/patient?page=${page}&size=${size}`;

        // Use arguments or fallback to inputs if null (standard behavior)
        // But logic is cleaner if we just rely on arguments passed from filterPatients
        // We will make filterPatients the primary driver which reads inputs.

        if (dateFrom && dateTo) {
            const dateStartStr = dateFrom.toISOString().split('T')[0];
            const dateEndStr = dateTo.toISOString().split('T')[0];
            url += `&startDate=${dateStartStr}&endDate=${dateEndStr}`;
        }

        const [patientsRes, clientsRes] = await Promise.all([
            fetch(url),
            fetch('/api/clientes?size=10000') // Fetch ALL clients for lookup
        ]);

        if (!patientsRes.ok) {
            const text = await patientsRes.text();
            if (patientsRes.status === 401 || patientsRes.status === 403 || text.includes('Login')) {
                window.location.href = '/login.html';
                return;
            }
            throw new Error('Failed to load patients: ' + patientsRes.status);
        }

        // Check if response is JSON (not HTML redirect)
        const contentType = patientsRes.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") === -1) {
            console.error("Received HTML instead of JSON. Redirecting to login.");
            window.location.href = '/login.html';
            return;
        }

        const pageData = await patientsRes.json();
        const patients = pageData.content;
        window.allPatientsData = patients; // Update global state for edit functionality

        let clients = [];
        if (clientsRes.ok) {
            try {
                const clientsPage = await clientsRes.json();
                clients = clientsPage.content || [];
            } catch (e) { console.warn("Error parsing clients", e); }
        }

        window.allClientsData = clients;

        if (typeof window.clientsLookup === 'undefined') window.clientsLookup = {};
        let localClientsLookup = {};
        clients.forEach(c => {
            localClientsLookup[c.id] = { nombre: c.razonSocial, telefono: c.telefono, ruc: c.ruc };
            if (typeof window.patientClientsMap !== 'undefined') window.patientClientsMap[c.ruc] = c;
        });
        window.clientsLookup = localClientsLookup; // Ensure global access

        const tbody = document.getElementById('patientTableBody');
        if (tbody) {
            tbody.innerHTML = '';
            if (patients.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No hay pacientes registrados</td></tr>';
            } else {
                patients.forEach(p => {
                    let clientName = p.nombreCliente || 'Sin Cliente';
                    if (clientName === 'Sin Cliente' && p.nombre) clientName = p.nombre;

                    const row = `<tr>
                        <td>${new Date(p.fechaIngreso).toLocaleString('es-PY')}</td>
                        <td>${clientName}</td>
                        <td>${p.motivoConsulta ? (p.motivoConsulta + (p.motivoEdicion ? ` <span style="font-size:0.85em; color:#e65100; font-style:italic;">(Editado: ${p.motivoEdicion})</span>` : '')) : '-'}</td>
                        <td style="text-align: right;">${formatCurrency(p.monto)}</td>
                        <td style="text-align: right;">${formatCurrency(p.saldo)}</td>
                        <td>${p.telefono || '-'}</td>
                        <td>${p.metodoPago || 'Efectivo'}</td>
                        <td class="actions">
                             <i class="fas fa-edit action-btn" title="Editar" onclick="editPatient(event, ${p.id})"></i>
                        </td>
                    </tr>`;
                    tbody.innerHTML += row;
                });
            }
        }

        updatePaginationControls('pacientes', pageData);

    } catch (e) {
        console.error(e);
        if (typeof showNotification === 'function') {
            showNotification('Error cargando pacientes: ' + e.message, 'error');
        }
    }
}

window.filterPatients = function () {
    paginationState.pacientes.page = 0; // Reset pagination
    const dateFromStr = document.getElementById('patientsDateFrom').value;
    const dateToStr = document.getElementById('patientsDateTo').value;
    if (dateFromStr && dateToStr) {
        // Parse explicitly to avoid UTC issues
        const [y1, m1, d1] = dateFromStr.split('-');
        const [y2, m2, d2] = dateToStr.split('-');
        loadPatients(new Date(y1, m1 - 1, d1), new Date(y2, m2 - 1, d2));
    } else {
        loadPatients();
    }
}

window.loadIncomes = async function (dateFrom = null, dateTo = null) {
    try {
        // Fallback to inputs if no arguments provided
        if (!dateFrom && !dateTo) {
            const inputFrom = document.getElementById('incomesDateFrom');
            const inputTo = document.getElementById('incomesDateTo');
            if (inputFrom && inputFrom.value && inputTo && inputTo.value) {
                const [y1, m1, d1] = inputFrom.value.split('-');
                const [y2, m2, d2] = inputTo.value.split('-');
                dateFrom = new Date(y1, m1 - 1, d1);
                dateTo = new Date(y2, m2 - 1, d2);
            }
        }

        const { page, size } = paginationState.ingresos;
        let url = `/api/income?page=${page}&size=${size}`;
        if (dateFrom && dateTo) {
            const dateStartStr = dateFrom.toISOString().split('T')[0];
            const dateEndStr = dateTo.toISOString().split('T')[0];
            url += `&startDate=${dateStartStr}&endDate=${dateEndStr}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load incomes');
        const pageData = await res.json();
        let data = pageData.content;
        data = data.filter(i => i.tipo !== 'CIERRE_CAJA');

        const tbody = document.getElementById('incomeTableBody');
        tbody.innerHTML = '';
        window.allIncomesData = data;

        data.forEach(item => {
            let rowClass = '';
            let tipoDisplay = item.tipo;
            let montoDisplay = formatCurrency(item.monto);
            let editButton = '';
            if (item.tipo !== 'CAJA_CHICA' && item.tipo !== 'RECEPCION_TURNO' && item.tipo !== 'CIERRE_CAJA') {
                editButton = `<i class="fas fa-edit action-btn" title="Editar" onclick="editIncome(${item.id})"></i>`;
            }

            const observacionDisplay = item.motivoEdicion
                ? `${item.observacion || '-'} <span style="font-size:0.85em; color:#e65100; font-style:italic;">(Editado: ${item.motivoEdicion})</span>`
                : (item.observacion || '-');

            const row = `<tr ${rowClass}>
        <td>${formatDate(item.fecha)}</td>
        <td>${tipoDisplay}</td>
        <td>${observacionDisplay}</td>
                <td style="text-align: right; color: green;">${montoDisplay}</td>
                <td>${item.metodoPago || '-'}</td>
                <td class="actions">${editButton}</td>
            </tr>`;
            tbody.innerHTML += row;
        });

        updatePaginationControls('ingresos', pageData);

    } catch (e) { console.error("Error loading incomes:", e); }
}

window.filterIncomes = function () {
    paginationState.ingresos.page = 0; // Reset pagination
    const dateFromStr = document.getElementById('incomesDateFrom').value;
    const dateToStr = document.getElementById('incomesDateTo').value;
    if (dateFromStr && dateToStr) {
        const [y1, m1, d1] = dateFromStr.split('-');
        const [y2, m2, d2] = dateToStr.split('-');
        loadIncomes(new Date(y1, m1 - 1, d1), new Date(y2, m2 - 1, d2));
    } else {
        loadIncomes();
    }
}

window.loadExpenses = async function (dateFrom = null, dateTo = null) {
    try {
        // Fallback to inputs if no arguments provided
        if (!dateFrom && !dateTo) {
            const inputFrom = document.getElementById('expensesDateFrom');
            const inputTo = document.getElementById('expensesDateTo');
            if (inputFrom && inputFrom.value && inputTo && inputTo.value) {
                const [y1, m1, d1] = inputFrom.value.split('-');
                const [y2, m2, d2] = inputTo.value.split('-');
                dateFrom = new Date(y1, m1 - 1, d1);
                dateTo = new Date(y2, m2 - 1, d2);
            }
        }

        const { page, size } = paginationState.egresos;
        let url = `/api/expense?page=${page}&size=${size}`;
        if (dateFrom && dateTo) {
            const dateStartStr = dateFrom.toISOString().split('T')[0];
            const dateEndStr = dateTo.toISOString().split('T')[0];
            url += `&startDate=${dateStartStr}&endDate=${dateEndStr}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load expenses');
        const pageData = await res.json();
        let data = pageData.content;
        window.allExpensesData = data;

        const tbody = document.getElementById('expenseTableBody');
        tbody.innerHTML = '';
        data.forEach(item => {
            const beneficiaryDisplay = item.motivoEdicion
                ? `${item.beneficiario || '-'} <span style="font-size:0.85em; color:#e65100; font-style:italic;">(Editado: ${item.motivoEdicion})</span>`
                : (item.beneficiario || '-');

            const row = `<tr>
        <td>${formatDate(item.fecha)}</td>
        <td>${beneficiaryDisplay}</td>
        <td style="text-align: right; color: red;">${formatCurrency(item.monto)}</td>
                <td>${item.metodoPago || '-'}</td>
                <td>${item.categoria || '-'}</td>
                <td class="actions">
                     <i class="fas fa-edit action-btn" title="Editar" onclick="editExpense(${item.id})"></i>
                </td>
            </tr>`;
            tbody.innerHTML += row;
        });

        updatePaginationControls('egresos', pageData);
    } catch (e) { console.error(e); }
}

window.filterExpenses = function () {
    paginationState.egresos.page = 0; // Reset pagination
    const dateFromStr = document.getElementById('expensesDateFrom').value;
    const dateToStr = document.getElementById('expensesDateTo').value;
    if (dateFromStr && dateToStr) {
        const [y1, m1, d1] = dateFromStr.split('-');
        const [y2, m2, d2] = dateToStr.split('-');
        loadExpenses(new Date(y1, m1 - 1, d1), new Date(y2, m2 - 1, d2));
    } else {
        loadExpenses();
    }
}

window.filterClients = function () {
    const input = document.getElementById('clientSearchInput');
    if (!input) return;
    const searchTerm = input.value.toLowerCase();

    if (!searchTerm) {
        // Revert to paginated view
        loadClientsTable();
        return;
    }

    const tbody = document.getElementById('clientsTableBody');
    tbody.innerHTML = '';

    // Use window.allClientsData which is populated by loadClientsTable (background fetch)
    const sourceData = window.allClientsData || [];

    const filtered = sourceData.filter(c => {
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

// Global maps for Autocomplete
window.patientClientsMap = {};
window.patientNamesMap = {};

window.loadClientsForPatientForm = async function () {
    try {
        // Reuse global data if available
        let clients = window.allClientsData;
        if (!clients || clients.length === 0) {
            const res = await fetch('/api/clientes?size=10000');
            const pageData = await res.json();
            clients = pageData.content || [];
            window.allClientsData = clients;
        }

        const datalistRuc = document.getElementById('patientClientList');
        if (datalistRuc) datalistRuc.innerHTML = '';
        window.patientClientsMap = {};

        const datalistName = document.getElementById('patientNameList');
        if (datalistName) datalistName.innerHTML = '';
        window.patientNamesMap = {};

        clients.forEach(c => {
            // Populate RUC
            if (datalistRuc) {
                const optionRuc = document.createElement('option');
                optionRuc.value = c.ruc;
                datalistRuc.appendChild(optionRuc);
            }
            window.patientClientsMap[c.ruc] = c;

            // Populate Name
            if (datalistName && c.razonSocial) {
                const optionName = document.createElement('option');
                optionName.value = c.razonSocial;
                datalistName.appendChild(optionName);
                window.patientNamesMap[c.razonSocial] = c;
            }
        });
    } catch (e) { console.error("Error loading clients for patient form:", e); }
}

// --- Missing Functions Implementation ---

window.editPatient = function (event, id) {
    if (event) event.stopPropagation();
    const patient = window.allPatientsData.find(p => p.id === id);
    if (!patient) return;

    // Populate fields
    document.getElementById('patientId').value = patient.id;
    if (patient.fechaIngreso) {
        document.getElementById('patientDate').value = patient.fechaIngreso;
    }

    document.getElementById('patientCategory').value = patient.categoria || 'CONSULTA';
    document.getElementById('patientName').value = patient.nombre || '';
    document.getElementById('patientPhone').value = patient.telefono || '';

    // Handle amount inputs (using the formatted view or raw value?)
    const formatSeparator = window.formatWithSeparators || ((v) => v);
    document.getElementById('patientAmount').value = formatSeparator(patient.monto);
    document.getElementById('patientBalance').value = formatSeparator(patient.saldo);

    document.getElementById('patientPaymentMethod').value = patient.metodoPago || 'Efectivo';
    document.getElementById('patientVisitReason').value = patient.motivoConsulta || '';
    document.getElementById('patientObservation').value = patient.observacion || '';

    // Handle Client
    if (patient.clientId) {
        document.getElementById('patientClientId').value = patient.clientId;
        if (window.clientsLookup && window.clientsLookup[patient.clientId]) {
            const client = window.clientsLookup[patient.clientId];
            document.getElementById('patientClientSearch').value = client.ruc || client.nombre;
        }
    } else {
        document.getElementById('patientClientId').value = '';
        document.getElementById('patientClientSearch').value = '';
    }

    // Show Edit Reason
    const editReasonGroup = document.getElementById('patientEditReasonGroup');
    if (editReasonGroup) {
        editReasonGroup.style.display = 'block';
        document.getElementById('patientEditReason').required = true;
        document.getElementById('patientEditReason').value = '';
    }

    // Change button text
    const btn = document.querySelector('#patientForm button[type="submit"]');
    if (btn) btn.textContent = 'Actualizar Paciente';

    // Scroll to form
    const formContainer = document.querySelector('#tab-pacientes .form-container');
    if (formContainer) formContainer.scrollIntoView({ behavior: 'smooth' });

    if (typeof showNotification === 'function') showNotification('Editando Paciente... (Indique Motivo)', 'info');
}

window.initUltrasoundTab = function () {
    console.log("Initializing Ultrasound Tab");
    setTodayDateInputs('ecoDateFrom', 'ecoDateTo');
    fetchAndFilterUltrasounds();
}

window.fetchAndFilterUltrasounds = async function () {
    try {
        const dateFromStr = document.getElementById('ecoDateFrom').value;
        const dateToStr = document.getElementById('ecoDateTo').value;

        let url = '/api/patient?size=10000';
        if (dateFromStr && dateToStr) {
            url += `&startDate=${dateFromStr}&endDate=${dateToStr}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Error fetching data");

        const pageData = await res.json();
        const allPatients = pageData.content || [];

        // Filter by ECOGRAFIA
        const ecoPatients = allPatients.filter(p => p.categoria === 'ECOGRAFIA');

        const tbody = document.getElementById('ecografiasBody');
        if (tbody) {
            tbody.innerHTML = '';

            let totalIngresos = 0;

            if (ecoPatients.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay ecografías registradas en este periodo</td></tr>';
            } else {
                ecoPatients.forEach(p => {
                    let clientName = p.nombre || 'Sin nombre';
                    // Try to resolve client name from lookup if available
                    if (p.clientId && window.clientsLookup && window.clientsLookup[p.clientId]) {
                        clientName = window.clientsLookup[p.clientId].nombre;
                    } else if (p.nombreCliente && p.nombreCliente !== 'Sin Cliente') {
                        clientName = p.nombreCliente;
                    }

                    const row = `<tr>
                        <td>${new Date(p.fechaIngreso).toLocaleString('es-PY', { hour12: false })}</td>
                        <td>${clientName}</td>
                        <td>${p.motivoConsulta || '-'}</td>
                        <td style="text-align: right;">${formatCurrency(p.monto)}</td>
                        <td style="text-align: right; color: #ef6c00;">${formatCurrency(p.monto * 0.8)}</td>
                        <td>${p.usuario || '-'}</td>
                    </tr>`;
                    tbody.innerHTML += row;

                    totalIngresos += p.monto;
                });
            }

            // Update totals
            const totalDoctor = totalIngresos * 0.8;
            const totalClinica = totalIngresos * 0.2;

            const elTotalEco = document.getElementById('headerTotalEco');
            if (elTotalEco) elTotalEco.textContent = formatCurrency(totalIngresos);

            const elDoctorPay = document.getElementById('headerDoctorPay');
            if (elDoctorPay) elDoctorPay.textContent = formatCurrency(totalDoctor);

            const elClinicShare = document.getElementById('headerClinicShare');
            if (elClinicShare) elClinicShare.textContent = formatCurrency(totalClinica);
        }

    } catch (e) {
        console.error(e);
        if (typeof showNotification === 'function') showNotification('Error cargando ecografías', 'error');
    }
}

// --- Dynamic Category Population ---
window.populatePatientCategories = function() {
    const select = document.getElementById('patientCategory');
    if (!select) return;

    // Check if dynamic options are already added to avoid duplicates
    if (select.getAttribute('data-dynamic-loaded') === 'true') return;

    if (typeof SPECIALTIES_CONFIG !== 'undefined') {
        const sortedKeys = Object.keys(SPECIALTIES_CONFIG).sort((a, b) => 
            SPECIALTIES_CONFIG[a].label.localeCompare(SPECIALTIES_CONFIG[b].label)
        );

        sortedKeys.forEach(key => {
            // Check if option already exists (e.g. ECOGRAFIA is hardcoded)
            let exists = false;
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].value === key) {
                    exists = true;
                    break;
                }
            }

            if (!exists) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = SPECIALTIES_CONFIG[key].label;
                select.appendChild(option);
            }
        });
    }
    
    select.setAttribute('data-dynamic-loaded', 'true');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    populatePatientCategories();
});
