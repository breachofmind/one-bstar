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
                var templateUrl = "/public/slides/"+$attrs.useSlide;
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


