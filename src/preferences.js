
function SetupLayout(){
    var outerContainer = $('#prefs').layout({resize: false});

    function layout() {
        outerContainer.layout({resize: false});
    }


    $('.toggle-button').click(function(){
        $(this).toggleClass("down");
    });
    $('.layout-outer > .east').resizable({
        handles: 'w',
        stop: layout
    });

    $('.layout-outer > .west').resizable({
        handles: 'e',
        stop: layout
    });
    $( window ).resize(function() {
      $('#prefs').layout({resize: false});
    });
}


document.addEventListener('DOMContentLoaded', function() {
    SetupLayout();

});