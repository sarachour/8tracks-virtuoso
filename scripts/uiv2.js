document.addEventListener('DOMContentLoaded', function() {
    jQuery(function($) {
        // Just call the inner layout once to initialize it. This
        // must happen before the outer layout is initialized. It
        // will be automatically resized when the outer layout is
        // resized.
        $('.layout-inner').layout();
        $('.horizontal').layout();

        var outerContainer = $('.layout-outer');

        function layout() {
          outerContainer.layout({resize: false});
        }
        layout();


        $(window).resize(layout);

        // This selector is changed to only select the west and east
        // components of the outer layout.
        $('.layout-outer > .east').resizable({
          handles: 'w',
          stop: layout
        });

        $('.layout-outer > .west').resizable({
          handles: 'e',
          stop: layout
        });
      });


})