// Redirigir cuando no hay un usuario logueado
window.onload = () => {
    const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
    if (!usuarioActual) {
        window.location.href = "login.html";
    }
    renderizarPublicaciones();
};

document.getElementById("menu-toggle").onclick = () => {
    document.getElementById("dropdown-menu").classList.toggle("hidden");
};

// Renderizar publicaciones
function renderizarPublicaciones() {
    const postsSection = document.getElementById("posts-section");
    postsSection.innerHTML = "";
    let publicaciones = JSON.parse(localStorage.getItem("publicaciones")) || [];
    let usuarioActual = JSON.parse(localStorage.getItem("usuarioActual")) || {};

    publicaciones.forEach((pub, index) => {
        if (!pub.nombreUsuario || !pub.fotoPerfil || !pub.contenido || !pub.tiempoPublicacion) {
            return; // Ignorar publicaciones inválidas
        }

        // Inicializar arrays si no existen
        if (!pub.likes) pub.likes = [];
        if (!pub.comentarios) pub.comentarios = [];

        const isLiked = pub.likes.includes(usuarioActual.nombreUsuario);
        
        const postElement = document.createElement("article");
        postElement.classList.add("post-card");
        postElement.innerHTML = `
            <div class="post-header">
                <img src="${pub.fotoPerfil}" alt="Avatar Usuario" class="avatar" />
                <div class="post-info">
                    <h3>${pub.nombreUsuario}</h3>
                    <p>Publicado el ${pub.tiempoPublicacion}</p>
                </div>
                ${usuarioActual.nombreUsuario === pub.nombreUsuario ? `
                    <button aria-label="Delete item" class="delete-button" onclick="confirmarEliminacion(${index})">
                        <svg class="trash-svg" viewBox="0 -10 64 74" xmlns="http://www.w3.org/2000/svg">
                            <g id="trash-can">
                                <rect x="16" y="24" width="32" height="30" rx="3" ry="3" fill="#e74c3c"></rect>
                                <g transform-origin="12 18" id="lid-group">
                                    <rect x="12" y="12" width="40" height="6" rx="2" ry="2" fill="#c0392b"></rect>
                                    <rect x="26" y="8" width="12" height="4" rx="2" ry="2" fill="#c0392b"></rect>
                                </g>
                            </g>
                        </svg>
                    </button>
                ` : ''}
            </div>
            <div class="post-content">
                <p>${LZString.decompress(pub.contenido)}</p>
            </div>
            <div class="post-actions">
                <button class="like-button ${isLiked ? 'liked' : ''}" onclick="toggleLike(${index})">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <span>${pub.likes.length}</span>
                </button>
                <button class="comment-button" onclick="toggleComments(${index})">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                    <span>${pub.comentarios.length}</span>
                </button>
            </div>
            <div id="comments-${index}" class="comment-section" style="display: none;">
                <div class="comments-list">
                    ${renderComentarios(pub.comentarios, index)}
                </div>
                <form class="comment-form" onsubmit="agregarComentario(event, ${index})">
                    <input type="text" placeholder="Escribe un comentario..." required />
                    <button type="submit">Enviar</button>
                </form>
            </div>
        `;
        postsSection.appendChild(postElement);
    });

    // Guardar las publicaciones actualizadas en localStorage
    localStorage.setItem("publicaciones", JSON.stringify(publicaciones));
}

// Renderizar comentarios
function renderComentarios(comentarios, postIndex) {
    if (!comentarios || comentarios.length === 0) {
        return '<p>No hay comentarios aún.</p>';
    }

    let usuarioActual = JSON.parse(localStorage.getItem("usuarioActual")) || {};

    return comentarios.map((comentario, index) => `
        <div class="comment">
            <div class="comment-header">
                <img src="${comentario.fotoPerfil}" alt="Avatar" class="comment-avatar" />
                <span class="comment-username">${comentario.nombreUsuario}</span>
                <span class="comment-time">${comentario.tiempo}</span>
            </div>
            <div class="comment-content">
                <p>${comentario.texto}</p>
            </div>
            ${comentario.nombreUsuario === usuarioActual.nombreUsuario ? `
                <button class="delete-comment-button" aria-label="Delete comment" onclick="eliminarComentario(${postIndex}, ${index})">
                    <svg class="trash-svg" viewBox="0 -10 64 74" xmlns="http://www.w3.org/2000/svg">
                        <g id="trash-can">
                            <rect x="16" y="24" width="32" height="30" rx="3" ry="3" fill="#e74c3c"></rect>
                            <g transform-origin="12 18" id="lid-group">
                                <rect x="12" y="12" width="40" height="6" rx="2" ry="2" fill="#c0392b"></rect>
                                <rect x="26" y="8" width="12" height="4" rx="2" ry="2" fill="#c0392b"></rect>
                            </g>
                        </g>
                    </svg>
                </button>
            ` : ''}
        </div>
    `).join('');
}

