const axios = require('axios');

(function() {

    async function init() {
        const stns = [{name: '타이베이역 (台北車站)', id: 'A01'}, {name: '싼충 (三重)', id: 'A02'}, {name: '신베이산업단지 (新北產業園區)', id: 'A03'}, {name: '신좡부도심 (新莊副都心)', id: 'A04'}, {name: '타이산 (泰山)', id: 'A05'}, {name: '타이산구이허 (泰山貴和)', id: 'A06'}, {name: '국립타이완 체육대학 (體育大學)', id: 'A07'}, {name: '창겅병원 (長庚醫院)', id: 'A08'}, {name: '린커우 (林口)', id: 'A09'}, {name: '산비 (山鼻)', id: 'A10'}, {name: '컹커우 (坑口)', id: 'A11'}, {name: '공항 터미널 1 (機場第一航廈)', id: 'A12'}, {name: '공항 터미널 2 (機場第二航廈)', id: 'A13'}, {name: '공항호텔 (機場旅館)', id: 'A14a'}, {name: '다위안 (大園)', id: 'A15'}, {name: '헝산 (橫山)', id: 'A16'}, {name: '링항 (領航)', id: 'A17'}, {name: '타오위안 고속철도역 (高鐵桃園站)', id: 'A18'}, {name: '타오위안 체육공원 (桃園體育園區)', id: 'A19'}, {name: '싱난 (興南)', id: 'A20'}, {name: '환베이 (環北)', id: 'A21'}, {name: '라오제시 (老街溪)', id: 'A22'}];
        const data = await getTrainList();

        const terminals = {
            A1: '타이베이역',
            A12: '공항 터미널 1',
            A13: '공항 터미널 2',
            A22: '라오제시'
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
                    type: e.type,
                    terminal: terminals[e.terminal]
                });
            });
        });
        
        return result;
    }

    async function getTrainList(lineId, line) {
        const url = 'https://www.tymetro.com.tw/tymetro-new/kr/_pages/travel-guide/getimmediatestatus_cache.php';
        const response = await axios.post(url, {}, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Mobile Safari/537.36'
            }
        });

        const dirs = {
            N: 'up',
            S: 'down'
        };
        const types = {
            COM: '보통',
            EXP: '직통'
        };

        const data = response.data.Payload;
        data.forEach((e, i) => {
            let sts, pos = e.location;
            if (pos.includes('-')) {
                pos = pos.split('-');
                if (pos[0] != pos[1]) sts = '접근';
                else sts = '도착';
                pos = pos[1];
            } else {
                sts = '도착';
            }

            data[i] = {
                no: e.train_no,
                stnId: pos,
                sts: sts,
                dir: dirs[e.direction],
                type: types[e.CAR_TYPE],
                terminal: e.DESTINATION
            };
        });
        
        return data;
    }

    module.exports = {
        get: init
    };

})();