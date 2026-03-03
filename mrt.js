const axios = require('axios');
const CryptoJS = require('crypto-js');
const SecretKey = require('./keys');

(function(){

    async function init(line) {
        const internalLineIds = {
            BR: 'NH',
            R: 'RG',
            G: 'GR',
            O: 'OR',
            BL: 'BL',
            Y: 'YL'
        };
        if (!internalLineIds[line]) return [];
        const lineId = internalLineIds[line];

        const data = await getTrainList(lineId);
        return data;
    }


    async function getTrainList(lineId) {
        const url = 'https://ws.metro.taipei/cartWeightCore/api/cartweightlocation/getLine';

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
    
    module.exports = {
        get: init
    };

})();