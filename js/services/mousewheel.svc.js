(function(ns){

    ns.app.service('mousewheel', MouseWheelService);

    function MouseWheelService($window)
    {
        function extendEvent(event)
        {
            // Firefox delta needs to be reversed.
            if (event.type == 'DOMMouseScroll') {
                event.deltaY = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
            }
            event.direction = {
                UP: event.deltaY > 0,
                DN: event.deltaY < 0
            }
        }

        return function(mouseWheelHandler)
        {

            // IE9, Chrome, Safari, Opera
            $window.addEventListener('mousewheel', function(event){
                extendEvent(event);
                mouseWheelHandler(event);
            });

            // Firefox
            $window.addEventListener('DOMMouseScroll', function(event) {
                extendEvent(event);
                mouseWheelHandler(event);
            })
        }
    }



})(window.bstar);