import { startAnimation, stop } from "./functions.js";
import { camera } from "./init.js";

startAnimation(30);

$(document).ready(function () {
    $(window).on('resize', function(event){
        event.preventDefault();

        $('#canvaElectron').css('width', $('#canvasElectron').css("width"));
        $('#canvaElectron').css('height', $('#canvasElectron').css("height"));
        
        $('#canvaProton').css('width', $('#canvasProton').css("width"));
        $('#canvaProton').css('height', $('#canvasProton').css("height"));

        $('#canvaNeutron').css('width', $('#canvasNeutron').css("width"));
        $('#canvaNeutron').css('height', $('#canvasNeutron').css("height"));

        $('#canvaElemento').css('width', $('#canvasElemento').css("width"));
        $('#canvaElemento').css('height', $('#canvasElemento').css("height"));
    
        camera.aspect = getWidth() / getHeight();
        camera.updateProjectionMatrix();
    });

    $('#pause').click(function(){
        $('#pause').removeClass();
        if ($('#pause').val() == 'true') {
            $('#pause').val('false');
            $('#pause').addClass("fa-solid fa-pause");
            stop.value = false;
        } else {
            $('#pause').val('true');
            $('#pause').addClass("fa-solid fa-play");
            stop.value = true;
            startAnimation(30);
        }
    });

	$('#fusion').click(function(){
		let texto = this.getElementsByClassName("texto")[0].innerHTML;
		let tipo = texto.slice(texto.length - 1);
		texto = parseInt(texto);

		console.log(tipo);

		let temp;
		switch(tipo){
			case "C":
				//Celcius a Farenheit
				temp = ((texto * 1.8) + 32).toFixed(3);
				temp = temp + "°F";
				break;

			case "F":
				//Farenheit a Kelvin
				temp = (((texto - 32) / 1.8) + 273.15).toFixed(3);
				temp = temp + "K";
				break;

			case "K":
				//Kelvin a Celcius
				temp = (texto - 273.15).toFixed(3);
				temp = temp + "°C";
				break;
		}

		this.getElementsByClassName("texto")[0].innerHTML = temp;
	});

	$('#ebullicion').click(function(){
		let texto = this.getElementsByClassName("texto")[0].innerHTML;
		let tipo = texto.slice(texto.length - 1);
		texto = parseInt(texto);

		console.log(tipo);

		let temp;
		switch(tipo){
			case "C":
				//Celcius a Farenheit
				temp = ((texto * 1.8) + 32).toFixed(3);
				temp = temp + "°F";
				break;

			case "F":
				//Farenheit a Kelvin
				temp = (((texto - 32) / 1.8) + 273.15).toFixed(3);
				temp = temp + "K";
				break;

			case "K":
				//Kelvin a Celcius
				temp = (texto - 273.15).toFixed(3);
				temp = temp + "°C";
				break;
		}

		this.getElementsByClassName("texto")[0].innerHTML = temp;
	});

	$('#redirect').change(function(){
		let z = parseInt(document.getElementById("protones").innerHTML);
		let masa = parseInt(document.getElementById("redirect").value);
		window.location.href = "/tablaPeriodica?z=" + z + "&masa=" + masa;
	});
});
