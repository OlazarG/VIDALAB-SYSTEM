
import { postData, fetchData } from '../api.js';
import { showNotification, formatCurrency } from '../utils.js';

let invoiceItems = [];
let clientsMap = {};

window.openModal = function () {
    document.getElementById('invoiceModal').classList.add('active');
    loadClientsForModal();
    toggleCreditFields();
}

window.closeInvoiceModal = function () {
    document.getElementById('invoiceModal').classList.remove('active');
}

window.toggleCreditFields = function () {
    const condition = document.getElementById('invoiceCondition').value;
    const creditGroup = document.getElementById('creditTermGroup');
    if (condition === 'CREDITO') {
        creditGroup.style.display = 'block';
    } else {
        creditGroup.style.display = 'none';
    }
}

window.addInvoiceItem = function () {
    const desc = prompt("Descripción del item:");
    if (!desc) return;
    const qty = parseFloat(prompt("Cantidad:", "1"));
    const price = parseFloat(prompt("Precio Unitario:", "0"));

    if (desc && qty && price) {
        invoiceItems.push({ description: desc, quantity: qty, unitPrice: price });
        renderInvoiceItems();
    }
}

window.removeInvoiceItem = function (index) {
    invoiceItems.splice(index, 1);
    renderInvoiceItems();
}

window.saveInvoice = async function () {
    const ruc = document.getElementById('ruc').value;
    if (!ruc || invoiceItems.length === 0) {
        alert('Debe seleccionar un cliente y agregar items');
        return;
    }

    const invoiceData = {
        rucCliente: ruc,
        razonSocialCliente: document.getElementById('razonSocial').value,
        emailCliente: document.getElementById('email') ? document.getElementById('email').value : null, // defensive
        condicion: document.getElementById('invoiceCondition').value,
        formaPago: document.getElementById('invoicePaymentMethod').value,
        diasPlazo: document.getElementById('invoiceCondition').value === 'CREDITO' ? parseInt(document.getElementById('invoiceCreditDays').value) : 0,
        detalles: invoiceItems.map(i => ({
            descripcion: i.description,
            cantidad: i.quantity,
            precioUnitario: i.unitPrice
        }))
    };

    const res = await postData('/api/facturas', invoiceData);
    if (res) {
        showNotification('Factura emitida correctamente', 'success');
        closeInvoiceModal();
        invoiceItems = [];
        renderInvoiceItems();
        document.getElementById('ruc').value = '';
        document.getElementById('razonSocial').value = '';
    }
}

function renderInvoiceItems() {
    const tbody = document.querySelector('#invoiceItemsTable tbody');
    tbody.innerHTML = '';
    let total = 0;

    invoiceItems.forEach((item, index) => {
        const subtotal = item.quantity * item.unitPrice;
        total += subtotal;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(item.unitPrice)}</td>
            <td>${formatCurrency(subtotal)}</td>
            <td><button onclick="removeInvoiceItem(${index})" style="color:red;border:none;background:none;cursor:pointer"><i class="fas fa-trash"></i></button></td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('invoiceTotal').textContent = formatCurrency(total);
}

async function loadClientsForModal() {
    try {
        const clients = await fetchData('/api/clientes');
        const datalist = document.getElementById('clientList');
        if (!datalist) return;

        datalist.innerHTML = '';
        clientsMap = {};
        clients.forEach(c => {
            const option = document.createElement('option');
            option.value = c.ruc;
            option.textContent = c.razonSocial;
            datalist.appendChild(option);
            clientsMap[c.ruc] = c;
        });
    } catch (e) { console.error("Error loading clients:", e); }
}

export function init() {
    const rucInput = document.getElementById('ruc');
    if (rucInput) {
        rucInput.addEventListener('input', function (e) {
            const val = e.target.value;
            if (clientsMap[val]) {
                document.getElementById('razonSocial').value = clientsMap[val].razonSocial;
            }
        });
    }
}
