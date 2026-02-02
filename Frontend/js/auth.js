/**
 * auth.js
 * Lógica de autenticación: Login, Registro y Cierre de Sesión.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Double Slider Animation Logic ---
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container');

    if (signUpButton && signInButton && container) {
        signUpButton.addEventListener('click', () => {
            container.classList.add("right-panel-active");
        });

        signInButton.addEventListener('click', () => {
            container.classList.remove("right-panel-active");
        });
    }

    // --- Registration Logic ---
    // Handle both 'register-form' (index.html) and 'register-form-page' (register.html)
    const registerForm = document.getElementById('register-form') || document.getElementById('register-form-page');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get values based on IDs present in the form
            // Index.html uses 'register-nombre', Register.html uses 'nombre'
            const nombreInput = document.getElementById('register-nombre') || document.getElementById('nombre');
            const emailInput = document.getElementById('register-email') || document.getElementById('email');
            const passwordInput = document.getElementById('register-password') || document.getElementById('password');

            const nombre = nombreInput.value;
            const email = emailInput.value;
            const password = passwordInput.value;

            if (!nombre || !email || !password) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Campos incompletos',
                    text: 'Por favor, completa todos los campos.',
                    confirmButtonColor: '#004481'
                });
                return;
            }

            // --- Password Validation ---
            const minLength = 8;
            const hasUpperCase = /[A-Z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

            if (password.length < minLength || !hasUpperCase || !hasNumber || !hasSpecialChar) {
                let errorMsg = "La contraseña debe cumplir con:";
                if (password.length < minLength) errorMsg += "\n• Mínimo 8 caracteres";
                if (!hasUpperCase) errorMsg += "\n• Una letra mayúscula";
                if (!hasNumber) errorMsg += "\n• Un número";
                if (!hasSpecialChar) errorMsg += "\n• Un carácter especial (ej: !@#$%)";

                Swal.fire({
                    icon: 'error',
                    title: 'Contraseña poco segura',
                    text: errorMsg,
                    confirmButtonColor: '#004481'
                });
                return;
            }

            try {
                // Check if user exists (simplification)
                const users = await api.get(`usuarios?email=${encodeURIComponent(email)}`);
                if (users.length > 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Correo duplidado',
                        text: 'El correo ya está registrado.',
                        confirmButtonColor: '#004481'
                    });
                    return;
                }

                // Create user
                const newUser = {
                    nombre,
                    email,
                    password, // In a real app, hash this!
                    role: 'postulante'
                };

                await api.post('usuarios', newUser);

                // Save to localStorage
                localStorage.setItem('usuarioActivo', JSON.stringify(newUser));

                Swal.fire({
                    icon: 'success',
                    title: '¡Registro exitoso!',
                    text: 'Te has registrado correctamente en el sistema.',
                    timer: 2500,
                    showConfirmButton: false,
                    timerProgressBar: true
                }).then(() => {
                    // Small delay for a smoother transition
                    setTimeout(() => {
                        if (container) {
                            container.classList.remove("right-panel-active"); // Back to login
                        } else {
                            window.location.href = 'index.html'; 
                        }
                    }, 300);
                });

            } catch (error) {
                console.error("Error al registrar:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Vaya...',
                    text: 'Hubo un error al registrar. Intenta nuevamente.',
                    confirmButtonColor: '#004481'
                });
            }
        });
    }

    // --- Login Logic (Placeholder for future implementation) ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('login-email') || document.getElementById('email'); // Handle potential ID conflict if using generic IDs elsewhere, but index.html uses login-email
            const passwordInput = document.getElementById('login-password') || document.getElementById('password'); // if on separate page

            const email = emailInput.value;
            const password = passwordInput.value;

            if (!email || !password) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Datos requeridos',
                    text: 'Por favor, ingresa tu correo y contraseña.',
                    confirmButtonColor: '#004481'
                });
                return;
            }

            try {
                // 1. Buscar usuario por email
                const users = await api.get(`usuarios?email=${encodeURIComponent(email)}`);
                
                if (users.length === 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Acceso denegado',
                        text: 'Usuario no encontrado.',
                        confirmButtonColor: '#004481'
                    });
                    return;
                }

                const user = users[0];

                // 2. Verificar contraseña (En producción usar hash)
                if (user.password !== password) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de validación',
                        text: 'Contraseña incorrecta.',
                        confirmButtonColor: '#004481'
                    });
                    return;
                }

                // 3. Guardar sesión
                localStorage.setItem("usuarioActivo", JSON.stringify(user));
                
                // 4. Mostrar alerta y redireccionar según rol
                Swal.fire({
                    icon: 'success',
                    title: `¡Bienvenido, ${user.nombre}!`,
                    text: 'Has iniciado sesión correctamente.',
                    timer: 2500,
                    showConfirmButton: false,
                    timerProgressBar: true
                }).then(() => {
                    // Small delay for a smoother transition
                    setTimeout(() => {
                        if (user.role === 'admin') {
                            window.location.href = 'admin-panel.html';
                        } else if (user.role === 'evaluador') {
                            window.location.href = 'evaluador-panel.html';
                        } else {
                            window.location.href = 'estudiante-catalogo.html';
                        }
                    }, 300);
                });

            } catch (error) {
                console.error("Error en login:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error de conexión',
                    text: 'Hubo un fallo al intentar iniciar sesión.',
                    confirmButtonColor: '#004481'
                });
            }
        });
    }
});
