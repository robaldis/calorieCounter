module.exports = function (app) {

    app.get('/', function (req, res) {
        res.send("ok");
    });
    app.get('/about', function (req, res) {
        res.send("ok");
    });
}
