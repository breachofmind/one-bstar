(function(ns){

    var url = "/public/images/one-brightstar.svg";
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


