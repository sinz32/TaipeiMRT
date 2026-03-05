const axios = require('axios');
const CryptoJS = require('crypto-js');
const SecretKey = require('./keys');

(function() {

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

        const stns = getStationList(line);
        const data = await getTrainList(lineId);
        const terminals = {
            淡水: '단수이',
            大安: '다안',
            象山: '샹산',
            北投: '베이터우',
            新北投: '신베이터우'
        };

        const result = [];
        stns.forEach((e, i) => {
            result[i] = {
                stn: e.name,
                up: [],
                down: []
            };
            data.forEach((e) => {
                if (e.stnId != stns[i].id) return;
                result[i][e.dir].push({
                    no: e.no,
                    sts: e.sts,
                    terminal: terminals[e.terminal] ? terminals[e.terminal] : e.terminal
                });
            });
        });

        return result;
    }

    function getStationList(line) {
        return [
            {name: '샹산 (象山)', id: '099'},
            {name: '타이베이 101/세계무역센터 (台北101/世貿)', id: '100'},
            {name: '신이안허 (信義安和)', id: '101'},
            {name: '다안 (大安)', id: '011'},
            {name: '다안삼림공원 (大安森林公園)', id: '103'},
            {name: '동먼 (東門)', id: '134'},
            {name: '중정기념당 (中正紀念堂)', id: '042'},
            {name: '타이완대학병원 (台大醫院)', id: '050'},
            {name: '타이베이역 (台北車站)', id: '051'},
            {name: '중산 (中山)', id: '053'},
            {name: '솽롄 (雙連)', id: '054'},
            {name: '민취안시루 (民權西路)', id: '055'},
            {name: '위안산 (圓山)', id: '056'},
            {name: '젠탄 (劍潭)', id: '057'},
            {name: '스린 (士林)', id: '058'},
            {name: '즈산 (芝山)', id: '059'},
            {name: '밍더 (明德)', id: '060'},
            {name: '스파이 (石牌)', id: '061'},
            {name: '치리안 (唭哩岸)', id: '062'},
            {name: '치옌 (奇岩)', id: '063'},
            {name: '베이터우 (北投)', id: '064'},
            {name: '푸싱강 (復興崗)', id: '066'},
            {name: '중이 (忠義)', id: '067'},
            {name: '관두 (關渡)', id: '068'},
            {name: '주웨이 (竹圍)', id: '069'},
            {name: '홍수린 (紅樹林)', id: '070'},
            {name: '단수이 (淡水)', id: '071'},

            {name: '베이터우 (北投)', id: '064b'},
            {name: '신베이터우 (新北投)', id: '065'}
        ];
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

        return await parseTrainList(JSON.parse(data), lineId);
    }

    async function parseTrainList(data, lineId) {
        const result = [];
        data.forEach((e) => {
            let dir = e.cDirection;
            if (dir == 'none') return;
            // dir = dir == 'up' ? 'down' : 'up';

            let sts = '도착';
            let stnId = e.cNumberStn;
            if (stnId.includes('-')) {
                stnId = stnId.split('-');
                stnId = dir == 'up' ? stnId[0] : stnId[1];
                sts = '접근';
            }
            
            //신베이터우 지선 예외처리
            if (lineId == 'RG') {
                var pos = e.cPosition;
                dir = dir == 'up' ? 'down' : 'up';
                if (pos == 200) {
                    stnId = '064b';
                    sts = '도착';
                }
                if (pos == 201) {
                    if (dir == 'up') stnId = '064b';
                    else stnId = '065';
                    sts = '접근';
                }
                if (pos == 202) {
                    stnId = '065';
                    sts = '도착';
                }
            }

            result.push({
                no: e.cNumber,
                sts: sts,
                terminal: e.cDestName.slice(0, -1),
                stnId: stnId,
                dir: dir
            })
        });
        return result;
    }
    
    module.exports = {
        get: init
    };

})();