;(function() {
    $('<style>.modal-open{overflow: hidden}.lc-model,.lc-model-mask{position: fixed;top: 0;left: 0;width: 100%;height: 100%;overflow: auto;z-index:999;}.lc-model-mask{filter:progid:DXImageTransform.Microsoft.gradient(enabled="true", startColorstr="#99000000", endColorstr="#99000000");background-color:rgba(0,0,0,0.6);}</style>').appendTo('head');

    var $mask, modelStack = [];

    function findModel(model) {
        for (var i = modelStack.length - 1; i >= 0; i--) {
            if (modelStack[i][0] === model[0]) {
                break;
            }
        }

        return i;
    }

    function removeModel(model) {
        var index = findModel(model);

        index !== -1 &&modelStack.splice(index, 1);
    }

    function modelFactory(ele, delegate) {
        var $model = $('<div class="s-tabcell lc-model"></div>');

        $(ele).addClass('d-ibm').css({'display': '', 'marginTop': 40, 'marginBottom': 40}).appendTo($model);
        !$mask && ($mask = $('<div class="lc-model-mask"></div>').appendTo(document.body));

        $model.appendTo(document.body);

        if (delegate) {
            $model.on('click', function(e) {
                if (e.target === this) {
                    $(ele).model('hide');
                }
            });
        }

        return $model;
    }

    $.fn.model = function(method, delegate) {
        return this.each(function() {
            var $me = $(this),
                model = $me.data('lc-model');

            if (method === 'hide') {
                if (model) {
                    model.css('display', 'none');
                    removeModel($me);

                    if (!modelStack.length) {
                        $mask.hide();
                        $(document.body).removeClass('modal-open');
                    }
                }
            } else {
                if (!model) {
                    model = $me.data('lc-model', modelFactory(this, delegate));
                }

                if (findModel($me) === -1) {                
                    $(document.body).addClass('modal-open');
                    $mask.show();
                    model.css('display', 'inline-block');
                    modelStack.push($me);
                }
            }
        });
    }
})();