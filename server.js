// author Kameron Briggs 
// kz construction viewer app

// make routers generic & create container objects 


const { readFile } = require('fs').promises
const fs = require('fs');


// Config file containing file paths and more
const config = JSON.parse(fs.readFileSync('./config.json'));
console.log(config);
const PORT_HTTP              = config.ports.http;
const PORT_HTTPS             = config.ports.https;
const PATH_PRIVATE_KEY       = config.paths.privateKey;
const PATH_PRIVATE_KEY_LOCAL = config.privateKeyLocal;
const PATH_FULL_CHAIN        = config.paths.fullChain;
const PATH_FULL_CHAIN_LOCAL  = config.paths.fullChainLocal;
const PATH_APP               = config.paths.app;

// Load the SSL/TLS key and certificate
const PRIVATE_KEY = fs.readFileSync(PATH_PRIVATE_KEY);
const CERTIFICATE = fs.readFileSync(PATH_FULL_CHAIN);

// server includes
const express = require('express');
const https = require('https');

// maintain order
const app = express();
app.use((req, res, next) => {
    // Redirect HTTP to HTTPS
    if (req.secure) {
      next();
    } else {
      res.redirect('https://' + req.headers.host + req.url);
    }
  });
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger);




// middleware
function logger(request, response, next)
{
    console.log("<logger> " + request.originalUrl);
    next();
}



const httpsOptions = {
    key: PRIVATE_KEY,
    cert: CERTIFICATE
};
const httpsServer = https.createServer(httpsOptions, app);
httpsServer.listen(PORT_HTTPS, () => { console.log(`HTTPS server started... listening on port <${PORT_HTTPS}>`); } );
app.listen(PORT_HTTP, () => { console.log(`HTTP server started... listening on port <${PORT_HTTP}>`); } );