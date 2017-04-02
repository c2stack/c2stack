var notify = require('../lib/notify');
var ws = require('ws');
var sh = require('child_process');
var fs = require('fs');

module.exports = {

    checkErr : function(err) {
        if (err != null) {
            console.log(err);
            process.exit(-1);
        }
    },

    // websocket connection
    wsocket : function(options) {
        // lazy connect to websocket server
        var driver = new ws(options.url, 'c2-notify', {origin: options.origin});
        var notifier = new notify.handler(driver);
        notifier.done = function() {
            notifier.close();
        }
        notifier.onDriverErr = function(err) {
            if (err) {
                console.log("Driver error ", err);
                process.exit(-1);
            }
        }
        return notifier;
    },

    run : function(cmd) {
        var proc = sh.spawn('./run', [cmd]);
        proc.on('close', (code) => {
            if (code != 0) {
                console.log(cmd + " exited with code " + code);
            }
        });
        proc.stdout.on('data', (data) => {
            process.stdout.write(cmd + ' ' + data.toString());
        });
        proc.stderr.on('data', (data) => {
            process.stderr.write(cmd + ' ' + data.toString());
        });
        return proc;
    }
}


