const colores = [
    [nombre = "noMetales", color = "rgb(255, 71, 71)"],
    [nombre = "metaloides", color = "rgb(250, 71, 255)"],
    [nombre = "gasesNobles", color = "rgb(255, 197, 71)"],
    [nombre = "metalesAlcalinos", color = "rgb(125, 255, 90)"],
    [nombre = "halogenos", color = "rgb(255, 146, 54)"],
    [nombre = "alcalinoTerreos", color = "rgb(72, 224, 138)"],
    [nombre = "metalesTransicion", color = "rgb(79, 188, 255)"],
    [nombre = "otrosMetales", color = "rgb(184, 79, 255)"],
    [nombre = "lantanidos", color = "rgb(107, 107, 107)"],
    [nombre = "actinidos", color = "rgb(48, 48, 48)"],
	[nombre = "hidracidos", color = "rgb(255, 109, 62)"],
	[nombre = "hidrurosMetalicos", color = "rgb(221, 4, 109)"],
	[nombre = "hidrurosNoMetalicos", color = "rgb(246, 126, 125)"],
	[nombre = "oxidosNoMetalicos", color = "rgb(0, 255, 208)"],
	[nombre = "oxidosMetalicos", color = "rgb(0, 110, 255)"],
	[nombre = "salesBinarias", color = "rgb(190, 136, 220)"],
	[nombre = "aleacion", color = "rgb(141, 182, 0)"],
	[nombre = "desconocido", color = "rgb(191, 208, 202)"]
];

const nombres = [
    [tabla = "otrosMetales", nombre = "otros metales"],
    [tabla = "noMetales", nombre = "no metales"],
    [tabla = "metaloides", nombre = "metaloides"],
    [tabla = "metalesTransicion", nombre = "metales de transicion"],
    [tabla = "metalesAlcalinos", nombre = "metales alcalinos"],
    [tabla = "lantanidos", nombre = "lantanidos"],
    [tabla = "halogenos", nombre = "halogenos"],
    [tabla = "gasesNobles", nombre = "gases nobles"],
    [tabla = "alcalinoTerreos", nombre = "alcalino terreos"],
    [tabla = "actinidos", nombre = "actinidos"],
	[tabla = "hidrurosMetalicos", nombre = "hidruros metalicos"],
	[tabla = "hidrurosNoMetalicos", nombre = "hidruros no metalicos"],
	[tabla = "hidracidos", nombre = "hidracidos"],
	[tabla = "oxidosNoMetalicos", nombre = "oxidos no metalicos"],
	[tabla = "oxidosMetalicos", nombre = "oxidos metalicos"],
	[tabla = "salesBinarias", nombre = "sales binarias"],
	[tabla = "aleacion", nombre = "aleacion"],
	[tabla = "desconocido", nombre = "desconocido"]
];

function numRomanos(num){
	num = parseInt(num);
	let numRomano;

	switch(num){
		case 1:
			numRomano = "(I)";
			break;
		case 2:
			numRomano = "(II)";
			break;
		case 3:
			numRomano = "(III)";
			break;
		case 4:
			numRomano = "(IV)";
			break;
		case 5:
			numRomano = "(V)";
			break;
		case 6:
			numRomano = "(VI)";
			break;
		case 7:
			numRomano = "(VII)";
			break;
		case 8:
			numRomano = "(VIII)";
			break;
		default:
			numRomano = "";
			break;
	}

	return numRomano;
}
