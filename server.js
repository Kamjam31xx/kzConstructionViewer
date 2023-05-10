// author Kameron Briggs 
// kz construction viewer app

// make routers generic & create container objects 


const { readFile } = require('fs').promises
const fs = require('fs');
const express = require('express');
const https = require('https');
const session = require('express-session');
const crypto = require('crypto');


// Config file containing file paths and more
const config = JSON.parse(fs.readFileSync('./config.json'));
console.log(config);
const PORT_HTTP              = config.ports.http;
const PORT_HTTPS             = config.ports.https;
const PATH_PRIVATE_KEY       = config.paths.privateKey;
const PATH_PRIVATE_KEY_LOCAL = config.paths.privateKeyLocal;
const PATH_FULL_CHAIN        = config.paths.fullChain;
const PATH_FULL_CHAIN_LOCAL  = config.paths.fullChainLocal;
const PATH_APP               = config.paths.app;


// Load the SSL/TLS key and certificate
const PRIVATE_KEY = fs.readFileSync(PATH_PRIVATE_KEY_LOCAL, 'utf8');
const CERTIFICATE = fs.readFileSync(PATH_FULL_CHAIN_LOCAL, 'utf8');


// maintain order
const app = express();
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger);
app.use(httpRedirect);
app.use(session({
    secret: crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: true
}));
app.get(`/`, (request, response, next) =>
{
    response.render('index');
});
app.use(express.static("public"));


// middleware
function logger(request, response, next)
{
    console.log(`<logger> [${request.secure ? 'https' : 'http'}] : ${request.originalUrl}`);
    next();
}

function httpRedirect(request, response, next)
{
    if (request.secure) {
        next();
    } else {
        console.log('redirect to https > ' + request.headers.host + request.url);
        response.redirect('https://' + request.headers.host + request.url);
    }
}




const httpsOptions = 
{
    key: PRIVATE_KEY,
    cert: CERTIFICATE
};
const httpsServer = https.createServer(httpsOptions, app);
httpsServer.listen(PORT_HTTPS, () => { console.log(`HTTPS server started... listening on port <${PORT_HTTPS}>`); } );
app.listen(PORT_HTTP, () => { console.log(`HTTP server started... listening on port <${PORT_HTTP}>`); } );