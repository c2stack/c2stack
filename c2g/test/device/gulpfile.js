//
//  Test a basic RESTCONF api, CRUD, events and rpcs
//
var gulp = require('gulp');
var request = require('request');
var fs = require('fs');
var expect = require('chai').expect;
var runSequence = require('run-sequence');
var os = require("os");
var harness = require('../lib/harness');

var config = {ws : {}};

config.port = '8090';
config.host = 'localhost';
config.addr = config.host + ':' + config.port;
config.go = '/usr/local/bin/go';
config.projRootDir = '../../';
config.url = "http://" + config.addr + "/restconf/data/car:";
config.ws.origin = os.hostname() + ':' + config.port;
config.ws.url = "ws://" + config.addr + "/restconf/streams";

gulp.task('default', [], function(done) {
    runSequence(
        'setup', 
        'notify',
        'teardown',
        done
    );
});

gulp.task('teardown', [], function() {
    harness.run('stop');
});

gulp.task('setup', [], function(done) {
    harness.run('device');
    setTimeout(done, 2000);
});

gulp.task('notify', [], function(done) {
    var ws = harness.wsocket(config.ws);
    request({
        method:'PUT',
        url: config.url,
        json : {
            speed : 10
        }
    }, function(err) {
        harness.checkErr(err);
        request({
            method: 'POST',
            url: config.url + 'replaceTires'
        }, function(err) {
            harness.checkErr(err);
            var onUpdate = ws.on('test', 'update', 'car', function(data, err) {                
                expect(err).to.be.null;
                console.log(data);
                // assert that at least one of the tires is worn
                ws.off(onUpdate);
                ws.close();
                done();
            });
        });
    });
});
