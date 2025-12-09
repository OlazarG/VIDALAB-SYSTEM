
import { postData, fetchData } from '../api.js';
import { showNotification } from '../utils.js';

// --- Auth Init ---

export async function checkAuth() {
    try {
        const data = await fetchData('/api/me');
        if (data.username) {
            document.getElementById('currentUserDisplay').textContent = 'Usuario: ' + data.username;
        }
        if (data.role !== 'ADMIN') {
            // Hide Users sidebar item
            const userLink = document.querySelector('a[onclick*="usuarios"]');
            if (userLink) userLink.parentElement.style.display = 'none';

            // Hide Planilla Movimientos tab
            const reportTabBtn = document.querySelector('button[onclick*="tab-movimientos"]');
            if (reportTabBtn) reportTabBtn.style.display = 'none';

            // Hide content section
            const planillaTabContent = document.getElementById('tab-movimientos');
            if (planillaTabContent) planillaTabContent.style.display = 'none';

            // Hide Export button
            const exportBtn = document.querySelector('button[onclick*="openExportModal"]');
            if (exportBtn) exportBtn.style.display = 'none';
        }
    } catch (err) { console.error('Error fetching user info', err); }
}

// --- Users Management ---

export async function loadUsers() {
    try {
        const users = await fetchData('/api/users');
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        users.forEach(u => {
            const row = `<tr>
                <td>${u.id}</td>
                <td>${u.username}</td>
                <td>${u.role || 'USER'}</td>
                <td>
                    <button onclick="changePassword(${u.id}, '${u.username}')" style="color:blue;border:none;background:none;cursor:pointer;margin-right:8px" title="Cambiar Contraseña">
                        <i class="fas fa-key"></i>
                    </button>
                    <button onclick="deleteUser(${u.id})" style="color:red;border:none;background:none;cursor:pointer" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (e) { console.error('Error loading users', e); }
}

window.deleteUser = async function (id) {
    if (!confirm('¿Seguro que desea eliminar este usuario?')) return;
    try {
        const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showNotification('Usuario eliminado', 'success');
            loadUsers();
        } else {
            showNotification('Error al eliminar usuario', 'error');
        }
    } catch (e) { showNotification('Error de conexión', 'error'); }
}

window.changePassword = async function (id, username) {
    const newPass = prompt(`Ingrese nueva contraseña para ${username}:`);
    if (!newPass) return;

    try {
        const res = await fetch(`/api/users/${id}/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPass })
        });
        if (res.ok) {
            showNotification('Contraseña actualizada', 'success');
        } else {
            const text = await res.text();
            showNotification(text || 'Error al cambiar contraseña', 'error');
        }
    } catch (e) { showNotification('Error de conexión', 'error'); }
}

// --- Init ---
export function init() {
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('newUsername').value;
            const password = document.getElementById('newPassword').value;
            const data = { username: username, password: password };

            try {
                const res = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (res.ok) {
                    showNotification('Usuario creado correctamente', 'success');
                    document.getElementById('userForm').reset();
                    loadUsers();
                } else {
                    const text = await res.text();
                    showNotification(text || 'Error al crear usuario', 'error');
                }
            } catch (e) { showNotification('Error de conexión', 'error'); }
        });
    }
}

