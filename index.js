const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const fs = require('fs');
const _data = require('./lib/data');
const helpers = require('./lib/helpers');
const handlers = require('./lib/handlers');


// Testing
// @TODO delete this


// Instantiate the HTTP server
var httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
});

httpServer.listen(config.httpPort, () => {
    console.log("The server is listening on port " + config.httpPort);
});

// Instantiate the HTTPS server
var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, () => {
    console.log("The server is listening on port " + config.httpsPort);
});

// All the server logi for both the http and the https server 
var unifiedServer = (req, res) => {
    // Get the URL and parse it
    var parsedUrl = url.parse(req.url, true);
    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    var queryStringObject = parsedUrl.query;

    // Get the HTTP method
    var method = req.method.toLowerCase();

    // Get the headers as an object
    var headers = req.headers;

    // Get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        // Choose the handler this request should go to.
        var chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ?
            router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, (statusCode, payload) => {
            statusCode = typeof (statusCode) == 'number' ? statusCode : 201;
            payload = typeof (payload) == 'object' ? payload : {};
            var payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // Log the request path
            //console.log(`Request received on path: ${trimmedPath} with http method: ${method} and query object: ${queryStringObject}`);
            //console.log(`Headers: ${JSON.stringify(headers)}`);
            console.log(`Response: ${statusCode, payloadString}`);
        });
    });
}

var router = {
    'users': handlers.users
};