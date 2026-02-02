/**
 * multi-step.js
 * Creates a fluid multi-step form experience.
 */

document.addEventListener('DOMContentLoaded', () => {
    const steps = document.querySelectorAll('.step');
    const form = document.getElementById('formPostulacion');
    const progressBar = document.getElementById('progress-bar');
    let currentStep = 0;

    // Check Authentication & Application Limit
    const user = JSON.parse(localStorage.getItem("usuarioActivo"));
    if (!user) {
        Swal.fire({
            icon: 'info',
            title: 'Inicio de sesión requerido',
            text: 'Debes iniciar sesión para acceder a esta página.',
            confirmButtonColor: '#004481'
        }).then(() => {
            window.location.href = "index.html";
        });
        return;
    }

    // Limit check: Max 3 applications
    (async () => {
        try {
            const apps = await api.get(`postulaciones?usuarioEmail=${encodeURIComponent(user.email)}`);
            if (Array.isArray(apps) && apps.length >= 3) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Límite alcanzado',
                    text: 'Has alcanzado el límite máximo de 3 postulaciones. No puedes solicitar más becas por el momento.',
                    confirmButtonColor: '#004481'
                }).then(() => {
                    window.location.href = "estudiante-catalogo.html";
                });
            }
        } catch (e) {
            console.error("Error al verificar límite de postulaciones:", e);
        }
    })();

    // Initialize: Fetch scholarships and show first step
    let availableBecas = [];
    (async () => {
        try {
            availableBecas = await api.get('becas');
            const becaSelect = document.getElementById('beca');
            if (becaSelect) {
                // Clear existing options except the first placeholder
                becaSelect.innerHTML = '<option value="">-- Seleccione una opción --</option>';
                availableBecas.filter(b => b.estado === 'Abierta').forEach(beca => {
                    const option = document.createElement('option');
                    option.value = beca.id;
                    option.textContent = beca.nombre;
                    becaSelect.appendChild(option);
                });

                // Set pre-selected scholarship if coming from catalog
                const urlParams = new URLSearchParams(window.location.search);
                const becaIdParam = urlParams.get('beca');
                if (becaIdParam) {
                    becaSelect.value = becaIdParam;
                }
            }
        } catch (e) {
            console.error("Error loading scholarships:", e);
        }
    })();

    showStep(currentStep);

    function showStep(n) {
        // Remove active class from all steps
        steps.forEach(step => {
            step.classList.remove('active');
            // Ensure hidden steps don't interfere with layout
            step.style.display = 'none';
        });

        // Show current step with animation
        steps[n].style.display = 'block';
        // Small delay to allow display:block to render before adding opacity class
        setTimeout(() => {
            steps[n].classList.add('active');
        }, 10);
        
        // Update Progress Bar
        updateProgress(n);
    }

    function updateProgress(n) {
        if (!progressBar) return;
        const total = steps.length;
        const progress = ((n + 1) / total) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // Main Navigation Function
    window.nextStep = function() {
        if (!validateStep(currentStep)) return;

        // Slide Out Animation
        steps[currentStep].classList.add('slide-out-left');

        setTimeout(() => {
            steps[currentStep].classList.remove('slide-out-left');
            currentStep++;
            showStep(currentStep);
        }, 300); // Wait for CSS transition
    };

    window.prevStep = function() {
        if (currentStep === 0) return;

        // Slide Out Animation (Reverse)
        steps[currentStep].classList.add('slide-out-right');

        setTimeout(() => {
            steps[currentStep].classList.remove('slide-out-right');
            currentStep--;
            showStep(currentStep);
        }, 300);
    };

    function validateStep(n) {
        const currentInputs = steps[n].querySelectorAll('input, select, textarea');
        let valid = true;

        currentInputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                valid = false;
            }
        });

        return valid;
    }

    // Handle Form Submit
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const user = JSON.parse(localStorage.getItem('usuarioActivo'));
            if (!user) {
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso denegado',
                    text: 'Debes iniciar sesión para postularte.',
                    confirmButtonColor: '#004481'
                }).then(() => {
                    window.location.href = 'index.html';
                });
                return;
            }

            // Gather Data
            const becaSelect = document.getElementById('beca');
            const becaId = becaSelect.value;

            // 1. Extra Check: No double postulation to SAME beca
            try {
                const userApps = await api.get(`postulaciones?usuarioEmail=${encodeURIComponent(user.email)}`);
                const alreadyApplied = userApps.find(a => a.informacionAcademica.becaId === becaId);
                if (alreadyApplied) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Ya te has postulado',
                        text: 'No puedes postularte dos veces a la misma beca.',
                        confirmButtonColor: '#004481'
                    });
                    return;
                }
            } catch (e) { console.warn("Duplicate check error:", e); }

            // 2. Auto-Validation Logic (Section 4.4)
            const edad = parseInt(document.getElementById('edad').value);
            const ingresosRaw = document.getElementById('ingresos').value.replace(/[^0-9]/g, '');
            const ingresos = parseInt(ingresosRaw) || 0;
            
            let autoEstado = "Pendiente";
            // Example Rule: Age must be at least 15, and income below 1,000,000 to be "Apta" initially
            if (edad < 15 || ingresos > 1000000) {
                autoEstado = "No apta";
            } else {
                autoEstado = "Apta";
            }

            const applicationData = {
                id: Date.now().toString(),
                usuarioEmail: user.email,
                usuarioNombre: user.nombre,
                datosPersonales: {
                    nombreCompleto: document.getElementById('nombreCompleto').value,
                    cedula: document.getElementById('cedula').value,
                    edad: edad
                },
                informacionAcademica: {
                    becaId: becaId,
                    becaNombre: availableBecas.find(b => b.id.toString() === becaId.toString())?.nombre || becaSelect.options[becaSelect.selectedIndex]?.text || 'Beca',
                    nivelEducativo: document.getElementById('nivelEducativo').value
                },
                situacionSocioeconomica: {
                    ingresos: document.getElementById('ingresos').value, // Formatted with ₡
                    ingresosNumerico: ingresos,
                    personasHogar: parseInt(document.getElementById('personasHogar').value)
                },
                motivo: document.getElementById('motivo').value,
                estado: autoEstado, // Set by auto-validation
                fechaPostulacion: new Date().toLocaleString()
            };

            try {
                const submitBtn = form.querySelector('.btn-submit');
                submitBtn.disabled = true;
                submitBtn.innerText = "Enviando...";

                await api.post('postulaciones', applicationData);
                
                Swal.fire({
                    icon: 'success',
                    title: '¡Enviado!',
                    text: 'Tu postulación ha sido enviada con éxito.',
                    confirmButtonColor: '#004481'
                }).then(() => {
                    window.location.href = "estudiante-historial.html";
                });
            } catch (error) {
                console.error("Error al enviar postulación:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error de envío',
                    text: 'Hubo un error al enviar tu solicitud. Intenta nuevamente.',
                    confirmButtonColor: '#004481'
                });
                const submitBtn = form.querySelector('.btn-submit');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Enviar Solicitud <i class="fas fa-paper-plane"></i>';
            }
        });
    }
});
