(function(ns){

    ns.app.controller('app_c', AppController);
    //ns.app.controller('nav_c', NavController);

    function AppController($scope, $window, $location, $anchorScroll, $timeout)
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
            $location.hash($scope.getSlide());
            $anchorScroll();
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

        $window.addEventListener('mousewheel', function(e)
        {
            e.preventDefault();
            var direction = {
                UP: e.deltaY > 0,
                DN: e.deltaY < 0
            };
            if (direction.UP) {
                $scope.next();
            } else if (direction.DN) {
                $scope.prev();
            }
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