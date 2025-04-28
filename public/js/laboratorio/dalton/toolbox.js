//Esperamos a que cargue el programa para ejecutar las funciones
$(document).ready(function () {
    //Escondemos los dropdowns
    $('.toggle').css("display", "none");

    //Funcion de dropdown para los isotopos
    $('.toggable').click(function () {
        //Se ejecuta si el elemento es de clase "toggable"
        if ($(this).is('.toggable')) {
            //Animacion del dropdown para los elementos de clase "toggle" adentro de "toggable"
            $('.toggle', this).slideToggle(200);
        }
    });

    //Funcion de busqueda
    //Se activa para elementos con id "searchbox" cada que se escribe en ella
    $('#searchbox').on('input', function () {
        //Tomar valor de la caja de busqueda
        let inputValue = (this.value).toLowerCase();

        //Esconder todos los dropdowns
        $('.toggle').css("display", "none");

        //Ciclo para comparar valor de la caja de busqueda con el id de los elementos
        $('.toggable').each(function(){
            //Cortamos la id para que te tenga la misma longitud que el valor
            let valor = $(this).attr('id').slice(0, inputValue.length);

            //Si los valores coinciden mostramos o escondemos los elementos
            if (inputValue != valor) {
                $(this).css("display", "none");
            }else{
                $(this).css("display", "block");
            }
        });
    });
});