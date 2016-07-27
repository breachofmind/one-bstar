(function(ns){

    ns.app.controller('app_c', AppController);

    // Disable the anchorScroll behavior.
    // We're using a smooth scrolling behavior instead.
    ns.app.value('$anchorScroll', angular.noop);

    function AppController($scope, $window, $location, $anchorScroll, $timeout, mousewheel)
    {
        $scope.split = false;

        /**
         * The array of slides. This is filled dynamically.
         * @type {array}
         */
        var slides = getSlideList();

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
            var elementId = $scope.getSlide();

            TweenLite.to(window,0.6,{scrollTo:"#"+elementId, ease:Expo.easeOut});
            $location.hash(elementId);
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
            e.preventDefault();
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