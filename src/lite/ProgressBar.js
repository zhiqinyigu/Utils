var animate = require('./animate').animate;


function ProgressObj() {
    this.val = 0;
}

ProgressObj.prototype = {
    setValue: function(val) {
        if (val !== this.val) {
            this.onChange(this.val = val);
        }
    },

    set: function(val, limit) {
        var self = this,
            _val = self.val;

        if (val > _val) {
            self.animate(val, function() {
                self.stepping();
            });
        } else {
            self.setValue(val);
        }
    },

    animate: function(val, onDone) {
        var self = this;

        self.stop();
        self.stop = animate(self.val, val, 600, function(val, isDone) {
            self.setValue(Math.round(val));

            isDone && onDone();
        }, Tween.Cubic.easeInOut);
    },

    stop: function() {},
    stepping: function() {
        var self = this,
            gap = 100 - self.val,
            start_time = Date.now();

        if (gap != 0) {
            self.stop();
            self.stop = animate(self.val, 100, 50000, function(val) {

                // 超过6秒没有反应就停止
                if (Date.now() - start_time > 6000) {
                    self.stop();
                } else {
                    self.setValue(Math.round(val));
                }
            });
        }
    }
};

module.exports = {
    Progress: ProgressObj
};