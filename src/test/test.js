const assert = require('assert');
const request = require('supertest');


describe("Server starts up", () => {
    var server;
    beforeEach(function() {
        server = require('../index');
    });
    afterEach(function() {
        server.close();
    });

    it('responds to /', function testSlash(done) {
        request(server).get('/').expect(200,done);
    });

    it('responds to 404 for unrecognised paths', function testPath(done) {
        request(server).get('/foo').expect(404,done);
    });
});
