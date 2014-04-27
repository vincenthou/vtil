(function(w){
    var vtil = {};

    /**
     * Center normal image element in wrapper
     * @param  {object} elem  image DOM element
     */
    function centerImg (elem) {
        var pNode = elem.parentNode;
        pNode.style.position = 'relative';
        pNode.style.overflow = 'hidden';
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

    /**
     * Center image element with data-src attribute for lazy loading
     * @param  {object} elem  image DOM element
     * @param  {string} src  the src of image
     */
    function lazyCenterImg (elem, src) {
        var pNode = elem.parentNode;
        pNode.style.position = 'relative';
        pNode.style.overflow = 'hidden';
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

    /**
     * Center one or multiple images
     * @param  {array} elems [description]
     * @return {[type]}       [description]
     */
    vtil.centerImgs = function(elems) {
        var len = elems.length;
        var elem = null;
        var src = '';
        for (var i = 0; i < len; i++) {
            elem = elems[i];
            src = elem.getAttribute('data-src');
            !src ? centerImg(elem) : lazyCenterImg(elem, src);
        }
    };
    w.vtil = vtil;
})(window);

