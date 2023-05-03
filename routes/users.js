const express = require('express');
const router = express.Router();

const users = [];

router.get("/", (request, response, next) => {
    const name = request.query.name;
    response.send(`this is the users name ${ name }`);

});
router.get("/new", (request, response, next) => {

    response.render('users/new', { firstName : "insert" });

});
router.post("/", (request, response, next) => {
    const valid = false;
    if(valid){
        users.push({ firstName: request.body.firstName });
        response.redirect(`/users/${users.length - 1}`); // stupid fucktard way to get last entry
    }else{
        response.render(`users/new`, { firstName : request.body.firstName });
    }
    console.log(request.body);

});
router.get(`/:id`, (request, response, next) => {
    response.send("hey you");
});
/*
router
    .route("/:id")
    .get('/:id', (request, response, next) => 
    {
        response.send(`user get with id ${request.params.id}`);
        next();
    }).put('/:id', (request, response, next) => 
    {
        response.send(`user update with id ${request.params.id}`);
        next();
    }).router.delete('/:id', (request, response, next) => 
    {
        response.send(`user delete with id ${request.params.id}`);
        next();
    });
*/

module.exports = router;