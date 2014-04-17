var os = require('os');
var fs = require('fs');
var url = require('url');
var http = require('http');
var https = require('https');
var querystring = require('querystring');
var cpuUsage = require('cpu-usage');

var Vtil = function(opts){

    var inner = {};
    var logIndex = 0;

    inner.opts = {
        debug: true,
        datetime: true,
        maxFileSize: 50000,
        logPath: __dirname + '/../runtime/',
        logFile: 'app.log',
        port: 1234,
        mimeType: 'text/json',
        memLimit: 90,
        cupLimit: 50,
        frequency: 1000
    };

    for (var attr in opts) {
        inner.opts[attr] = opts[attr];
    }

    (inner.opts.logFile.indexOf('/') != -1) && (inner.opts.logPath = '');
    !inner.opts.logPath && (inner.opts.logPath = inner.opts.logFile.slice(0, inner.opts.logFile.lastIndexOf('/') + 1));
    var absLogPath = inner.opts.logPath + inner.opts.logFile;

    /**
     * Send GET type request based on given url
     * @param  {string}   reqUrl request url
     * @param  {object}   data   request parameters
     * @param  {Function} cb     callback after got data
     */
    inner.get = function(reqUrl, data, cb) {
        var argLen = arguments.length;
        if (argLen > 0) {
            var opts = reqUrl;
            var qstr = '';
            ('object' == typeof(data)) && (qstr = '?' + querystring.stringify(data));
            ('string' == typeof(reqUrl)) && (opts = url.parse(reqUrl + qstr));
            ('function' == typeof(data)) && (cb = data);
            var mod = ('http:' == opts.protocol) ? http : https;
            mod.get(opts, function(res){
                var trunks = [];
                res.on('data', function(trunk){
                    trunks.push(trunk);
                }).on('end', function(){
                    var data = new Buffer.concat(trunks);
                    cb(null, data);
                });
            }).on('error', function(err){
                cb(err);
            });
        } else {
            throw new Error('Too less arguments');
        }
    };

    /**
     * Log infomation in console and file based on mode
     * @param  {object}   data   the data to be logged
     */
    inner.log = function(data) {
        var output = (arguments.length > 1) ? arguments : data;
        console.log(output);
        if (inner.opts.debug) {
            if (absLogPath) {
                var str = output;
                (typeof(str) != 'string') && (str = JSON.stringify(output));
                var line = str;
                inner.opts.datetime && (line = new Date().toString() + ': ' + str + '\n');
                fs.exists(absLogPath, function (exists) {
                    if (exists) {
                        fs.stat(absLogPath, function(err, stat){
                            if (err) throw err;
                            if (stat.size > inner.opts.maxFileSize) {
                                absLogPath = inner.opts.logPath + logIndex++ + '.' + inner.opts.logFile;
                            }
                            fs.appendFile(absLogPath, line, function(err){
                                if (err) throw err;
                            });
                        });
                    } else {
                        fs.appendFile(absLogPath, line, function(err){
                            if (err) throw err;
                        });
                    }
                });
            }
        }
    };

    inner.watchMem = function() {
        setInterval(function(){
            inner.opts.debug && inner.dumpMem();
            var totalmem = os.totalmem();
            var freemem = os.freemem();
            var memPercent = ((totalmem - freemem) * 100 / totalmem).toFixed(2);
            inner.log('Memory usage: ' + memPercent + '%');
            if (memPercent > inner.opts.memLimit) {
                inner.log('-----------------Exit memory info --------------------');
                inner.log('Exit process with ' + memPercent + '% memory usage, please check memory usage again to ensure it is caused by me');
                inner.log('-----------------Exit memory info --------------------');
                process.exit(1);
            }
            cpuUsage(inner.opts.frequency, function(usage) {
                inner.log( "Cpu usage: " + usage + "%" );
                if (usage > inner.opts.cupLimit) {
                    inner.log('-----------------Exit cpu info --------------------');
                    inner.log('Exit process with ' + usage + '% cpu usage, please check memory cpu again to ensure it is caused by me');
                    inner.log('-----------------Exit cpu info --------------------');
                    process.exit(1);
                }
            });
        }, inner.opts.frequency);
    };

    /**
     * Show the memory usage
     * @param  {boolean}   onlyPercent   only show the memory usage rate
     * @param  {boolean}   initial   if it the initial state before dump memory usage data
     */
    inner.dumpMem = function(onlyPercent, initial) {
        var mem = process.memoryUsage();
        var totalmem = os.totalmem();
        var freemem = os.freemem();
        var heapPercent = (mem.heapUsed * 100 / mem.heapTotal).toFixed(2);
        var memPercent = ((totalmem - freemem) * 100 / totalmem).toFixed(2);

        var format = function(bytes) {
            return (bytes / 1024 / 1024).toFixed(2) + 'MB';
        };
        var info = 'Process:';
        !onlyPercent && (info += ' heapTotal ' + format(mem.heapTotal));
        !onlyPercent && (info += ' heapUsed ' + format(mem.heapUsed));
        info += 'heapPercent ' + heapPercent + '%';
        !onlyPercent && (info += ' rss ' + format(mem.rss));
        !onlyPercent && (info += ' totalMem ' + format(totalmem));
        !onlyPercent && (info += ' freeMem ' + format(freemem));
        info += ' memPercent ' + memPercent + '%';
        if (onlyPercent) {
            var heapInc = (heapPercent - inner._heapInitial).toFixed(2);
            var memInc = (memPercent - inner._memInitial).toFixed(2);
            info += ' heap ' + heapInc + '%';
            info += ' mem ' + memInc + '%';
        }

        initial && (inner._heapInitial = heapPercent);
        initial && (inner._memInitial = memPercent);
        initial && inner.log('-----------------Initial memory info --------------------');
        inner.log(info);
        initial && inner.log('-----------------Initial memory info --------------------');
    };

    /**
     * Create server based on configuration
     * @param  {Function} cb     callback when recieving requst from client
     */
    inner.server = function(callback) {
        http.createServer(function(req, res){
            var query = url.parse(req.url, true).query;
            inner.log('Server: Query data with query entity ' + JSON.stringify(query));
            callback && callback(query, function(data){
                res.writeHead(200, {
                    'Content-Type': inner.opts.mimeType + '; charset=utf-8'
                });
                res.end(data);
            });
        }).listen(inner.opts.port, 'localhost');
    };

    /**
     * Delete the log files dumped with log function
     * @param  {Function} cb     callback after deleting log successfully
     */
    inner.deleteLog = function(cb) {
        fs.readdir(inner.opts.logPath, function(err, files){
            if (err) throw err;
            files.forEach(function(file){
                if (file.indexOf(inner.opts.logFile) != -1) {
                    var absPath = inner.opts.logPath + file;
                    fs.unlink(absPath, function (err) {
                        if (err) throw err;
                        inner.log('successfully deleted ' + absPath + '\n');
                        cb && ('function' === typeof(cb)) && cb();
                    });
                }
            });
        });
    };

    return {
        get: inner.get,
        log: inner.log,
        dumpMem: inner.dumpMem,
        watchMem: inner.watchMem,
        server: inner.server,
        deleteLog: inner.deleteLog
    };

};

exports = module.exports = Vtil;
