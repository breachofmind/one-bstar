(function(ns){

    ns.app.service('mousewheel', MouseWheelService);

    var scrollIntervalTimeout = 600; //ms

    function MouseWheelService($window)
    {
        var interval;

        function scrollInterval()
        {
            clearTimeout(interval);
            interval = null;
        }

        return function(mouseWheelHandler)
        {
            var handler = function(event)
            {
                event.preventDefault();

                // Firefox delta needs to be reversed.
                if (event.type == 'DOMMouseScroll') {
                    event.deltaY = -Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
                }
                event.direction = {
                    UP: event.deltaY > 0,
                    DN: event.deltaY < 0
                };


                // Set an interval that disables scrolling too quickly.
                if (interval) return;

                mouseWheelHandler(event);
                interval = setTimeout(scrollInterval, scrollIntervalTimeout);
            };

            $window.addEventListener('DOMMouseScroll', handler);
            //$window.addEventListener('mousewheel', handler);
            $window.addEventListener('wheel', handler);
        }
    }



})(window.bstar);