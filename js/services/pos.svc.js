(function(ns){

    ns.app.service('pos', Service);


    function Service($location)
    {

        var controller = new ScrollMagic.Controller({
            globalSceneOptions: {
                triggerHook: 'onLeave'
            }
        });

        return new (function PositionService()
        {
            this.controller = controller;

            /**
             * Return the current window scrollY position.
             * @returns {Number}
             */
            this.get = function()
            {
                return window.scrollY;
            };

            /**
             * Add a scene to the scroll magic controller.
             * @param element string|element
             * @param callback function
             * @returns PositionService
             */
            this.addScene = function(element, callback)
            {
                var scene = new ScrollMagic.Scene({
                    triggerElement: element
                });
                if (callback) callback(scene);

                scene.addTo(this.controller);
                return this;
            }
        })();
    }



})(window.bstar);