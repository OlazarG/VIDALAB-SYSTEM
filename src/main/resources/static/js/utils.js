
// Utility Functions

export function formatCurrency(val) {
    return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(val);
}

export function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('es-PY', { hour12: false });
}

export function getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getDateRangeFromInputs(idFrom, idTo) {
    const fromStr = document.getElementById(idFrom).value;
    const toStr = document.getElementById(idTo).value;

    if (!fromStr || !toStr) return [null, null];

    const [yFrom, mFrom, dFrom] = fromStr.split('-').map(Number);
    const dateFrom = new Date(yFrom, mFrom - 1, dFrom, 0, 0, 0, 0);

    const [yTo, mTo, dTo] = toStr.split('-').map(Number);
    const dateTo = new Date(yTo, mTo - 1, dTo, 23, 59, 59, 999);

    return [dateFrom, dateTo];
}

export function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return; // Guard clause

    const notification = document.createElement('div');

    const colors = {
        success: '#00c853',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    notification.style.cssText = `
        background: white;
        border-left: 4px solid ${colors[type]};
        padding: 16px 20px;
        margin-bottom: 10px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;

    notification.innerHTML = `
        <i class="fas ${icons[type]}" style="color: ${colors[type]}; font-size: 20px;"></i>
        <span style="flex: 1; color: #333; font-size: 14px;">${message}</span>
        <i class="fas fa-times" style="color: #999; cursor: pointer; font-size: 16px;" onclick="this.parentElement.remove()"></i>
    `;

    container.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}
