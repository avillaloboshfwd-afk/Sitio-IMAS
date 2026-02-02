/**
 * evaluacion.js
 * Lógica para el panel de evaluación y detalle de solicitudes.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Determine if we are on the list page or detail page
    const listContainer = document.getElementById('lista-pendientes');
    const detailContainer = document.getElementById('detalle-container');

    if (listContainer) {
        initListPage();
    } else if (detailContainer) {
        initDetailPage();
    }

    // --- List Page Logic ---
    async function initListPage() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        let currentFilter = 'all';

        await cargarSolicitudes();

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                cargarSolicitudes(currentFilter);
            });
        });

        async function cargarSolicitudes(status = 'all') {
            try {
                const postulaciones = await api.get('postulaciones');
                const filtered = status === 'all' 
                    ? postulaciones 
                    : postulaciones.filter(p => {
                        if (status === 'Pendiente') return p.estado === 'Pendiente' || p.estado === 'Apta';
                        if (status === 'Rechazada') return p.estado === 'Rechazada' || p.estado === 'No apta';
                        return p.estado === status;
                    });
                renderSolicitudes(filtered);
            } catch (error) {
                console.error("Error al cargar solicitudes:", error);
                listContainer.innerHTML = '<p>Error al cargar las solicitudes.</p>';
            }
        }

        function renderSolicitudes(list) {
            listContainer.innerHTML = '';
            if (list.length === 0) {
                listContainer.innerHTML = '<p>No hay solicitudes disponibles.</p>';
                return;
            }

            list.forEach(p => {
                const card = document.createElement('article');
                card.className = 'request-card';
                const statusClass = `status-${p.estado.toLowerCase()}`;
                const isProcessed = p.estado === "Aprobada" || p.estado === "Rechazada";
                
                card.innerHTML = `
                    <div class="card-header">
                        <h3>${p.datosPersonales?.nombreCompleto || p.usuarioNombre || 'Postulante'}</h3>
                        <span class="status-badge ${statusClass}">${p.estado}</span>
                    </div>
                    <div class="card-body">
                        <div class="request-info">
                            <p><i class="fas fa-graduation-cap"></i> ${p.informacionAcademica?.becaNombre || 'Información no disponible'}</p>
                            <p><i class="far fa-calendar-alt"></i> ${p.fechaPostulacion}</p>
                        </div>
                    </div>
                    <div class="card-footer">
                        <a href="evaluador-detalle.html?id=${p.id}" class="btn-view">${isProcessed ? 'Ver Decisión' : 'Evaluar Solicitud'} <i class="fas fa-arrow-right"></i></a>
                    </div>
                `;
                listContainer.appendChild(card);
            });
        }
    }

    // --- Detail Page Logic ---
    async function initDetailPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (!id) {
            Swal.fire({
                icon: 'error',
                title: 'Error de acceso',
                text: 'Solicitud no encontrada o ID inválido.',
                confirmButtonColor: '#004481'
            }).then(() => {
                window.location.href = 'evaluador-panel.html';
            });
            return;
        }

        try {
            const postulaciones = await api.get('postulaciones');
            const application = postulaciones.find(p => p.id.toString() === id.toString());

            if (!application) {
                Swal.fire({
                    icon: 'error',
                    title: 'No encontrada',
                    text: 'La solicitud especificada no existe en el sistema.',
                    confirmButtonColor: '#004481'
                }).then(() => {
                    window.location.href = 'evaluador-panel.html';
                });
                return;
            }

            renderDetail(application);
            
            // SECURITY: Lock if already processed
            if (application.estado === "Aprobada" || application.estado === "Rechazada") {
                lockEvaluation(application.estado);
            } else {
                setupEvaluationButtons(application);
            }

        } catch (error) {
            console.error("Error al cargar detalle:", error);
        }

        function renderDetail(app) {
            document.getElementById('student-name').innerText = app.datosPersonales?.nombreCompleto || app.usuarioNombre || 'Postulante';
            document.getElementById('student-career').innerText = app.informacionAcademica?.becaNombre || 'No especificada';
            document.getElementById('request-date').innerText = app.fechaPostulacion;
            document.getElementById('request-id').innerText = `REQ-${app.id}`;

            const dataContainer = document.getElementById('datos-postulante');
            dataContainer.innerHTML = `
                <div class="data-grid">
                    <div class="data-item">
                        <span class="data-label">Identificación</span>
                        <span class="data-value">${app.datosPersonales?.cedula || 'N/A'}</span>
                    </div>
                    <div class="data-item">
                        <span class="data-label">Edad</span>
                        <span class="data-value">${app.datosPersonales?.edad || 'N/A'} años</span>
                    </div>
                    <div class="data-item">
                        <span class="data-label">Nivel Educativo</span>
                        <span class="data-value">${app.informacionAcademica?.nivelEducativo || 'N/A'}</span>
                    </div>
                    <div class="data-item">
                        <span class="data-label">Ingresos Hogar</span>
                        <span class="data-value">${app.situacionSocioeconomica?.ingresos || 'N/A'}</span>
                    </div>
                    <div class="data-item">
                        <span class="data-label">Personas Hogar</span>
                        <span class="data-value">${app.situacionSocioeconomica?.personasHogar || 'N/A'}</span>
                    </div>
                </div>
                <div class="motivation-box" style="margin-top: 20px; background: #f9f9f9; padding: 15px; border-radius: 8px;">
                     <strong>Motivación:</strong>
                     <p>${app.motivo || 'No proporcionado'}</p>
                </div>
            `;
        }

        function setupEvaluationButtons(app) {
            const btnApprove = document.getElementById('btn-aprobar');
            const btnReject = document.getElementById('btn-rechazar');
            const scoreEco = document.getElementById('score-eco');
            const scoreAcad = document.getElementById('score-acad');
            const scoreSocial = document.getElementById('score-social');
            const totalPts = document.getElementById('total-pts');
            const observations = document.getElementById('observaciones');

            btnApprove.addEventListener('click', async () => {
                await updateStatus('Aprobada');
            });

            btnReject.addEventListener('click', async () => {
                await updateStatus('Rechazada');
            });

            async function updateStatus(newStatus) {
                const evaluacion = {
                    puntajes: {
                        economico: parseInt(scoreEco.value) || 0,
                        academico: parseInt(scoreAcad.value) || 0,
                        social: parseInt(scoreSocial.value) || 0
                    },
                    puntajeTotal: parseInt(totalPts.innerText) || 0,
                    observaciones: observations.value,
                    evaluador: "Evaluador Principal",
                    fechaEvaluacion: new Date().toLocaleString()
                };

                try {
                    await api.put('postulaciones', app.id, {
                        estado: newStatus,
                        evaluacion: evaluacion
                    });
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Evaluación Completada',
                        text: `La solicitud ha sido ${newStatus === 'Aprobada' ? 'aprobada' : 'rechazada'} correctamente.`,
                        confirmButtonColor: '#004481'
                    }).then(() => {
                        window.location.href = 'evaluador-panel.html';
                    });
                } catch (error) {
                    console.error("Error al actualizar solicitud:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de proceso',
                        text: 'Hubo un fallo al intentar registrar la evaluación.',
                        confirmButtonColor: '#004481'
                    });
                }
            }
        }

        function lockEvaluation(status) {
            const elements = ['score-eco', 'score-acad', 'score-social', 'observaciones'];
            elements.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.disabled = true;
            });

            // Hide the button container completely
            const actionButtons = document.querySelector('.action-buttons');
            if (actionButtons) {
                actionButtons.style.display = 'none';
            }

            Swal.fire({
                icon: 'info',
                title: 'Solicitud Procesada',
                text: `Esta solicitud ya ha sido ${status.toLowerCase()} y no puede ser modificada.`,
                confirmButtonColor: '#004481'
            });
        }
    }
}
);
