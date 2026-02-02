document.addEventListener("DOMContentLoaded", async () => {
    // Protección
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
    if (!usuarioActivo || usuarioActivo.role !== "admin") {
        window.location.href = "login.html";
        return;
    }

    const tableBody = document.getElementById("tabla-becas-body");
    const modal = document.getElementById("modal-beca");
    const form = document.getElementById("form-beca");
    const btnNueva = document.getElementById("btn-nueva-beca");
    const btnCerrarModal = document.getElementById("close-modal");

    // Listeners Modal
    btnNueva.addEventListener("click", () => showModal());
    btnCerrarModal.addEventListener("click", () => modal.style.display = "none");
    window.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });

    // Cargar Becas
    cargarBecas();

    async function cargarBecas() {
        try {
            const becas = await api.get("becas");
            tableBody.innerHTML = "";
            becas.forEach(beca => {
                const row = document.createElement("tr");
                const badgeClass = beca.estado === 'Abierta' ? 'badge badge-success' : 'badge badge-danger';
                
                row.innerHTML = `
                    <td><strong>${beca.nombre}</strong></td>
                    <td>${beca.descripcion.substring(0, 50)}...</td>
                    <td><span class="${badgeClass}">${beca.estado}</span></td>
                    <td>
                        <button class="btn btn-ghost" title="Editar" onclick="editarBeca('${beca.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-ghost" title="Cambiar Estado" onclick="toggleEstado('${beca.id}', '${beca.estado}')"><i class="fas fa-sync-alt"></i></button>
                        <button class="btn btn-ghost" title="Eliminar" onclick="eliminarBeca('${beca.id}')" style="color: var(--danger-red);"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error(error);
            alert("Error cargando becas");
        }
    }

    // Funciones globales para los botones onclick
    window.editarBeca = async (id) => {
        try {
            const beca = await api.get(`becas/${id}`);
            showModal(beca);
        } catch (error) {
            console.error(error);
        }
    };

    window.toggleEstado = async (id, estadoActual) => {
        const nuevoEstado = estadoActual === "Abierta" ? "Cerrada" : "Abierta";
        if (!confirm(`¿Cambiar estado a ${nuevoEstado}?`)) return;

        try {
            // Primero obtenemos la beca completa para no perder otros campos
            const beca = await api.get(`becas/${id}`);
            await api.put(`becas/${id}`, { ...beca, estado: nuevoEstado });
            cargarBecas();
        } catch (error) {
            console.error(error);
            alert("Error al cambiar estado");
        }
    };

    window.eliminarBeca = async (id) => {
        if (!confirm("¿Está seguro de eliminar esta beca? Esta acción no se puede deshacer.")) return;
        try {
            await api.delete(`becas/${id}`);
            cargarBecas();
        } catch (error) {
            console.error(error);
            alert("Error al eliminar");
        }
    };

    // Manejo del Formulario
    function showModal(beca = null) {
        document.getElementById("modal-titulo").innerText = beca ? "Editar Beca" : "Nueva Beca";
        document.getElementById("beca-id").value = beca ? beca.id : "";
        document.getElementById("nombre").value = beca ? beca.nombre : "";
        document.getElementById("descripcion").value = beca ? beca.descripcion : "";
        document.getElementById("requisitos").value = beca && beca.requisitos ? beca.requisitos : "";
        document.getElementById("estado").value = beca ? beca.estado : "Abierta";
        modal.style.display = "flex";
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const id = document.getElementById("beca-id").value;
        const nombre = document.getElementById("nombre").value;
        const descripcion = document.getElementById("descripcion").value;
        const requisitos = document.getElementById("requisitos").value;
        const estado = document.getElementById("estado").value;

        const data = { nombre, descripcion, requisitos, estado };

        try {
            if (id) {
                // Editar
                await api.put(`becas/${id}`, { id, ...data });
            } else {
                // Nueva
                await api.post("becas", { id: Date.now().toString(), ...data });
            }
            modal.style.display = "none";
            cargarBecas();
        } catch (error) {
            console.error(error);
            alert("Error al guardar");
        }
    });

    // Logout
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("usuarioActivo");
        window.location.href = "login.html";
    });
});
