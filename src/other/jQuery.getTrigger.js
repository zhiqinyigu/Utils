// 获取一个关注子元素某事件的元素
(function() {
    /*var closest = function ($t, selector){
            var isStr =  typeof selector === "string",
                result, t;
            if(isStr){
                result = $t.closest(selector)[0];
            }else {
                t = $t[0];
                while(t && t !== selector && (result = t.parentNode)){
                    t = t.parentNode;
                }
            }
            return result;
        };*/

    var closest = function($t, rule) {
        var is_str = $.type(rule) !== 'array',
            result = false;

        if (is_str) {
            rule = [rule];
        }

        do {
            $.each(rule, function(_, val) {
                if ($t.is(val)) {
                    result = is_str ? [$t] : [$t, val];
                    return false;
                }
            });

        } while (!result && ($t = $t.parent())[0]);

        return result;
    }

    return $.getTrigger = function(e, selector) {
        var $t = $(e.target),
            r = e.relatedTarget
            // ,isTarget = $t.is(selector)
            // ,$ele = isTarget ? $t : $(closest($t, selector));
            ,
            info = closest($t, selector),
            $ele = info && info[0];

        return !$ele || (e.type !== "click" && ($.contains($ele[0], r) || r === $ele[0] && $.contains($ele[0], $t[0]))) ? false : $.type(selector) === 'array' ? info : $ele;
    };
})();
