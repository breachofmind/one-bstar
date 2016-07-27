(function(ns){

    ns.app.service('mousewheel', MouseWheelService);

    function MouseWheelService($window)
    {
        return function(mouseWheelHandler)
        {
            var handler = function(event)
            {
                // Firefox delta needs to be reversed.
                if (event.type == 'DOMMouseScroll') {
                    event.deltaY = -Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
                }
                event.direction = {
                    UP: event.deltaY > 0,
                    DN: event.deltaY < 0
                };
                mouseWheelHandler(event);
            };

            $window.addEventListener('DOMMouseScroll', handler);
            //$window.addEventListener('mousewheel', handler);
            $window.addEventListener('wheel', handler);
        }
    }



})(window.bstar);