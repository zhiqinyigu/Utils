$.fn.cButton = function(type, text) {
    return this.each(function() {
        var $this = $(this);

        type = type || 'reset';

        switch (type) {
            case 'reset':
                $this.prop('disabled', false);

                // 只有在保存了文本的时候，才重写文本内容。防止意外重写
                if ($this.data('loading-text')) {
                    $this.html($this.data('loading-text'));
                }

                this.className = this.className.replace(/\s*is-loading-?[\S]*\s*/, ' ');

                break;
            default:
                // 只保存按钮可用时的文本
                if (!$this.prop('disabled')) {
                    $this.data('loading-text', $this.html());
                }

                $this.addClass('is-' + type).prop('disabled', true).html(text || '加载中...');

                break;
        }
    });
}