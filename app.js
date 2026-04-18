const http = require('http');
const mrt = require('./mrt');
const lrt = require('./lrt');
const airport = require('./airport');

http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
	const params = Object.fromEntries(url.searchParams)
    res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8;'
    });
    let result;
    
    const lineId = params.line;
    if (lineId == 'K' || lineId == 'V') {
        result = await lrt.get(lineId);
    } else if (lineId == 'A') {
        result = await airport.get(lineId);
    } else {
        result = await mrt.get(lineId);
    }

    res.write(JSON.stringify(result, null, 4));
    res.end();
}).listen(8080);
