# simplerr

A simple Express error handler.

## Installation

```
npm install simplerr --save
```

## Usage

```
var express = require('express');
var simplerr = require('simplerr');
var app = express();

app.set('json spaces', 2);

app.get('/', function(req, res) {
    res.send('Home is where the fart is...');
});

// Must be after other 'app.use()' and route calls
app.use(simplerr.handler);

// All sorts of magic and whatever go here 
```