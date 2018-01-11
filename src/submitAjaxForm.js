var _uid = 0;

function createFrame() {
    var iframe = document.createElement("iframe");
    // iframe.width = 0;
    // iframe.height = 0;
    // iframe.border = 0;
    iframe.name = "form-iframe" + _uid;
    iframe.id = "form-iframe" + _uid;
    iframe.style.display = 'none';
    // iframe.setAttribute("style", "width:0;height:0;border:none");

    document.body.appendChild(iframe);
    _uid++;

    return iframe;
}

function returnReject(val) {
    return Promise.reject(val);
}

function returnResolve(val) {
    return Promise.resolve(val);
}

function returnPromise(fn) {
    return new Promise(fn);
}

function submitAjaxForm(form) {
    var def = returnPromise(function (resolve, reject) {
            returnResolve = resolve;
            returnReject = reject;
        }),
        returnResolve,
        returnReject,
        target = form.target,
        frame = createFrame();

    function onFrameLoad(){
        //获取iframe的内容，即服务返回的数据
        var frame = this,
            responseData = this.contentDocument.body.textContent || this.contentWindow.document.body.textContent;

        //删掉iframe
        setTimeout(function(){
            // frame.parentNode.removeChild(frame);
        }, 100);

        try {
            return returnResolve(JSON.parse(responseData));
        } catch (e) {
            return returnReject(responseData);
        }
    }


    form.target = frame.id;
    frame.onload = onFrameLoad;
    form.submit();

    // 恢复form的target
    setTimeout(function() {
        form.target = target;
    }, 100);

    return def.then(function(json) {
        if (commonRequest.checkResponse(json)) {
            return json;
        } else {
            return $.Deferred().reject(json || '');
        }
    });
}

module.exports = {
    submitAjaxForm: submitAjaxForm
};