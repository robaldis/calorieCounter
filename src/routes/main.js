module.exports = function (app) {

    app.get('/', function (req, res) {
        res.render("home.html");
    });
    app.get('/about', function (req, res) {
        res.send("ok");
    });
}
