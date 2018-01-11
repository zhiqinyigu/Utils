module.exports = {
    spellUrl: function(url, data) {
        var para = [], key;

        if (typeof data === 'object') {
            for (key in data) {
                para.push(key + '=' + data[key]);
            }

            data = para.join('&');
        } else if (typeof data === 'undefined') {
            data = '';
        }

        if (url.indexOf('?') === -1) {
            url += '?' + data;
        } else {
            url += '&' + data;
        }

        return url.replace(/[?&]$/, '');
    }
}