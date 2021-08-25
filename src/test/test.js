const assert = require('assert');
const request = require('supertest');


describe("Server starts up",function () {
    var server;
    before(function() {
        server = require('../index.js');
    });
    after(function() {
        server.close();
    });

    it('connects to a mysql database', function connectingMysql(done) {
        db.ping(function (err) {
            console.log("done it");
            if (!err) {
                done();
            }
        });
    });

    it('responds to /', function testSlash(done) {
        request(server).get('/').expect(200,done);
    });

    it('responds to /about', function testSlash(done) {
        request(server).get('/about').expect(200,done);
    });

    it('responds to 404 for unrecognised paths', function testPath(done) {
        request(server).get('/foo').expect(404,done);
    });

});
