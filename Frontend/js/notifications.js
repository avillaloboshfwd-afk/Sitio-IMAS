/**
 * notifications.js
 * Logic for unread badges, dropdown display, and creating new alerts.
 */

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('usuarioActivo'));
    if (!user) return;

    const notifTrigger = document.getElementById('notif-trigger');
    const notifDropdown = document.getElementById('notif-dropdown');
    const notifList = document.getElementById('notif-list');
    const notifCount = document.getElementById('notif-count');

    // Toggle Dropdown
    if (notifTrigger) {
        notifTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('active');
        });
    }

    document.addEventListener('click', () => {
        if (notifDropdown) notifDropdown.classList.remove('active');
    });

    // Load Notifications
    window.loadNotifications = async () => {
        try {
            // Fetch relevant notifications
            // If admin/evaluator, show specific alerts. If postulant, show personal status changes.
            const query = user.role === 'postulante' 
                ? `notificaciones?usuarioEmail=${encodeURIComponent(user.email)}&_sort=fecha&_order=desc`
                : `notificaciones?_sort=fecha&_order=desc&_limit=10`; // Admins see recent global activity
                
            const data = await api.get(query);
            renderNotifications(data);
        } catch (error) {
            console.error("Error loading notifications:", error);
        }
    };

    const renderNotifications = (list) => {
        if (!notifList) return;
        notifList.innerHTML = '';
        
        const unreadCount = list.filter(n => !n.leido).length;
        if (unreadCount > 0) {
            notifCount.innerText = unreadCount;
            notifCount.style.display = 'block';
        } else {
            notifCount.style.display = 'none';
        }

        if (list.length === 0) {
            notifList.innerHTML = '<div class="notif-empty">No hay notificaciones nuevas</div>';
            return;
        }

        list.forEach(item => {
            const div = document.createElement('div');
            div.className = `notif-item ${item.leido ? '' : 'unread'}`;
            div.innerHTML = `
                <h4>${item.titulo}</h4>
                <p>${item.mensaje}</p>
                <span class="date">${new Date(item.fecha).toLocaleString()}</span>
            `;
            
            // Mark as read on click
            div.onclick = async (e) => {
                e.stopPropagation();
                if (!item.leido) {
                    try {
                        await api.patch(`notificaciones/${item.id}`, { leido: true });
                        loadNotifications();
                    } catch (err) {
                        console.error("Error marking read:", err);
                    }
                }
            };
            
            notifList.appendChild(div);
        });
    };

    window.markAllRead = async (e) => {
        if (e) e.preventDefault();
        try {
            const query = user.role === 'postulante' 
                ? `notificaciones?usuarioEmail=${encodeURIComponent(user.email)}&leido=false`
                : `notificaciones?leido=false`;
            
            const unread = await api.get(query);
            const promises = unread.map(n => api.patch(`notificaciones/${n.id}`, { leido: true }));
            await Promise.all(promises);
            loadNotifications();
        } catch (error) {
            console.error("Error marking all read:", error);
        }
    };

    // Global utility to create notification
    window.createNotification = async (email, title, msg, type = 'info') => {
        try {
            const newNotif = {
                usuarioEmail: email,
                titulo: title,
                mensaje: msg,
                leido: false,
                fecha: new Date().toISOString(),
                tipo: type
            };
            await api.post('notificaciones', newNotif);
            // If the current user is the target, refresh
            if (email === user.email) loadNotifications();
        } catch (error) {
            console.error("Error creating notification:", error);
        }
    };

    loadNotifications();
    // Poll every 30 seconds for new alerts
    setInterval(loadNotifications, 30000);
});
