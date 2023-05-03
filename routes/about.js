const express = require('express');
const router = express.Router();

router.get("/", (request, response, next) => {

    response.send('kz construction viewer is authored by Kameron Briggs');
    next();
});

router.get(`/author`, (request, response, next) => {
    console.log("/about/author - from : " + request.ip);
    response.send('kameron briggs is a guy who codes stuff and made this, lol. i know your ip is ' + request.ip);
    next();
});

/*

put static routes above dynamic routes

create
read
update
delete

// create user ex
router.post('/', (request, response, next) => {

    response.send("new user form");

});

// group
router.route('/:id).get('/:id', (request, response, next) => 
{
    response.send(`user get with id ${request.params.id}`);

}).put('/:id', (request, response, next) => 
{
    response.send(`user update with id ${request.params.id}`);

}).router.delete('/:id', (request, response, next) => 
{
    response.send(`user delete with id ${request.params.id}`);

});

// middle-ware
const users = [ { name: "dur" }, { name: "buttarded" } ];
router.param("id", (request, response, next, id) => {
    console.log(id);
    request.user = users[id];
    next();
});

*/

module.exports = router;