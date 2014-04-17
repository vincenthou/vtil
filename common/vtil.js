(function(w){
    var vtil = {};

    vtil.formatNumber = function(num) {
        var str = '';
        var tmp = 0;
        var len = 0;
        var isNegative = (num < 0);
        num = Math.abs(num);
        var decimal = String(num).match(/\.\d+/);
        (num > -1 && num < 1) && return num;
        num = parseInt(num, 10);
        while (num !== 0) {
            tmp = num % 1000;
            tmp = (0 === tmp) ? '' : String(tmp);
            len = 3 - tmp.length;
            for (var i = 0; i < len; i++) {
                tmp = '0' + tmp;
            }
            str = ',' + tmp + str;
            num = Math.floor(num / 1000);
        }
        num = str.slice(1) + (decimal ? decimal : '');
        num = num.slice(num.search(/[^0]/));
        isNegative && (num = '-' + num);
        return num;
    };

    //merge vtil object
    if (vtil) {
        for (key in vtil) w.vtil[key] = vtil[key];
    } else {
        w.vtil = vtil;
    }
})(window);

