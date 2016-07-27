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