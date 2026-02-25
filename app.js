const http = require('http');
const axios = require('axios');
const CryptoJS = require('crypto-js');

http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
	const params = Object.fromEntries(url.searchParams)
    res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8;'
    });
    res.write(JSON.stringify(await getTrainList(params.line), null, 4));
    res.end();
}).listen(8080);

async function getTrainList(line) {
    return [];
}
