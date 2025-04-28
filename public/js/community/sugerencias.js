function selectAll() {
    document.querySelectorAll('.filter-checkbox').forEach(checkbox => checkbox.checked = true);
}

function clearAll() {
    document.querySelectorAll('.filter-checkbox').forEach(checkbox => checkbox.checked = false);
}

// Manejo del hover con JavaScript
const filterButton = document.querySelector('.filter-button');
const filterMenu = document.querySelector('.filter-menu');
let timeout;

filterButton.addEventListener('mouseenter', () => {
    clearTimeout(timeout); // Cancela cualquier temporizador de cierre
    filterMenu.classList.add('show'); // Muestra el menú
});

filterButton.addEventListener('mouseleave', () => {
    timeout = setTimeout(() => {
        filterMenu.classList.remove('show'); // Oculta el menú después de 1 segundo
    }, 1000); // Retraso de 1 segundo
});

filterMenu.addEventListener('mouseenter', () => {
    clearTimeout(timeout); // Cancela el temporizador mientras el mouse está en el menú
});

filterMenu.addEventListener('mouseleave', () => {
    timeout = setTimeout(() => {
        filterMenu.classList.remove('show'); // Oculta el menú después de 1 segundo
    }, 1000); // Retraso de 1 segundo
});

const inputBox = document.querySelector('.input-box');
const modal = document.querySelector('#chatModal');
const modalTextarea = document.querySelector('#modalTextarea');
const titleInput = document.querySelector('#titleInput');
const generalInput = document.querySelector('#generalInput');

inputBox.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && inputBox.value.trim() !== '') {
        modalTextarea.value = inputBox.value; // Transferir el texto al textarea del modal
        modal.style.display = 'flex'; // Mostrar el modal
        titleInput.disabled = false; // Habilitar el input de TITULO
        generalInput.disabled = false; // Habilitar el input de GENERAL
        inputBox.value = ''; // Limpiar el input-box
    }
});

// Cerrar el modal
function closeModal() {
    modal.style.display = 'none';
    titleInput.disabled = true; // Deshabilitar el input de TITULO
    generalInput.disabled = true; // Deshabilitar el input de GENERAL
    titleInput.value = ''; // Limpiar el input de TITULO
    generalInput.value = ''; // Limpiar el input de GENERAL
}

$(document).ready(function () {
	$(".filter-checkbox").change(function() {
		if ($(this).prop("checked")) {
			let id = $(this).prop("id");
			$("." + id).css("display", "none");
		} else {
			let id = $(this).prop("id");
			$("." + id).css("display", "block");
		}
	});

	$('.up').bind("click", clickLike);
	$('.upBlock').bind("click", clickLikeBlock);
	$('.down').bind("click", clickDisLike);
	$('.downBlock').bind("click", clickDisLikeBlock);

	function clickLike(){
		let valores = $(this).closest('.reactions').find('input[type="hidden"]');
		let idUsuario = valores.data('usuario');
		let idSugerencia = valores.data('sugerencia');
		$(this).removeClass("up").addClass("upBlock");

		$.ajax({
			url: 'http://localhost:3000/like',
			type: 'POST',               
			contentType: 'application/json',
			data: JSON.stringify({  
				idUsuario: idUsuario,
				idSugerencia: idSugerencia
			}),
			success: function(response) {
				console.log('Respuesta del servidor:', response);
			},
			error: function(xhr, status, error) {
				console.error('Error:', error);
			}
		});

		let contLikes = parseInt($(this).closest('.reaction').text());
		contLikes++;
		let nodoTexto = $(this).closest('.reaction').contents().filter(function() {
			return this.nodeType === 3; // 3 = Nodo de texto
		}).first();
		nodoTexto.replaceWith(contLikes);

		$(this).unbind("click");
		$(this).bind("click", clickLikeBlock);
	}

	function clickLikeBlock(){
		let valores = $(this).closest('.reactions').find('input[type="hidden"]');
		let idUsuario = valores.data('usuario');
		let idSugerencia = valores.data('sugerencia');
		$(this).removeClass("upBlock").addClass("up");

		$.ajax({
			url: 'http://localhost:3000/antilike',
			type: 'POST',               
			contentType: 'application/json',
			data: JSON.stringify({  
				idUsuario: idUsuario,
				idSugerencia: idSugerencia
			}),
			success: function(response) {
				console.log('Respuesta del servidor:', response);
			},
			error: function(xhr, status, error) {
				console.error('Error:', error);
			}
		});

		let contLikes = parseInt($(this).closest('.reaction').text());
		contLikes--;
		let nodoTexto = $(this).closest('.reaction').contents().filter(function() {
			return this.nodeType === 3; // 3 = Nodo de texto
		}).first();
		nodoTexto.replaceWith(contLikes);

		$(this).unbind("click");
		$(this).bind("click", clickLike);
	}

	function clickDisLike(){
		let valores = $(this).closest('.reactions').find('input[type="hidden"]');
		let idUsuario = valores.data('usuario');
		let idSugerencia = valores.data('sugerencia');
		$(this).removeClass("down").addClass("downBlock");

		$.ajax({
			url: 'http://localhost:3000/dislike',
			type: 'POST',               
			contentType: 'application/json',
			data: JSON.stringify({  
				idUsuario: idUsuario,
				idSugerencia: idSugerencia
			}),
			success: function(response) {
				console.log('Respuesta del servidor:', response);
			},
			error: function(xhr, status, error) {
				console.error('Error:', error);
			}
		});

		let contLikes = parseInt($(this).closest('.reaction').text());
		contLikes++;
		let nodoTexto = $(this).closest('.reaction').contents().filter(function() {
			return this.nodeType === 3; // 3 = Nodo de texto
		}).first();
		nodoTexto.replaceWith(contLikes);

		$(this).unbind("click");
		$(this).bind("click", clickDisLikeBlock);
	}

	function clickDisLikeBlock(){
		let valores = $(this).closest('.reactions').find('input[type="hidden"]');
		let idUsuario = valores.data('usuario');
		let idSugerencia = valores.data('sugerencia');
		$(this).removeClass("downBlock").addClass("down");

		$.ajax({
			url: 'http://localhost:3000/antidislike',
			type: 'POST',               
			contentType: 'application/json',
			data: JSON.stringify({  
				idUsuario: idUsuario,
				idSugerencia: idSugerencia
			}),
			success: function(response) {
				console.log('Respuesta del servidor:', response);
			},
			error: function(xhr, status, error) {
				console.error('Error:', error);
			}
		});

		let contLikes = parseInt($(this).closest('.reaction').text());
		contLikes--;
		let nodoTexto = $(this).closest('.reaction').contents().filter(function() {
			return this.nodeType === 3; // 3 = Nodo de texto
		}).first();
		nodoTexto.replaceWith(contLikes);

		$(this).unbind("click");
		$(this).bind("click", clickDisLike);
	}
});
