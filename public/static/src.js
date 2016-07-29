"use strict";

(function(){
    var ns = {
        app: angular.module('bstar.app', []),
    };

    window.bstar = ns;
})();
(function(ns){

    ns.app.service('pos', PositionService);


    function PositionService($location)
    {

        var controller = new ScrollMagic.Controller({
            globalSceneOptions: {
                //triggerHook: 'onLeave'
            }
        });

        return new (function PositionServiceObject()
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
(function(ns){

    ns.app.controller('app_c', AppController);

    // Disable the anchorScroll behavior.
    // We're using a smooth scrolling behavior instead.
    ns.app.value('$anchorScroll', angular.noop);

    function AppController($scope, $location, $timeout, mousewheel)
    {
        $scope.split = false;

        /**
         * The array of slides. This is filled dynamically.
         * @type {array}
         */
        var slides = getSlideList();

        $scope.slide = 'Home';

        /**
         * Index of the current selected slide in the slides var.
         * @type {number}
         */
        var selected = 0;

        /**
         * Closure for next and prev methods.
         * @param direction string next|prev
         * @returns {Function}
         */
        var change = function(direction)
        {
            return function()
            {
                if (direction == 'next') selected = selected >= slides.length-1 ? slides.length-1 : selected+1;
                if (direction == 'prev') selected = selected <= 0 ? 0 : selected-1;
                go();
            }
        };

        /**
         * Advance the slide.
         * @type {Function}
         */
        $scope.next = change('next');

        /**
         * Retreat the slide.
         * @type {Function}
         */
        $scope.prev = change('prev');

        /**
         * Triggers the view to scroll and updates the hash.
         * @returns void
         */
        var go = function()
        {
            $scope.slide = $scope.getSlide();

            TweenLite.to(window,0.6,{scrollTo:{x:0, y:document.getElementById($scope.slide).offsetTop}, ease:Expo.easeOut});
            $location.hash($scope.slide);
            $scope.$apply();
        };

        /**
         * Public method on the scope to move to the given slide.
         * @param hash string
         * @returns void
         */
        $scope.goto = function(hash)
        {
            if (hash) {
                selected = slides.indexOf(hash);
                go();
            }
        };

        /**
         * Get the current selected slide name.
         * @returns {string}
         */
        $scope.getSlide = function()
        {
            return slides[selected];
        };

        /**
         * Add cross-browser mousewheel behavior.
         * @returns void
         */
        mousewheel(function(e) {
            if (e.direction.UP) return $scope.next();
            if (e.direction.DN) return $scope.prev();
        });

        /**
         * When arriving at the page, wait a second and then change to the hash (if given)
         * @returns int
         */
        $timeout(function(){
            $scope.goto($location.hash());
        },1000);
    }

    /**
     * Return an array of the slide names (the ID attributes).
     * @returns {*}
     */
    function getSlideList()
    {
        var slides = document.querySelectorAll("a[scroll-to]");

        return Array.prototype.slice.call(slides).map(function(element) {
            return element.getAttribute('scroll-to');
        })
    }


})(window.bstar);
(function(ns){

    var url = "/images/one-brightstar.svg";
    var _svg = new Promise(function(resolve,reject)
    {
        d3.xml(url).mimeType("image/svg+xml").get(function(err,xml)
        {
            return err ? reject(err) : resolve(xml);
        });
    });

    var targets = {
        target0: "Goals",
        target1: "Mantra",
        target2: "Strategy",
        target3: "Values",
        target4: "Values",
        target5: "Values",
        target6: "Values",
        target7: "OneBrightstar",
    };

    function SVGDirective()
    {
        return {
            restrict:"E",
            link: function($scope,$element,$attrs)
            {
                _svg.then(function(xml) {
                    $element.append(xml.documentElement);
                    var svg = d3.select("svg#root");

                    Object.keys(targets).forEach(function(key) {
                        svg.select('#'+key).on('click', function(){
                            var target = targets[this.getAttribute('id')];
                            $scope.goto(target);
                        });
                    });


                    $scope.svg = svg;
                })
            }
        };
    }

    return ns.app.directive('bstarOneSvg', SVGDirective);

})(window.bstar);



(function(ns){

    ns.app.directive('slide', SlideDirective);
    ns.app.directive('scrollTo', ScrollToDirective);
    ns.app.directive('useSlide', UseSlideDirective);

    function UseSlideDirective()
    {
        return {
            restrict:"A",
            scope: {
                useSlide: "="
            },
            template:"<div ng-include='getSlide()'></div>",
            link: function($scope,$element,$attrs)
            {
                var templateUrl = "/slides/"+$attrs.useSlide;
                $scope.getSlide = function()
                {
                    return templateUrl;
                }
            }
        }
    }

    function ScrollToDirective()
    {
        return {
            restrict:"A",
            link: function($scope,$element,$attrs)
            {
                $element.on('click', function(event){
                    $scope.goto($attrs.scrollTo);
                });
            }
        }
    }


    function SlideDirective(pos,$window)
    {
        var Action = {
            "Home" : function($scope)
            {
                function split(boolean) {
                    return function(e) {
                        $scope.split = boolean;
                        $scope.$apply();
                    }
                }
                this.on('leave', split(true));
                this.on('enter', split(false));
            }
        };
        return {
            restrict:"C",
            link: function($scope,$element,$attrs)
            {
                var id = $attrs.id;
                var link = document.querySelectorAll("a[scroll-to='"+id+"']")[0];

                pos.addScene($element[0], function(scene){
                    if (! link) {
                        return;
                    }
                    scene.duration(function(){
                        return window.innerHeight;
                    });
                    scene.setClassToggle(link, 'active');

                    if (Action.hasOwnProperty(id)) {
                        Action[id].call(scene, $scope,$element,$attrs);
                    }
                });
            }
        };
    }



})(window.bstar);


