module.exports = {
    parseUrl: function(url) {
        var urlData = {},
            parmas, match, i,
            urlReg = /[?&]([^=]*?)(?:=([^&]*?))?(?:(?=&)|(?=$))/g,
            urlParamsReg = /[?&]([^=]*?)(?:=([^&]*?))?(?:(?=&)|(?=$))/;

        match = (url || location.href).match(urlReg);

        if (match) {
            for (i = match.length - 1; i >= 0; i--) {
                parmas = match[i].match(urlParamsReg);

                if (parmas[1]) {
                    // parmas[2]为undefined时，设为空字符串
                    urlData[parmas[1]] = typeof parmas[2] != 'undefined' ? parmas[2] : parmas[2] || '';
                }
            }
        }

        return urlData;
    }
};
