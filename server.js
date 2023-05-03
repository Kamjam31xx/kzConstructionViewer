// author Kameron Briggs 
// kz construction viewer app

// make routers generic & create container objects 


const { readFile } = require('fs').promises
const express = require('express');

// maintain order
// changing order may break the application
const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const aboutRouter = require('./routes/about');
const usersRouter = require('./routes/users');
//app.use('/about', aboutRouter);
//app.use('/users', usersRouter);
app.use(logger);

// public static over-rides below .get() since its above this
/*
app.get('/', (request, response, next) => {

    //response.send("Hi from root directory");

    //response.status(status).send("hi");
    //response.status(500).json({ message: "Error" });
    //response.download("filepath");

    response.render('./views/index', { text: "world" });
});
*/


app.listen(8080, "0.0.0.0");

// ex middleware
function logger(request, response, next)
{
    console.log("<logger> " + request.originalUrl);
    next();
}