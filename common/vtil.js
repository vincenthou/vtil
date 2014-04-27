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

    //http://krasimirtsonev.com/blog/article/7-lines-JavaScript-library-for-calling-asynchronous-functions
    vtil.sync = function(funcs, scope) {
        (function next() {
              if(funcs.length > 0) {
                  funcs.shift().apply(scope || {}, [next].concat(Array.prototype.slice.call(arguments, 0)));
              }
        })();
    };

    //http://krasimirtsonev.com/blog/article/Javascript-template-engine-in-just-20-line
    vtil.render = function(html, options) {
        var re = /<%([^%>]+)?%>/g, reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, code = 'var r=[];\n', cursor = 0;
        var add = function(line, js) {
            js? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
                (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
            return add;
        }
        while(match = re.exec(html)) {
            add(html.slice(cursor, match.index))(match[1], true);
            cursor = match.index + match[0].length;
        }
        add(html.substr(cursor, html.length - cursor));
        code += 'return r.join("");';
        return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
    };

    //merge vtil object
    if (vtil) {
        for (key in vtil) w.vtil[key] = vtil[key];
    } else {
        w.vtil = vtil;
    }
})(window);

