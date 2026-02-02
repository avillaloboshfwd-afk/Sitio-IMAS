/**
 * catalog.js
 * Handles dynamic loading of scholarships and interaction for Postulacion.html
 */

document.addEventListener('DOMContentLoaded', async () => {
    const openContainer = document.getElementById('lista-becas-abiertas');
    const closedContainer = document.getElementById('lista-becas-cerradas');

    // Remove hardcoded elements if JS loads successfully
    if(openContainer && document.getElementById('becas-abiertas').querySelector('article')) {
       document.getElementById('becas-abiertas').innerHTML = '<h2>Becas Abiertas</h2><div id="lista-becas-abiertas" class="catalog-grid"></div>';
       document.getElementById('becas-cerradas').innerHTML = '<h2>Becas Cerradas</h2><div id="lista-becas-cerradas" class="catalog-grid"></div>';
    }

    const spinner = document.getElementById('loading-spinner');
    
    (async () => {
        try {
            const user = JSON.parse(localStorage.getItem('usuarioActivo'));
            let userAppCount = 0;

            // Fetch applications if user is logged in
            if (user) {
                try {
                    const apps = await api.get(`postulaciones?usuarioEmail=${encodeURIComponent(user.email)}`);
                    userAppCount = Array.isArray(apps) ? apps.length : 0;
                } catch (e) {
                    console.warn("Could not fetch user applications for limit check");
                }
            }

            let scholarships = [];
            try {
                scholarships = await api.get('becas');
            } catch (e) {
                console.warn("API not available, using fallback data");
                scholarships = getFallbackData();
            }

            if (!Array.isArray(scholarships) || scholarships.length === 0) {
                 scholarships = getFallbackData();
            }

            // Preload images
            await Promise.all(scholarships.map(beca => {
                if(beca.imagen) {
                    return new Promise((resolve) => {
                        const img = new Image();
                        img.src = beca.imagen;
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                }
                return Promise.resolve();
            }));

            if (spinner) spinner.style.display = 'none';
            renderScholarships(scholarships, userAppCount);

        } catch (error) {
            console.error("Error loading scholarships:", error);
            if (spinner) spinner.style.display = 'none';
        }
    })();

    function renderScholarships(list, userAppCount) {
        const openList = document.getElementById('lista-becas-abiertas');
        const closedList = document.getElementById('lista-becas-cerradas');

        list.forEach(beca => {
            const card = createCard(beca, userAppCount);
            if (beca.estado.toLowerCase() === 'abierta') {
                openList.appendChild(card);
            } else {
                closedList.appendChild(card);
            }
        });
    }

    function createCard(beca, userAppCount) {
        const article = document.createElement('article');
        const isClosed = beca.estado.toLowerCase() === 'cerrada';
        const limitReached = userAppCount >= 3;
        
        article.className = `beca-card ${isClosed ? 'beca-cerrada' : ''} ${limitReached && !isClosed ? 'beca-limit' : ''}`;
        
        if (beca.imagen) {
            article.style.backgroundImage = `url('${beca.imagen}')`;
        }

        let buttonHtml;
        if (isClosed) {
            buttonHtml = `<button class="btn-postular" disabled>Convocatoria Cerrada</button>`;
        } else if (limitReached) {
            buttonHtml = `<button class="btn-postular" disabled title="Has alcanzado el límite de 3 postulaciones">Límite Alcanzado</button>`;
        } else {
            buttonHtml = `<a href="estudiante-postulacion.html?beca=${beca.id}" class="btn-postular">Postúlate</a>`;
        }

        article.innerHTML = `
            <div class="beca-info-overlay">
                <h3>Beca ${beca.nombre}</h3>
                <p><strong>Carrera:</strong> ${beca.carrera || beca.nombre}</p>
                <div class="beca-details">
                    <p>${beca.descripcion}</p>
                    ${buttonHtml}
                </div>
            </div>
        `;

        return article;
    }

    function getFallbackData() {
        return [
            { id: 1, nombre: "Ingeniería en Sistemas", carrera: "Ingeniería en Sistemas", descripcion: "Apoyo para estudiantes con excelencia académica en tecnología.", estado: "abierta", imagen: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop" },
            { id: 2, nombre: "Educación Primaria", carrera: "Educación", descripcion: "Fomento a la docencia para el desarrollo infantil.", estado: "abierta", imagen: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1000&auto=format&fit=crop" },
            { id: 3, nombre: "Administración", carrera: "Administración de Empresas", descripcion: "Formando líderes para el sector empresarial.", estado: "abierta", imagen: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop" },
            { id: 4, nombre: "Contabilidad", carrera: "Contabilidad y Finanzas", descripcion: "Apoyo financiero para futuros contadores.", estado: "abierta", imagen: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1000&auto=format&fit=crop" },
            { id: 5, nombre: "Enfermería", carrera: "Enfermería", descripcion: "Beca de salud para personal de atención prioritaria.", estado: "abierta", imagen: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1000&auto=format&fit=crop" },
            { id: 8, nombre: "Ingeniería Industrial", carrera: "Ing. Industrial", descripcion: "Optimización de procesos y calidad.", estado: "abierta", imagen: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop" },
            { id: 6, nombre: "Trabajo Social", carrera: "Trabajo Social", descripcion: "Apoyo comunitario y desarrollo humano.", estado: "abierta", imagen: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop" },
            { id: 7, nombre: "Psicología", carrera: "Psicología", descripcion: "Salud mental y acompañamiento profesional.", estado: "cerrada", imagen: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1000&auto=format&fit=crop" }
        ];
    }
});
