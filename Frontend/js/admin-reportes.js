/**
 * reportes.js
 * Interactive logic for the Global Reports Dashboard.
 */

document.addEventListener("DOMContentLoaded", async () => {
    // -------------------------------------------------------------------------
    // 1. Authentication Check
    // -------------------------------------------------------------------------
    // const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
    // if (!usuarioActivo || usuarioActivo.role !== "admin") {
    //     window.location.href = "login.html";
    //     return;
    // }

    // -------------------------------------------------------------------------
    // 2. Data Fetching & State
    // -------------------------------------------------------------------------
    const domRefs = {
        totalApps: document.getElementById("total-apps"),
        totalBecas: document.getElementById("total-becas"),
        totalPendientes: document.getElementById("total-pendientes"),
        totalAprobadas: document.getElementById("total-aprobadas"),
        chartEstados: document.getElementById("chartEstados").getContext('2d'),
        chartBecas: document.getElementById("chartBecas").getContext('2d'),
        btnRefresh: document.getElementById("btn-refresh"),
        btnExport: document.getElementById("btn-export")
    };

    let charts = {
        estados: null,
        becas: null
    };

    async function loadDashboardData() {
        try {
            // Mock Data Delay
            await api.delay(600);

            // Fetch from LocalStorage/API
            const postulaciones = await api.get("postulaciones") || [];
            const becas = await api.get("becas") || [];

            // --- KPI Calculation ---
            const stats = {
                total: postulaciones.length,
                becasActivas: becas.filter(b => b.estado === "Abierta").length,
                pendientes: postulaciones.filter(p => p.estado === "Pendiente").length,
                aprobadas: postulaciones.filter(p => p.estado === "Aprobada").length
            };

            // --- Animate & Update DOM ---
            animateValue(domRefs.totalApps, 0, stats.total, 1000);
            animateValue(domRefs.totalBecas, 0, stats.becasActivas, 1000);
            animateValue(domRefs.totalPendientes, 0, stats.pendientes, 1000);
            
            // --- Chart Data Preparation ---
            
            // 1. Status Distribution
            const statusCount = { Aprobada: 0, Rechazada: 0, Pendiente: 0 };
            postulaciones.forEach(p => {
                const est = p.estado || "Pendiente";
                if (statusCount[est] !== undefined) statusCount[est]++;
            });

            // 2. Applications per Scholarship
            const appsByBeca = {};
            postulaciones.forEach(p => {
                // Determine name safely
                const name = p.informacionAcademica?.becaNombre || p.becaId || "General";
                appsByBeca[name] = (appsByBeca[name] || 0) + 1;
            });

            // --- Render Charts ---
            renderStatusChart(statusCount);
            renderBecasChart(appsByBeca);

        } catch (error) {
            console.error("Dashboard Load Error:", error);
        }
    }

    // -------------------------------------------------------------------------
    // 3. Chart Rendering
    // -------------------------------------------------------------------------
    function renderStatusChart(data) {
        if (charts.estados) charts.estados.destroy();

        charts.estados = new Chart(domRefs.chartEstados, {
            type: 'doughnut',
            data: {
                labels: ['Aprobada', 'Rechazada', 'Pendiente'],
                datasets: [{
                    data: [data.Aprobada, data.Rechazada, data.Pendiente],
                    backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    title: { display: false }
                },
                cutout: '65%',
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }

    function renderBecasChart(dataMap) {
        if (charts.becas) charts.becas.destroy();

        const labels = Object.keys(dataMap);
        const values = Object.values(dataMap);

        charts.becas = new Chart(domRefs.chartBecas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Solicitudes',
                    data: values,
                    backgroundColor: '#004481',
                    borderRadius: 4,
                    barThickness: 'flex',
                    maxBarThickness: 40
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f1f5f9'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // -------------------------------------------------------------------------
    // 4. Utilities & Event Listeners
    // -------------------------------------------------------------------------
    
    // Number Counter Animation
    function animateValue(obj, start, end, duration) {
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Export Button Mock
    if (domRefs.btnExport) {
        domRefs.btnExport.addEventListener('click', () => {
             const originalText = domRefs.btnExport.innerHTML;
             domRefs.btnExport.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Generando...`;
             
             setTimeout(() => {
                 domRefs.btnExport.innerHTML = originalText;
                 Swal.fire({
                     icon: 'success',
                     title: 'Reporte Generado',
                     text: 'El historial completo ha sido procesado y descargado exitosamente.',
                     confirmButtonColor: '#004481'
                 });
             }, 1500);
        });
    }

    // Refresh Button Mock (Filter)
    if (domRefs.btnRefresh) {
        domRefs.btnRefresh.addEventListener('click', () => {
            loadDashboardData();
        });
    }

    // Logout
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("usuarioActivo");
        Swal.fire({
            icon: 'info',
            title: 'Sesión Finalizada',
            text: 'Has salido de la sección de reportes.',
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            window.location.href = "index.html";
        });
    });

    // --- Init ---
    loadDashboardData();
});
