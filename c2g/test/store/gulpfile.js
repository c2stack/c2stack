//
//  Test a basic RESTCONF api, CRUD, events and rpcs
//
var gulp = require('gulp');
var request = require('request');
var expect = require('chai').expect;
var runSequence = require('run-sequence');
var os = require("os");
var harness = require('../lib/harness');
var sh = require('child_process');

var config = { device : {ws : {}}, store : {ws : {}}};

config.device.port = '8090';
config.device.host = 'localhost';
config.device.addr = config.device.host + ':' + config.device.port;
config.device.url = "http://" + config.device.addr + "/restconf/data/car:";
config.device.ws.origin = os.hostname() + ':' + config.device.port;
config.device.ws.url = "ws://" + config.device.addr + "/restconf/streams";

config.store.port = '8080';
config.store.host = 'localhost';
config.store.addr = config.store.host + ':' + config.store.port;
config.store.url = "http://" + config.store.addr + "/restconf=car-advanced/data/car:";
config.store.ws.origin = os.hostname() + ':' + config.store.port;
config.store.ws.url = "ws://" + config.store.addr + "/restconf=car-advanced/streams";

var procs = [];

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

gulp.task('setup', ['teardown'], function(done) {
    harness.run('store');
    setTimeout(() => {
        harness.run('device');
        setTimeout(done, 4000);
    }, 1000);
});

gulp.task('notify', [], function(done) {
    var ws = harness.wsocket(config.store.ws);
    request({
        method:'PUT',
        url: config.store.url,
        json : {
            speed : 10
        }
    }, function(err) {
        harness.checkErr(err);
        request({
            method: 'POST',
            url: config.store.url + 'replaceTires'
        }, function(err) {
            harness.checkErr(err);
            var onUpdate = ws.on('test', 'update', 'car', function(data, err) {                
                expect(err).to.be.null;
                console.log(data);
                // assert that at least one of the tires is worn
                ws.off(onUpdate);
                ws.close();
                done();
            }, 'car-advanced');
        });
    });
});

