/**
 * gestionEvaluadores.js
 * Logic for managing evaluators in the IMAS admin panel.
 */

document.addEventListener("DOMContentLoaded", async () => {
    // -------------------------------------------------------------------------
    // 1. Initialization & Selectors
    // -------------------------------------------------------------------------
    const form = document.getElementById("form-evaluador");
    const lista = document.getElementById("lista-evaluadores");
    const logoutBtn = document.getElementById("logoutBtn");

    // Optional: Check authentication (simulated)
    // const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
    // if (!usuarioActivo || usuarioActivo.role !== "admin") { window.location.href = "login.html"; return; }

    // -------------------------------------------------------------------------
    // 2. Core Functions
    // -------------------------------------------------------------------------

    /**
     * Loads the list of evaluators from the API/Storage and renders them.
     */
    async function cargarEvaluadores() {
        try {
            // Fetch all users
            const usuarios = await api.get("usuarios");
            
            // Filter only evaluators
            const evaluadores = usuarios.filter(u => u.role === "evaluador");
            
            // Render
            renderEvaluadores(evaluadores);

        } catch (error) {
            console.error("Error al cargar evaluadores:", error);
            lista.innerHTML = `<p class="error-message">Error al cargar los datos. Intente nuevamente.</p>`;
        }
    }

    /**
     * Renders the array of evaluators into the DOM.
     * @param {Array} evaluadores - List of evaluator objects
     */
    function renderEvaluadores(evaluadores) {
        lista.innerHTML = "";

        if (evaluadores.length === 0) {
            lista.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-info-circle"></i>
                    <p>No hay evaluadores registrados aún.</p>
                </div>`;
            return;
        }

        evaluadores.forEach(ev => {
            const item = document.createElement("div");
            item.classList.add("user-item");
            item.innerHTML = `
                <div class="user-info">
                    <strong>${escapeHtml(ev.nombre)}</strong><br>
                    <small>${escapeHtml(ev.email)}</small>
                </div>
                <div class="user-actions">
                    <span class="status-active"><i class="fas fa-check-circle"></i> Activo</span>
                    <button class="btn-icon btn-delete" data-id="${ev.id}" title="Eliminar Evaluador">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            lista.appendChild(item);
        });

        // Attach event listeners to new delete buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
    }

    async function handleDelete(e) {
        const id = e.currentTarget.dataset.id;
        
        const result = await Swal.fire({
            title: '¿Confirmar eliminación?',
            text: "Esta acción no se puede deshacer y el evaluador perderá acceso.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#004481',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.delete('usuarios', id);
                await cargarEvaluadores();
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'El evaluador ha sido retirado del sistema.',
                    confirmButtonColor: '#004481'
                });
            } catch (error) {
                console.error("Error al eliminar:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Fallo al eliminar',
                    text: 'No se pudo eliminar el evaluador.',
                    confirmButtonColor: '#004481'
                });
            }
        }
    }

    /**
     * Safety utility to prevent XSS when rendering user input.
     */
    function escapeHtml(text) {
        if (!text) return "";
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // -------------------------------------------------------------------------
    // 3. Event Listeners
    // -------------------------------------------------------------------------

    // Form Submission (Create User)
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombreInput = document.getElementById("nombre");
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        const submitBtn = form.querySelector("button[type='submit']");

        const nombre = nombreInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!nombre || !email || !password) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor complete todos los campos del formulario.',
                confirmButtonColor: '#004481'
            });
            return;
        }

        // --- Password Security Check ---
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength || !hasUpperCase || !hasNumber || !hasSpecialChar) {
            let errorMsg = "La contraseña del evaluador debe cumplir con:";
            if (password.length < minLength) errorMsg += "\n• Mínimo 8 caracteres";
            if (!hasUpperCase) errorMsg += "\n• Una letra mayúscula";
            if (!hasNumber) errorMsg += "\n• Un número";
            if (!hasSpecialChar) errorMsg += "\n• Un carácter especial (ej: !@#$%)";

            Swal.fire({
                icon: 'error',
                title: 'Seguridad insuficiente',
                text: errorMsg,
                confirmButtonColor: '#004481'
            });
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = "Guardando...";

            // Check for duplicates
            const usuarios = await api.get("usuarios");
            if (usuarios.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de registro',
                    text: '⚠️ Este correo electrónico ya está registrado en el sistema.',
                    confirmButtonColor: '#004481'
                });
                submitBtn.disabled = false;
                submitBtn.textContent = "Registrar Evaluador";
                return;
            }

            // Create new evaluator object
            const nuevoEvaluador = {
                nombre,
                email,
                password, // Note: In a real app, never store passwords in plain text!
                role: "evaluador",
                fechaRegistro: new Date().toISOString(),
                status: "active"
            };

            // Save
            await api.post("usuarios", nuevoEvaluador);

            // Success feedback
            Swal.fire({
                icon: 'success',
                title: 'Evaluador Registrado',
                text: `✅ El evaluador "${nombre}" ha sido dado de alta correctamente.`,
                timer: 2500,
                showConfirmButton: false,
                timerProgressBar: true
            });
            form.reset();
            
            // Reset default password if needed or leave blank
            passwordInput.value = "imas2026"; 

            // Refresh list
            await cargarEvaluadores();

        } catch (error) {
            console.error("Error al registrar:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error de registro',
                text: 'Hubo un error al intentar registrar el evaluador.',
                confirmButtonColor: '#004481'
            });
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Registrar Evaluador";
        }
    });

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("usuarioActivo");
            Swal.fire({
                icon: 'info',
                title: 'Desconectado',
                text: 'Esperamos verte pronto.',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                window.location.href = "index.html"; 
            });
        });
    }

    // -------------------------------------------------------------------------
    // 4. Initial Load
    // -------------------------------------------------------------------------
    cargarEvaluadores();
});
