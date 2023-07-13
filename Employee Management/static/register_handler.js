$(document).ready(function () {
    $("#accounttype_manager").click(function () {
        if( $(this).is(':checked') ) {
            $("#departments").toggle();
          }
        else if( $('#accounttype_employee').is(':checked')) {
            $("#departments").hide();
          }
    });
}); 


