const express = require('express');

const app = express();

app.use('/', express.static(__dirname));

app.get('/', function(req, res) {
        console.log(`${__dirname}`);
        res.sendFile('./web/index.html', { root: __dirname });
});

app.listen(1337, () => {
        console.log('Server started!');
});
