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
(function(ns){

    ns.app.controller('app_c', AppController);

    ns.app.value('$anchorScroll', angular.noop);

    function AppController($scope, $window, $location, $anchorScroll, $timeout, mousewheel)
    {
        $scope.split = false;

        var slides = getSlideList();

        var selected = 0;

        var change = function(direction)
        {
            return function()
            {
                if (direction == 'next') selected = selected >= slides.length-1 ? slides.length-1 : selected+1;
                if (direction == 'prev') selected = selected <= 0 ? 0 : selected-1;
                go();
            }
        };

        $scope.next = change('next');
        $scope.prev = change('prev');

        var go = function()
        {
            var elementId = $scope.getSlide();

            TweenLite.to(window,0.6,{scrollTo:"#"+elementId, ease:Expo.easeOut});
            $location.hash(elementId);
            $scope.$apply();
        };

        $scope.goto = function(hash)
        {
            if (hash) {
                selected = slides.indexOf(hash);
                go();
            }
        };

        $scope.getSlide = function()
        {
            return slides[selected];
        };

        mousewheel(function(e) {
            e.preventDefault();
            if (e.direction.UP) return $scope.next();
            if (e.direction.DN) return $scope.prev();
        });


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