// Eliminar comentario
function eliminarComentario(postIndex, commentIndex) {
    if (confirm("¿Seguro que quieres eliminar este comentario?")) {
        let publicaciones = JSON.parse(localStorage.getItem("publicaciones")) || [];
        let usuarioActual = JSON.parse(localStorage.getItem("usuarioActual")) || {};
        
        // Verificar que el comentario pertenece al usuario actual
        if (publicaciones[postIndex].comentarios[commentIndex].nombreUsuario !== usuarioActual.nombreUsuario) {
            alert("No puedes eliminar este comentario.");
            return;
        }
        
        // Eliminar el comentario
        publicaciones[postIndex].comentarios.splice(commentIndex, 1);
        localStorage.setItem("publicaciones", JSON.stringify(publicaciones));
        renderizarPublicaciones();
        
        // Mantener la sección de comentarios abierta
        document.getElementById(`comments-${postIndex}`).style.display = "block";
    }
}

// Toggle like
function toggleLike(index) {
    let publicaciones = JSON.parse(localStorage.getItem("publicaciones")) || [];
    let usuarioActual = JSON.parse(localStorage.getItem("usuarioActual")) || {};

    if (!usuarioActual.nombreUsuario) {
        alert("Debes iniciar sesión para dar like.");
        return;
    }

    if (!publicaciones[index].likes) {
        publicaciones[index].likes = [];
    }

    const userIndex = publicaciones[index].likes.indexOf(usuarioActual.nombreUsuario);
    
    if (userIndex === -1) {
        // Agregar like
        publicaciones[index].likes.push(usuarioActual.nombreUsuario);
    } else {
        // Quitar like
        publicaciones[index].likes.splice(userIndex, 1);
    }

    localStorage.setItem("publicaciones", JSON.stringify(publicaciones));
    renderizarPublicaciones();
}

// Toggle comments
function toggleComments(index) {
    const commentsSection = document.getElementById(`comments-${index}`);
    if (commentsSection.style.display === "none") {
        commentsSection.style.display = "block";
    } else {
        commentsSection.style.display = "none";
    }
}

// Agregar comentario
function agregarComentario(event, index) {
    event.preventDefault();
    
    let publicaciones = JSON.parse(localStorage.getItem("publicaciones")) || [];
    let usuarioActual = JSON.parse(localStorage.getItem("usuarioActual")) || {};

    if (!usuarioActual.nombreUsuario) {
        alert("Debes iniciar sesión para comentar.");
        return;
    }

    const form = event.target;
    const comentarioTexto = form.querySelector('input').value.trim();
    
    if (!comentarioTexto) return;

    if (!publicaciones[index].comentarios) {
        publicaciones[index].comentarios = [];
    }

    const nuevoComentario = {
        nombreUsuario: usuarioActual.nombreUsuario,
        fotoPerfil: usuarioActual.fotoPerfil,
        texto: comentarioTexto,
        tiempo: new Date().toLocaleString()
    };

    publicaciones[index].comentarios.push(nuevoComentario);
    localStorage.setItem("publicaciones", JSON.stringify(publicaciones));
    
    form.reset();
    renderizarPublicaciones();
    
    // Mantener la sección de comentarios abierta
    document.getElementById(`comments-${index}`).style.display = "block";
}

// Agregar publicación
function agregarPublicacion() {
    const contenido = document.querySelector(".new-post-form textarea").value.trim();
    if (!contenido) return;

    const usuario = JSON.parse(localStorage.getItem("usuarioActual"));

    // Validar que el usuario existe y tiene los campos requeridos
    if (!usuario || !usuario.nombreUsuario || !usuario.fotoPerfil) {
        alert("No se ha encontrado el usuario. Inicia sesión.");
        return;
    }

    const nuevaPublicacion = {
        nombreUsuario: usuario.nombreUsuario,
        fotoPerfil: usuario.fotoPerfil,
        contenido: LZString.compress(contenido.substring(0, 200)),
        tiempoPublicacion: new Date().toLocaleString() || "Fecha desconocida",
        likes: [],
        comentarios: []
    };

    let publicaciones = JSON.parse(localStorage.getItem("publicaciones")) || [];
    publicaciones.unshift(nuevaPublicacion);
    localStorage.setItem("publicaciones", JSON.stringify(publicaciones));

    document.querySelector(".new-post-form textarea").value = "";
    renderizarPublicaciones();
}

// Confirmar eliminación de publicación
function confirmarEliminacion(index) {
    if (confirm("¿Seguro que quieres eliminar esta publicación?")) {
        eliminarPublicacion(index);
    }
}

// Eliminar publicación
function eliminarPublicacion(index) {
    let publicaciones = JSON.parse(localStorage.getItem("publicaciones")) || [];
    let usuarioActual = JSON.parse(localStorage.getItem("usuarioActual")) || {};

    if (publicaciones[index].nombreUsuario !== usuarioActual.nombreUsuario) {
        alert("No puedes eliminar esta publicación.");
        return;
    }

    publicaciones.splice(index, 1);
    localStorage.setItem("publicaciones", JSON.stringify(publicaciones));
    renderizarPublicaciones();
}

// Evento para agregar publicación
document.querySelector(".new-post-form").addEventListener("submit", function(event) {
    event.preventDefault();
    agregarPublicacion();
});

// Evento para renderizar publicaciones al cargar la página
window.addEventListener("DOMContentLoaded", renderizarPublicaciones);

// Contador de caracteres
const postContent = document.getElementById("postContent");
const charCount = document.getElementById("charCount");
postContent.addEventListener("input", () => {
    const currentLength = postContent.value.length;
    charCount.textContent = `${currentLength}/200`;
    charCount.style.color = currentLength >= 180 ? "red" : "#f4f4f4";
});

