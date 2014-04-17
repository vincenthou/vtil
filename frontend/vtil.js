(function(w){
    var vtil = {};

    function centerImg (elem, pNode) {
        elem.style.position = 'absolute';
        elem.style.width = '100%';
        var pHeight = pNode.clientHeight;
        if (elem.height <= pHeight) {
            elem.style.width = null;
            elem.style.height = '100%';
            elem.style.left = (pNode.clientWidth - elem.clientWidth) / 2.0 + 'px';
        } else {
            elem.style.top = (pHeight - elem.clientHeight) / 2.0 + 'px';
        }
    };

    function lazyCenterImg (elem, pNode, src) {
        var img = new Image();
        img.src = src;
        img.onload = function() {
            elem.style.position = 'absolute';
            var pHeight = pNode.clientHeight;
            var pWidth = pNode.clientWidth;
            var iHeight = img.height * pNode.clientWidth / img.width;
            var iWidth = img.width * pNode.clientHeight / img.height;
            if (iHeight <= pHeight) {
                elem.style.height = pHeight + 'px';
                elem.style.left = (pWidth - iWidth) / 2.0 + 'px';
            } else {
                elem.style.width = pWidth + 'px';
                elem.style.top = (pHeight - iHeight) / 2.0 + 'px';
            }
            elem.src = src;
        };
    };

    vtil.autoCenterImg = function(elem) {
        var pNode = elem.parentNode;
        pNode.style.position = 'relative';
        pNode.style.overflow = 'hidden';
        var src = elem.getAttribute('data-src');
        !src ? centerImg(elem, pNode) : lazyCenterImg(elem, pNode, src);
    };

    vtil.centerImgs = function(elems) {
        var len = elems.length;
        if (1 === len) {
            vtil.autoCenterImg(elems);
        } else {
            for (var i = 0; i < len; i++) {
                vtil.autoCenterImg(elems[i]);
            }
        }
    };
    w.vtil = vtil;
})(window);

