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
            
            南港展覽館: '난강전람관',
            動物園: '동물원',

            淡水: '단수이',
            大安: '다안',
            象山: '샹산',
            北投: '베이터우',
            新北投: '신베이터우',

            松山: '송산',
            新店: '신덴',
            台電大樓站: '대만전력공사빌딩',
            七張: '치장',
            小碧潭: '샤오비탄',

            南勢角: '난스자오',
            迴龍: '후이룽',
            蘆洲: '루저우',
    
            頂埔: '딩푸',
            亞東醫院: '야둥병원',
    
            大坪林: '다핑린',
            新北產業園區: '신베이산업단지'
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
        switch (line) {
            case 'BR':
                return [
                    {name: '동물원 (動物園)', id: '019'},{name: '무자 (木柵)', id: '018'},{name: '완팡단지 (萬芳社區)', id: '017'},{name: '완팡병원 (萬芳醫院)', id: '016'},{name: '신하이 (辛亥)', id: '015'},{name: '린광 (麟光)', id: '014'},{name: '류장리 (六張犁)', id: '013'},{name: '테크놀로지 빌딩 (科技大樓)', id: '012'},{name: '다안 (大安)', id: '011'},{name: '중샤오푸싱 (忠孝復興)', id: '010'},{name: '난징푸싱 (南京復興)', id: '009'},{name: '중산중학교 (中山國中)', id: '008'},{name: '송산공항 (中山國中)', id: '007'},{name: '다즈 (大直)', id: '021'},{name: '젠난루 (劍南路)', id: '022'},{name: '시후 (西湖)', id: '023'},{name: '강첸 (港墘)', id: '024'},{name: '원더 (文德)', id: '025'},{name: '네이후 (內湖)', id: '026'},{name: '다후공원 (大湖公園)', id: '027'},{name: '후저우 (葫洲)', id: '028'},{name: '동후 (東湖)', id: '029'},{name: '난강 소프트웨어 단지 (南港軟體園區)', id: '030'},{name: '난강전람관 (南港展覽館)', id: '031'}
                ];
            case 'R':
                return [
                    {name: '샹산 (象山)', id: '099'},{name: '타이베이 101/세계무역센터 (台北101/世貿)', id: '100'},{name: '신이안허 (信義安和)', id: '101'},{name: '다안 (大安)', id: '011'},{name: '다안삼림공원 (大安森林公園)', id: '103'},{name: '동먼 (東門)', id: '134'},{name: '중정기념당 (中正紀念堂)', id: '042'},{name: '타이완대학병원 (台大醫院)', id: '050'},{name: '타이베이역 (台北車站)', id: '051'},{name: '중산 (中山)', id: '053'},{name: '솽롄 (雙連)', id: '054'},{name: '민취안시루 (民權西路)', id: '055'},{name: '위안산 (圓山)', id: '056'},{name: '젠탄 (劍潭)', id: '057'},{name: '스린 (士林)', id: '058'},{name: '즈산 (芝山)', id: '059'},{name: '밍더 (明德)', id: '060'},{name: '스파이 (石牌)', id: '061'},{name: '치리안 (唭哩岸)', id: '062'},{name: '치옌 (奇岩)', id: '063'},{name: '베이터우 (北投)', id: '064'},{name: '푸싱강 (復興崗)', id: '066'},{name: '중이 (忠義)', id: '067'},{name: '관두 (關渡)', id: '068'},{name: '주웨이 (竹圍)', id: '069'},{name: '홍수린 (紅樹林)', id: '070'},{name: '단수이 (淡水)', id: '071'},
                    {name: '베이터우 (北投)', id: '064b'},{name: '신베이터우 (新北投)', id: '065'}
                ];
            case 'G':
                return [
                    {name: '신덴 (新店)', id: '033'},{name: '신덴구청 (新店區)', id: '034'},{name: '치장 (七張)', id: '035'},{name: '다핑린 (大坪林)', id: '036'},{name: '징메이 (景美)', id: '037'},{name: '완룽 (萬隆)', id: '038'},{name: '궁관 (公館)', id: '039'},{name: '대만전력공사빌딩 (台電大樓)', id: '040'},{name: '구팅 (古亭)', id: '041'},{name: '중정기념당 (中正紀念堂)', id: '042'},{name: '샤오난먼 (小南門)', id: '043'},{name: '시먼 (西門)', id: '086'},{name: '베이먼 (北門)', id: '105'},{name: '중산 (中山)', id: '053'},{name: '쑹장난징 (松江南京)', id: '132'},{name: '난징푸싱 (南京復興)', id: '009'},{name: '타이베이 아레나 (台北小巨蛋)', id: '109'},{name: '난징싼민 (南京三民)', id: '110'},{name: '송산 (松山)', id: '111'},
                    {name: '치장 (七張)', id: '035b'},{name: '샤오비탄 (小碧潭)', id: '032'}
                ];
            case 'O':
                return [
                    {name: '난스자오 (南勢角)', id: '048'},{name: '징안 (景安)', id: '047'},{name: '융안시장 (永安市場)', id: '046'},{name: '딩시 (頂溪)', id: '045'},{name: '구팅 (古亭)', id: '041'},{name: '둥먼 (東門)', id: '134'},{name: '중샤오신성 (忠孝新生)', id: '089'},{name: '쑹장난징 (松江南京)', id: '132'},{name: '싱톈궁 (行天宮)', id: '131'},{name: '중산초교 (中山國小)', id: '130'},{name: '민취안시루 (民權西路)', id: '055'},{name: '다차오터우 (大橋頭)', id: '128'},{name: '타이베이대교 (台北橋)', id: '127'},{name: '차이랴오 (菜寮)', id: '126'},{name: '싼충 (三重)', id: '125'},{name: '셴써궁 (先嗇宮)', id: '124'},{name: '터우첸좡 (頭前庄)', id: '123'},{name: '신좡 (新莊)', id: '122'},{name: '푸런대학교 (輔大)', id: '121'},{name: '단펑 (丹鳳)', id: '180'},{name: '후이룽 (迴龍)', id: '179'},
                    {name: '싼충초교 (三重國小)', id: '178'},{name: '싼허중학교 (三和國中)', id: '177'},{name: '쉬후이고교 (徐匯中學)', id: '176'},{name: '싼민고교 (三民高中)', id: '175'},{name: '루저우 (蘆洲)', id: '174'}
                ];
            case 'BL':
                return [
                    {name: '딩푸 (頂埔)', id: '076'},{name: '융닝 (永寧)', id: '077'},{name: '투청 (土城)', id: '078'},{name: '하이산 (海山)', id: '079'},{name: '야둥병원 (亞東醫院)', id: '080'},{name: '푸중 (府中)', id: '081'},{name: '반차오 (板橋)', id: '082'},{name: '신푸 (新埔)', id: '083'},{name: '장쯔추이 (江子翠)', id: '084'},{name: '용산사 (龍山寺)', id: '085'},{name: '시먼 (西門)', id: '086'},{name: '타이베이역 (台北車站)', id: '051'},{name: '산다오사 (善導寺)', id: '088'},{name: '중샤오신성 (忠孝新生)', id: '089'},{name: '중샤오푸싱 (忠孝復興)', id: '010'},{name: '중샤오둔화 (忠孝敦化)', id: '091'},{name: '국부기념관 (國父紀念館)', id: '092'},{name: '타이베이시청 (市政府)', id: '093'},{name: '융춘 (永春)', id: '094'},{name: '허우산비 (後山埤)', id: '095'},{name: '쿤양 (昆陽)', id: '096'},{name: '난강 (南港)', id: '097'},{name: '난강전람관 (南港展覽館)', id: '031'}
                ];
            case 'Y':
                return [
                    {name: '다핑린 (大坪林)', id: '036'},{name: '스쓰장 (十四張)', id: '201'},{name: '슈랑교 (秀朗橋)', id: '202'},{name: '징핑 (景平)', id: '203'},{name: '징안 (景安)', id: '047'},{name: '중허 (中和)', id: '205'},{name: '차오허 (橋和)', id: '206'},{name: '중위안 (中原)', id: '207'},{name: '반신 (板新)', id: '208'},{name: '반차오 (板橋)', id: '209'},{name: '신푸민성 (新埔民生)', id: '210'},{name: '터우첸좡 (頭前庄)', id: '123'},{name: '싱푸 (幸福)', id: '212'},{name: '신베이산업단지 (新北產業園區)', id: '213'}
                ];
        }
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
            dir = dir == 'up' ? 'down' : 'up';
            

            let sts = '도착';
            let stnId = e.cNumberStn;
            if (stnId.includes('-')) {
                stnId = stnId.split('-');
                stnId = dir == 'up' ? stnId[1] : stnId[0];
                sts = '접근';
            }
            
            //신베이터우 지선 예외처리
            if (lineId == 'RG') {
                let pos = e.cPosition;
                if (pos == 200) {
                    dir = dir == 'up' ? 'down' : 'up';
                    stnId = '064b';
                    sts = '도착';
                }
                if (pos == 201) {
                    dir = dir == 'up' ? 'down' : 'up';
                    if (dir == 'up') stnId = '064b';
                    else stnId = '065';
                    sts = '접근';
                }
                if (pos == 202) {
                    dir = dir == 'up' ? 'down' : 'up';
                    stnId = '065';
                    sts = '도착';
                }
            }

            //샤오비탄 지선
            else if (lineId == 'GR') {
                var pos = e.cPosition;
                if (pos == 302) {
                    dir = dir == 'up' ? 'down' : 'up';
                    stnId = '035b';
                    sts = '도착';
                }
                if (pos == 301) {
                    dir = dir == 'up' ? 'down' : 'up';
                    if (dir == 'up') stnId = '035b';
                    else stnId = '032';
                    sts = '접근';
                }
                if (pos == 300) {
                    dir = dir == 'up' ? 'down' : 'up';
                    stnId = '032';
                    sts = '도착';
                }
            }
            
            result.push({
                no: e.cNumber ? e.cNumber : e.sPVID,
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