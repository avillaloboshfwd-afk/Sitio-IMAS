/**
 * misPostulaciones.js
 * Logic for the user's application history.
 */

document.addEventListener("DOMContentLoaded", async () => {
    // -------------------------------------------------------------------------
    // 1. Initialization
    // -------------------------------------------------------------------------
    const historyList = document.getElementById("historial-lista");
    const loading = document.getElementById("loading");
    const logoutBtn = document.getElementById("logoutBtn");

    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

    // -------------------------------------------------------------------------
    // 2. Load History
    // -------------------------------------------------------------------------
    async function cargarHistorial() {
        try {
            if (!usuarioActivo) {
                loading.style.display = "none";
                historyList.innerHTML = `<p style="text-align:center; padding: 2rem;">Por favor, <a href="index.html">inicie sesión</a> para ver sus postulaciones.</p>`;
                return;
            }

            const solicitudes = await api.get("postulaciones");
            const misSolicitudes = solicitudes.filter(s => s.usuarioEmail === usuarioActivo.email); 
            
            const displayData = misSolicitudes.map(s => ({
                id: s.id,
                beca: s.informacionAcademica?.becaNombre || 'Beca',
                fecha: s.fechaPostulacion,
                estado: s.estado,
                comentarios: s.evaluacion?.observaciones || 'En espera de revisión.'
            }));

            renderHistorial(displayData);

        } catch (error) {
            console.error("Error al cargar historial:", error);
            historyList.innerHTML = `<p style="color:red; text-align:center;">Error al cargar sus solicitudes.</p>`;
        } finally {
            loading.style.display = "none";
        }
    }

    // -------------------------------------------------------------------------
    // 3. Render
    // -------------------------------------------------------------------------
    function renderHistorial(data) {
        historyList.innerHTML = "";

        if (data.length === 0) {
            historyList.innerHTML = `
                <div style="text-align:center; padding: 2rem;">
                    <i class="fas fa-folder-open fa-3x" style="color:#ccc;"></i>
                    <p>No tiene solicitudes registradas.</p>
                </div>`;
            return;
        }

        data.forEach(sol => {
            const card = document.createElement("div");
            card.className = "history-card";
            
            let statusIcon = "fa-clock";
            if (sol.estado === "Aprobada") statusIcon = "fa-check-circle";
            if (sol.estado === "Rechazada") statusIcon = "fa-times-circle";

            card.innerHTML = `
                <div class="history-content" style="width: 100%;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div class="history-info">
                            <h3>${sol.beca}</h3>
                            <p><i class="far fa-calendar-alt"></i> Fecha: ${sol.fecha}</p>
                            <p><i class="fas fa-hashtag"></i> ID: ${sol.id}</p>
                        </div>
                        <div class="history-status">
                            <span class="status-badge ${sol.estado}">
                                <i class="fas ${statusIcon}"></i> ${sol.estado}
                            </span>
                            <button class="toggle-btn" onclick="toggleDetails('${sol.id}')">
                                Ver Detalles <i class="fas fa-chevron-down"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div id="details-${sol.id}" class="history-details">
                        <div class="observation-box">
                            <strong><i class="fas fa-comment-alt"></i> Comentarios del Evaluador:</strong>
                            <p class="comment-text">${sol.comentarios}</p>
                        </div>
                    </div>
                </div>
            `;
            historyList.appendChild(card);
        });
    }

    window.toggleDetails = function(id) {
        const details = document.getElementById(`details-${id}`);
        const isActive = details.classList.contains("active");
        
        document.querySelectorAll('.history-details').forEach(d => d.classList.remove('active'));

        if (!isActive) {
            details.classList.add("active");
        }
    }

    // -------------------------------------------------------------------------
    // 4. Events
    // -------------------------------------------------------------------------
    if(logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("usuarioActivo");
            Swal.fire({
                icon: 'info',
                title: 'Hasta luego',
                text: 'Sesión de historial cerrada.',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                window.location.href = "index.html";
            });
        });
    }

    // Init
    cargarHistorial();
});
