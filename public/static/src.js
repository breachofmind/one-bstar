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

    ns.app.service('preload', PreloadService);

    var noop = function() {};

    function PreloadService()
    {
        function Preloader()
        {
            /**
             * Objects in the preload queue.
             * @type {Array}
             */
            this.objects = [];
            this.queue = 0;

            /**
             * Add an image source to preload.
             * @param arr
             * @return Preloader
             */
            this.add = function(arr)
            {
                if (! Array.isArray(arr)) {
                    arr = [arr];
                }
                arr.forEach(function(src) {
                    var image = new Image();
                    image.src = src;
                    this.objects.push(image);

                }.bind(this));

                return this;
            };

            /**
             * Recurse through the images to see if they are done loading.
             * @type {function(this:Preloader)}
             */
            var checkIfDone = function(callback)
            {
                for (var i=0; i<this.objects.length; i++) {
                    var image = this.objects[i];

                    if (! image.complete) {
                        return false;
                    }
                }
                if (this.queue == 0) return callback();

            }.bind(this);

            /**
             * Attach event listeners to each preloading image.
             * @param callback function
             * @returns void
             */
            this.complete = function(callback)
            {
                this.queue = this.objects.length;

                var done = function(image) {
                    this.queue --;
                    checkIfDone(callback);
                    image.onload = noop;

                }.bind(this);

                this.objects.forEach(function(image)
                {
                    if (image.complete) {
                        done(image);
                    } else {
                        image.onload = function() {
                            done(image);
                        }
                    }
                }.bind(this))
            };


        }

        return new Preloader();
    }



})(window.bstar);
(function(ns){

    ns.app.controller('app_c', AppController);

    // Disable the anchorScroll behavior.
    // We're using a smooth scrolling behavior instead.
    ns.app.value('$anchorScroll', angular.noop);

    var preloadImages = [
        '/images/bg-1.jpg',
        '/images/bg-2.jpg',
        '/images/bg-3.jpg',
        '/images/bg-4.jpg',
        '/images/bg-5.jpg'
    ];

    function AppController($scope, $location, $timeout, mousewheel,preload)
    {
        $scope.preloading = true;
        $scope.split = false;

        var activeImage = "topImage";

        $scope.topImage = {
            src: {"background-image":null},
            active: false
        };
        $scope.bottomImage = {
            src: {"background-image":null},
            active: true
        };


        $scope.slideCount = 0;
        $scope.slideOrder = [];
        $scope.slideIndex = 0;
        $scope.slide = {};
        $scope.previousSlide = {};


        /**
         * Filled in via the slides directive.
         * @type {{}}
         */
        $scope.slides = {};


        /**
         * Advance the slide.
         * @type {Function}
         */
        $scope.next = function()
        {
            $scope.slideIndex = $scope.slideIndex >= $scope.slideCount-1 ? $scope.slideCount-1 : $scope.slideIndex+1;
            go();
        };

        /**
         * Retreat the slide.
         * @type {Function}
         */
        $scope.prev = function(){
            $scope.slideIndex = $scope.slideIndex <= 0 ? 0 : $scope.slideIndex-1;
            go();
        };

        /**
         * Triggers the view to scroll and updates the hash.
         * @returns void
         */
        var go = function()
        {
            $scope.previousSlide = $scope.slide;
            $scope.slide = $scope.getSlide();
            TweenLite.to(window,0.6,{
                scrollTo:{
                    x:0,
                    y:$scope.slide.el.offsetTop
                },
                ease:Expo.easeOut
            });

            $location.hash($scope.slide.id);
            $scope.changeBackground();
            $scope.$apply();
        };

        /**
         * Switch the slide backgrounds.
         * @returns void
         */
        $scope.changeBackground = function()
        {
            var previousImage = activeImage;
            activeImage = activeImage == "topImage" ? "bottomImage" : "topImage";

            $scope[previousImage].active = false;
            $scope[activeImage].active = true;
            $scope[previousImage].src["background-image"] = $scope.previousSlide.attrs.bg ? "url("+$scope.previousSlide.attrs.bg+")" : "none";
            $scope[activeImage].src["background-image"] = $scope.slide.attrs.bg ? "url("+$scope.slide.attrs.bg+")" : "none";
        };

        /**
         * Public method on the scope to move to the given slide.
         * @param id string
         * @returns void
         */
        $scope.goto = function(id)
        {
            if (id) {
                $scope.slideIndex = $scope.slides[id].index;
                go();
            }
        };

        /**
         * Get the current selected slide name.
         * @returns {object}
         */
        $scope.getSlide = function()
        {
            return $scope.slideOrder[$scope.slideIndex];
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

        // When items are preloaded, update the scope.
        preload.add(preloadImages).complete(function()
        {
            $timeout(function(){
                $scope.preloading = false;
            },1000);
        });
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
        target0: "Goal",
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


    /**
     * Create a new slide object.
     * @usage <div class="slide" data-bg="image" use-slide=".html"></div>
     * @param pos
     * @param $window
     * @returns {{restrict: string, link: link}}
     * @constructor
     */
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

                // Add some scroll magic to this slide element.
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
                var slideObject = {
                    index: $scope.slideCount,
                    id: id,
                    el: $element[0],
                    attrs: $attrs,
                    link: link,
                    hasContrast: $attrs.contrast==""
                };

                // Attach the object to the scope.
                $scope.slides[id] = slideObject;
                $scope.slideOrder[$scope.slideCount] = slideObject;
                if ($scope.slideCount == 0) {
                    $scope.slide = slideObject; // Default Slide
                }
                $scope.slideCount ++;

            }
        };
    }



})(window.bstar);


