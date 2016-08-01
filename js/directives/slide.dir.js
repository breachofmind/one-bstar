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


