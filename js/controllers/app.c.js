(function(ns){

    ns.app.controller('app_c', AppController);

    // Disable the anchorScroll behavior.
    // We're using a smooth scrolling behavior instead.
    ns.app.value('$anchorScroll', angular.noop);

    function AppController($scope, $location, $timeout, mousewheel)
    {
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
    }


})(window.bstar);