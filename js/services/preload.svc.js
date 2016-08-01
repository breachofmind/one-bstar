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