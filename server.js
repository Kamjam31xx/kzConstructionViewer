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


app.use(logger);


const PORT = 8080;
//app.listen(8080, "0.0.0.0");
app.listen(PORT, () => {
    console.log(`node server started... listening on port <${PORT}>`);
});

// ex middleware
function logger(request, response, next)
{
    console.log("<logger> " + request.originalUrl);
    next();
}