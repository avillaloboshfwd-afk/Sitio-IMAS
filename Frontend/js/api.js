const BASE_URL = 'http://localhost:3000';

const api = {
    // Helper to simulate network delay (optional, but keeping it for consistency)
    delay: (ms = 300) => new Promise(resolve => setTimeout(resolve, ms)),

    async get(endpoint) {
        // Handle query params if any (simplification for json-server)
        const response = await fetch(`${BASE_URL}/${endpoint}`);
        if (!response.ok) throw new Error(`Error fetching ${endpoint}`);
        return await response.json();
    },

    async post(endpoint, newData) {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newData)
        });
        if (!response.ok) throw new Error(`Error posting to ${endpoint}`);
        return await response.json();
    },

    async put(endpoint, id, updatedFields) {
        const response = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
            method: 'PATCH', // json-server treats PATCH as partial update
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedFields)
        });
        if (!response.ok) throw new Error(`Error updating ${endpoint}`);
        return await response.json();
    },

    async delete(endpoint, id) {
        const response = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`Error deleting from ${endpoint}`);
        return { success: true };
    }
};
