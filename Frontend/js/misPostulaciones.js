document.addEventListener("DOMContentLoaded", async () => {
    
    // Verificar sesión
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
    if (!usuarioActivo) {
        window.location.href = "login.html";
        return;
    }

    const container = document.getElementById("historial-lista");
    const loading = document.getElementById("loading");

    try {
        // Obtenemos todas y filtramos por el usuario actual
        const postulaciones = await api.get("postulaciones");
        const misApps = postulaciones.filter(p => p.usuarioEmail === usuarioActivo.email);

        loading.style.display = "none";

        if (misApps.length === 0) {
            container.innerHTML = "<p>No has realizado ninguna postulación aún.</p>";
            return;
        }

        // Ordenar por fecha (más reciente primero)
        misApps.sort((a, b) => b.id - a.id); // Usando ID como timestamp aproximado o fecha real si parseamos

        misApps.forEach(p => {
            const card = document.createElement("div");
            // Contenedor principal
            card.innerHTML = `
                <div class="history-card">
                    <div class="history-info">
                        <h3>${p.informacionAcademica.becaNombre}</h3>
                        <p><i class="fas fa-calendar-alt"></i> Fecha: ${new Date(p.fechaPostulacion).toLocaleDateString()}</p>
                        <p><strong>Motivo:</strong> ${p.motivo.substring(0, 60)}...</p>
                    </div>
                    <div class="history-status">
                        <span class="status-badge ${p.estado}">${p.estado}</span>
                        ${p.evaluacion ? `<button class="toggle-btn" title="Ver detalles"><i class="fas fa-chevron-down"></i></button>` : ''}
                    </div>
                </div>
            `;

            // Detalles de evaluación si existen
            if (p.evaluacion) {
                const detailsDiv = document.createElement("div");
                detailsDiv.className = "history-details";
                detailsDiv.innerHTML = `
                    <h4><i class="fas fa-clipboard-check"></i> Resultado de la Evaluación</h4>
                    <p><strong>Fecha de Evaluación:</strong> ${p.evaluacion.fechaEvaluacion}</p>
                    <p><strong>Observaciones:</strong> ${p.evaluacion.observaciones || "Sin observaciones."}</p>
                    <div style="margin-top: 10px; display: flex; gap: 15px;">
                        <span class="badge badge-info">Económico: ${p.evaluacion.puntajes.economico}/40</span>
                        <span class="badge badge-info">Académico: ${p.evaluacion.puntajes.academico}/30</span>
                        <span class="badge badge-info">Social: ${p.evaluacion.puntajes.social}/30</span>
                    </div>
                    <p style="margin-top: 10px; font-weight: bold; color: var(--primary-blue);">
                        Puntaje Total: ${p.evaluacion.puntajeTotal}/100
                    </p>
                `;
                card.appendChild(detailsDiv);
                
                // Event listener para el botón
                const btn = card.querySelector(".toggle-btn");
                if(btn) {
                    btn.addEventListener("click", () => {
                        detailsDiv.classList.toggle("active");
                        const icon = btn.querySelector("i");
                        icon.classList.toggle("fa-chevron-up");
                        icon.classList.toggle("fa-chevron-down");
                    });
                }
            }
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error al cargar historial:", error);
        loading.innerText = "Error al cargar tus datos. Intenta más tarde.";
    }
});
