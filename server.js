'use strict';

const request = require("request");
const express = require('express');
const fs = require('fs');

// Constants
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || 'localhost';

global.myString = "";
global.intervalId;

// App
const app = express();

app.get('/ping', (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('ok');
});

app.get('/music', (req, res) => {
    res.setHeader("Content-Type", "text/html");
    var html = fs.readFileSync(__dirname + '/music.html', 'utf8');
    res.end(html);
});

app.get('/getString', (req, res) => {
    if (global.myString !== "") {
        res.writeHead(301, {
            Location: global.myString,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: 0
        });
        res.end();
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            "result": "failed"
        }));
    }
});

app.get('/delString', (req, res) => {
    global.myString = "";
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
        "result": "success",
        "value": global.myString
    }));
});

app.post('/setString', (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); // convert Buffer to string
    });
    req.on('end', () => {
        body = JSON.parse(body);
        if (body.watch) {
            global.myString = body.watch;
            clearInterval(global.intervalId);
            global.intervalId = setInterval(function() {
                global.myString = "";
            }, 14400000);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                "result": "success"
            }));
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                "result": "failed"
            }));
        }
    });
});

app.listen(PORT);
console.log(`Running on port :${PORT}`);
