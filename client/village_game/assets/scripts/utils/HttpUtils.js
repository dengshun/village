let HttpUtils = {
    load: function (url, method, onCallBack) {
        method = method || "GET";
        onCallBack = onCallBack || null;
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                let response = xhr.responseText;
                if(onCallBack){
                    onCallBack(response);
                }
            }
        };
        xhr.open("GET", url, true);
        xhr.send();
    }
}
module.exports=HttpUtils;