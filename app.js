const http = require('http');
const axios = require('axios');
const CryptoJS = require('crypto-js');
const SecretKey = require('./keys');

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
	const internalLineIds = {
		BR: 'NH',
		R: 'RG',
		G: 'GR',
		O: 'OR',
		BL: 'BL',
		Y: 'YL'
	};
    if (!internalLineIds[line]) return [];

    const url = 'https://ws.metro.taipei/cartWeightCore/api/cartweightlocation/getLine';
    const lineId = internalLineIds[line];

	const ts = Math.floor(Date.now() / 1000).toString();
	const value = CryptoJS.HmacSHA256(lineId + ts, SecretKey.HmacSHA256).toString();

	const response = await axios.post(url, {
		"service":"cartRoute",
		"line": lineId,
		"time": ts,
		"value": value
	}, {
		headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36'
		}
	});
    
    const key = CryptoJS.enc.Utf8.parse(SecretKey.AES);
    const iv = CryptoJS.enc.Utf8.parse(SecretKey.AES_IV);
    const data = CryptoJS.AES.decrypt(response.data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8);

    return JSON.parse(data);

}
