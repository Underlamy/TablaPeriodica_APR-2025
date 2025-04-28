function warn(type, text) {
    if (document.getElementsByClassName("alerta").length > 0) {
        document.getElementsByClassName("alerta")[0].remove();
        warn(type, text);
    } else {
        let typeClass = "";
        switch (type) {
            case "warning":
                typeClass += "fa-triangle-exclamation warning";
                break;

            case "error":
                typeClass += "fa-circle-xmark error";
                break;

            case "info":
                typeClass += "fa-circle-info info";
                break;
        }

        const alerta = document.createElement("div");
        document.getElementsByTagName("body")[0].appendChild(alerta);
        alerta.setAttribute("class", "alerta");

        const icon = document.createElement("i");
        alerta.appendChild(icon);
        icon.setAttribute("class", "fa-solid fa-2xl " + typeClass);

        const span = document.createElement("span");
        alerta.appendChild(span);
        span.setAttribute("class", "text");
        span.innerHTML = text;

        setTimeout(function () {
            alerta.remove();
        }, 10000)
    }
}

export {warn}