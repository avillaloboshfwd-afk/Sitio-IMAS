/**
 * gestionBecas.js
 * Lógica para la gestión de becas (CRUD) desde el panel administrativo.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('tabla-becas-body');
    const formBeca = document.getElementById('form-beca');
    const modal = document.getElementById('modal-beca');
    const btnNueva = document.getElementById('btn-nueva-beca');
    const becaIdInput = document.getElementById('beca-id');
    const logoutBtn = document.getElementById('logoutBtn');

    // Cargar becas al iniciar
    await cargarBecas();

    async function cargarBecas() {
        try {
            const becas = await api.get('becas');
            renderBecas(becas);
        } catch (error) {
            console.error("Error al cargar becas:", error);
            tableBody.innerHTML = '<tr><td colspan="4">Error al cargar las becas.</td></tr>';
        }
    }

    function renderBecas(becas) {
        tableBody.innerHTML = '';
        becas.forEach(beca => {
            const tr = document.createElement('tr');
            const estadoClass = beca.estado.toLowerCase() === 'abierta' ? 'status-open' : 'status-closed';
            
            tr.innerHTML = `
                <td><strong>${beca.nombre}</strong></td>
                <td>${beca.descripcion}</td>
                <td><span class="status-indicator ${estadoClass}">${beca.estado}</span></td>
                <td>
                    <button class="btn-action edit-btn" data-id="${beca.id}" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="btn-action delete-btn" data-id="${beca.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        // Event listeners para botones de acción
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', handleEdit);
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
    }

    async function handleEdit(e) {
        const id = e.currentTarget.dataset.id;
        try {
            const becas = await api.get('becas');
            const beca = becas.find(b => b.id.toString() === id.toString());
            if (beca) {
                document.getElementById('modal-titulo').innerText = 'Editar Beca';
                becaIdInput.value = beca.id;
                document.getElementById('nombre').value = beca.nombre;
                document.getElementById('descripcion').value = beca.descripcion;
                document.getElementById('requisitos').value = beca.requisitos || '';
                document.getElementById('estado').value = beca.estado;
                document.getElementById('imagen').value = beca.imagen || '';
                modal.style.display = 'flex';
            }
        } catch (error) {
            console.error("Error al obtener detalle de beca:", error);
        }
    }

    async function handleDelete(e) {
        const id = e.currentTarget.dataset.id;
        
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta beca se eliminará de forma permanente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#004481',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await api.delete('becas', id);
                await cargarBecas();
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminada!',
                    text: 'La beca ha sido eliminada correctamente.',
                    confirmButtonColor: '#004481'
                });
            } catch (error) {
                console.error("Error al eliminar beca:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar la beca.',
                    confirmButtonColor: '#004481'
                });
            }
        }
    }

    formBeca.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = becaIdInput.value;
        const becaData = {
            nombre: document.getElementById('nombre').value,
            descripcion: document.getElementById('descripcion').value,
            requisitos: document.getElementById('requisitos').value,
            estado: document.getElementById('estado').value,
            imagen: document.getElementById('imagen').value
        };

        try {
            if (id) {
                // Editar
                await api.put('becas', id, becaData);
            } else {
                // Crear
                becaData.id = Date.now().toString(); // Simple ID generation
                await api.post('becas', becaData);
            }
            modal.style.display = 'none';
            formBeca.reset();
            becaIdInput.value = '';
            await cargarBecas();
            
            Swal.fire({
                icon: 'success',
                title: 'Beca Guardada',
                text: id ? 'Los cambios han sido aplicados correctamente.' : 'La nueva beca ha sido creada con éxito.',
                confirmButtonColor: '#004481'
            });
        } catch (error) {
            console.error("Error al guardar beca:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error de guardado',
                text: 'Hubo un fallo al intentar procesar la beca.',
                confirmButtonColor: '#004481'
            });
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuarioActivo');
            Swal.fire({
                icon: 'info',
                title: 'Sesión Cerrada',
                text: 'Saliendo del panel administrativo...',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                window.location.href = 'index.html';
            });
        });
    }
});
