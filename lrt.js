const axios = require('axios');

(function() {

    async function init(lineId) {
        let line;
        if (lineId == 'V') line = 'danhai';
        else if (lineId == 'K') line = 'ankeng';
        else return [];

        const stns = getStationList(lineId);
        const data = await getTrainList(lineId, line);

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
                });
            });
        });
        
        return result;
    }

    function getStationList(lineId) {
        switch (lineId) {
            case 'V':
                return [
                    {name: '홍수린 (紅樹林)', id: 'V01'}, {name: '간전린 (竿蓁林)', id: 'V02'}, {name: '단진덩궁 (淡金鄧公)', id: 'V03'},{name: '담강대학 (淡江大學)', id: 'V04'}, {name: '단진베이신 (淡金北新)', id: 'V05'}, {name: '신스이루 (新市一路)', id: 'V06'}, {name: '단수이구청 (淡水行政中心)', id: 'V07'}, {name: '빈하이이산 (濱海義山)', id: 'V08'}, {name: '빈하이사룬 (濱海沙崙)', id: 'V09'},  {name: '단하이뉴타운 (淡海新市鎮)', id: 'V10'},{name: '칸딩 (崁頂)', id: 'V11'},
                    {name: '타이베이해양대학 (台北海洋大學)', id: 'V28'}, {name: '사룬 (沙崙)', id: 'V27'}, {name: '단수이어민부두 (淡水漁人碼頭)', id: 'V26'}
                ];
            case 'K':
                return [
                    {name: '솽청 (雙城)', id: 'K01'}, {name: '로즈차이나타운 (玫瑰中國城)', id: 'K02'}, {name: '타이베이샤오청 (台北小城)', id: 'K03'}, {name: '겅신안캉병원 (耕莘安康院區)', id: 'K04'}, {name: '징원과기대학 (景文科大)', id: 'K05'}, {name: '안캉 (安康)', id: 'K06'}, {name: '양광운동공원 (陽光運動公園)', id: 'K07'}, {name: '신허초등학교 (新和國小)', id: 'K08'}, {name: '스쓰장 (十四張)', id: 'K09'}
                ];
        }
    }


    async function getTrainList(lineId, line) {
        const url = 'https://trainstatus.ntmetro.com.tw/roadmap/' + line + '_data.php';
        const response = await axios.post(url, {}, {
            headers: {
                'referer': 'https://trainstatus.ntmetro.com.tw/roadmap/' + line + '.php',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'
            }
        });

        const data = response.data.data.gpsData;
        const result = [];
        if (lineId == 'V') {
            for (let n = 0; n < data.length; n++){
                const dir = n < 3 ? 'down' : 'up';
                for (let id in data[n]){
                    const e = data[n][id];
                    if (e.carNum != '') result.push({
                        no: e.carNum,
                        sts: e.time == 0 ? '도착' : '접근',
                        stnId: id,
                        dir: dir
                    });
                }
            }
        } else if (lineId == 'K') {
            for (let n = 0; n < data.length; n++){
                const dir = n ==0 ? 'down' : 'up';
                for (let id in data[n]){
                    const e = data[n][id];
                    if (e.carNum != '') result.push({
                        no: e.carNum,
                        sts: e.time == 0 ? '도착' : '접근',
                        stnId: id,
                        dir: dir
                    });
                }
            }
        }
        
        return result;
    }

    module.exports = {
        get: init
    };

})();