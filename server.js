'use strict';

const request = require("request");
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');

// Constants
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || 'localhost';

global.myString = "";
global.myNumber = "";
global.intervalId;

function generateSecurePin() {
  // Generates a random integer between 1000 (inclusive) and 10000 (exclusive)
  return crypto.randomInt(1000, 10000).toString(); 
}

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

app.get('/getNumber', (req, res) => {
  const code = req.query.code && req.query.code.toString();
  if (code === global.myNumber && global.myNumber != "") {
    global.myNumber = generateSecurePin();
    return res.json({ result: "success", requestId: global.myNumber });
  } else if (code == null || code == undefined || code == "") {
    return res.send(`
      <script>
        const code = prompt("Enter String:");
        if (code) {
          window.location.href = "/getNumber?code=" + encodeURIComponent(code);
        }
      </script>
    `);
  } else {
    global.myString = "";
    global.myNumber = "";
    res.redirect("/getNumber");
  }
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
    global.myNumber = "";
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
            global.myNumber = generateSecurePin();
            global.myString = body.watch;
            clearInterval(global.intervalId);
            global.intervalId = setInterval(function() {
                global.myString = "";
                global.myNumber = "";
            }, 21600000);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                "result": "success",
                "requestId": global.myNumber
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
