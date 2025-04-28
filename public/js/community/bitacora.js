function toggleDateMenu() {
    const dateMenu = document.getElementById('dateMenu');
    dateMenu.classList.toggle('show');
}

function selectDate(date) {
    console.log('Fecha seleccionada:', date);
    // Aquí puedes agregar lógica para manejar la fecha seleccionada, como filtrar contenido
    toggleDateMenu(); // Cierra el menú después de seleccionar una fecha
}

// Cerrar el menú si se hace clic fuera de él
document.addEventListener('click', function(event) {
    const dateMenu = document.getElementById('dateMenu');
    const dateButton = document.querySelector('.date-button');
    if (!dateMenu.contains(event.target) && !dateButton.contains(event.target)) {
        dateMenu.classList.remove('show');
    }
});
