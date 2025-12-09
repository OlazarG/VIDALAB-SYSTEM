
import { showNotification } from './utils.js';

export async function postData(url, data, callback) {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            const responseData = await res.json();
            showNotification('Guardado correctamente', 'success');
            if (callback) callback(responseData);
            return responseData;
        } else {
            const errorText = await res.text();
            showNotification(errorText || 'Error al guardar', 'error');
            return null;
        }
    } catch (e) {
        console.error(e);
        showNotification('Error de conexión', 'error');
        return null;
    }
}

export async function fetchData(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch ${url}`);
        return await res.json();
    } catch (e) {
        console.error(e);
        throw e;
    }
}
