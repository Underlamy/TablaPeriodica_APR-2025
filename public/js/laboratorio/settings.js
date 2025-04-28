$(document).ready(function () {
    $('#settings').click(function () {
        $('.menu_filter').css("display", "block");
    });

    $('.close').click(function () {
        $('.menu_filter').css("display", "none");
    });
});
