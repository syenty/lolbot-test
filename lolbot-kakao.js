// npm install request
const request = require('request')
// npm install urlencode
const urlencode = require('urlencode')

const keys = require("./keys.json")
const autoMessage = require("./auto-message.json")

const champions = require("./json-lol/champions.json")
const queue = require("./json-lol/queues.json")
const { match } = require('assert')

// const user = require("./json-lol/user.json")
// const match = require("./json-lol/matches.json")
// const matchDetail = require("./json-lol/match-detail.json")

const info = champions.data

const getChampionName = id => {
    for (const [enName, obj] of Object.entries(info)) {
        if(obj.key === ""+id){
            return obj.name
        }
    }
}

const getChampionId = name => {
    for (const [enName, obj] of Object.entries(info)) {
        if(obj.name === name){
            return obj.key
        }
    }
}

const getQueueType = queueId => {
    for(const item of queue){
        if(queueId === item.queueId){
            return item.description
        }
    }
}

const getQueueId = queueName => {
    for(const item of queue){
        if(queueName === item.description){
            return item.queueId
        }
    }
}

// 딜량 등수 (flag : true 전체, false 팀 내)
// 공동 딜량에 대한 처리 미구현
const getDealtRank = (matchDetail, participantId, flag) => {
    let obj = {}
    let arr = []

    const teamId = matchDetail.participants[matchDetail.participants.findIndex(obj => obj.participantId === participantId)].teamId
    matchDetail.participants.forEach((item, idx) => {
        if(flag || item.teamId === teamId){
            obj = {}
            obj.id = item.participantId
            obj.deal = item.stats.totalDamageDealtToChampions
            arr[idx] = obj
        }   
    })
    arr.sort(function (a,b){ 
        return b.deal - a.deal
    })
    
    //console.log(arr,participantId)

    return arr.findIndex(obj => obj.id === participantId)+1
}

let msg = "  !롤 논현동지영이 전적 샤코"

// 앞뒤 공백 제거
msg = msg.replace(/(^\s*)|(\s*$)/gi, "")

if(msg.startsWith("!")){

    msg = msg.slice(1)

    if(msg === "롤"){
        // 명령어 안내
    }else if(msg.startsWith("롤")){

        // 모든 공백 1칸으로
        msg = msg.replace(/ +/g, " ")
        msg = msg.split(" ")

        const name = msg[1]

        // 소환사명 입력했을 때
        if(name.length > 1){

            console.log(name)

            request(`${keys.riotUrl}/summoner/v4/summoners/by-name/${urlencode(name)}?api_key=${keys.riotAPI}`, (error, response, body) => {

                if(error) throw error

                console.log(response.statusCode)

                // 정상적인 입력시
                if(response.statusCode === 200){

                    const summoner_obj = JSON.parse(body)

                    const id = summoner_obj["id"]
                    const accountId = summoner_obj["accountId"]

                    if(msg[2] === "티어"){

                        request(`${keys.riotUrl}/league/v4/entries/by-summoner/${id}?api_key=${keys.riotAPI}`, (error, response, body) => {

                            if(error) throw error

                            if(response.statusCode === 200){

                                const league_obj = JSON.parse(body)

                                if(league_obj.findIndex(obj => obj.queueType === "RANKED_SOLO_5x5") === -1){
                                    console.log("티어 => " + autoMessage["only-rank"])
                                    return
                                }

                                league_obj.forEach(item => {
                                    if(item.queueType === "RANKED_SOLO_5x5"){
                                        console.log(`소환사명 : ${item.summonerName}`)
                                        console.log(`티어 : ${item.tier} ${item.rank} ${item.leaguePoints}pt`)
                                        console.log(`${item.wins}승 ${item.losses}패 (${Math.round(100*item.wins/(item.wins+item.losses))}%)`)
                                    }
                                })

                            }else{
                                console.log("티어 => " + autoMessage["non-info"])
                            }

                        })

                    }else if(msg[2] === "관전"){

                        request(`${keys.riotUrl}/spectator/v4/active-games/by-summoner/${id}?api_key=${keys.riotAPI}`, (error, response, body) => {

                            if(error) throw error

                            if(response.statusCode === 200){

                                const spectator_obj = JSON.parse(body)

                                console.log(spectator_obj.gameId)
                                console.log(spectator_obj.gameType)
                                console.log(spectator_obj.championId)

                            }else{
                                console.log("관전 => " + autoMessage["non-info"])
                            }

                        })

                    }else if(msg[2] === "전적"){

                        console.log(msg)

                        let requestUrl

                        if(msg.length === 3){
                            // 전적만 입력시

                            requestUrl = `${keys.riotUrl}/match/v4/matchlists/by-account/${accountId}?endIndex=10&beginIndex=0&api_key=${keys.riotAPI}`
                        }else if(msg.length === 4){
                            // 챔피언 입력시

                            const championId = getChampionId(msg[3])
                            // 잘못된 챔피언 이름 입력시
                            if(typeof championId === "undefined"){
                                console.log(autoMessage["bad-input"])
                                return
                            }
                            requestUrl = `${keys.riotUrl}/match/v4/matchlists/by-account/${accountId}?champion=${championId}&endIndex=10&beginIndex=0&api_key=${keys.riotAPI}`
                        }else if(msg.length === 5){
                            // 게임 종류 입력시

                            const championId = getChampionId(msg[3])
                            // 잘못된 챔피언 이름 입력시
                            if(typeof championId === "undefined"){
                                console.log(autoMessage["bad-input"])
                                return
                            }

                            const queueId = getQueueId(msg[4])
                            // 잘못된 게임 종류 입력시
                            if(typeof queueId === "undefined"){
                                console.log(autoMessage["bad-input"])
                                return
                            }
                            requestUrl = `${keys.riotUrl}/match/v4/matchlists/by-account/${accountId}?champion=${championId}&queue=${queueId}&endIndex=10&beginIndex=0&api_key=${keys.riotAPI}`
                        }else{
                            console.log("전적 => " + autoMessage["bad-input"])
                            return
                        }

                        const refObj = {cnt:0,win:0,losses:0,kill:0,death:0,assist:0,damageInTeam:0,damageInAll:0}
                        let objArr = [
                                        {queueType:420,champions:[], ...refObj},
                                        {queueType:430,champions:[], ...refObj},
                                        {queueType:440,champions:[], ...refObj},
                                        {queueType:450,champions:[], ...refObj}
                                    ]
                        
                        // 전적 검색 시작
                        request(requestUrl, (error, response, body) => {

                            if(error) throw error

                            if(response.statusCode === 200){

                                const matches_obj = JSON.parse(body).matches

                                // 검색한 게임 수
                                let count = matches_obj.length
                                console.log(`게임 수 : ${count}`)

                                let gameId

                                function delay() {
                                    return new Promise(resolve => setTimeout(resolve, 500));
                                }                                  
                                async function delayedLog() {
                                    await delay()
                                }

                                matches_obj.forEach(async item => {

                                    await delayedLog()
                                    
                                    gameId = item.gameId

                                    requestUrl = `${keys.riotUrl}/match/v4/matches/${gameId}?api_key=${keys.riotAPI}`

                                    request(requestUrl, (error, response, body) => {

                                        if(error) throw error

                                        if(response.statusCode === 200){

                                            const matchDetail = JSON.parse(body)

                                            count--

                                            // 솔랭, 일반, 자랭, 칼바람 일때만 집계
                                            if(matchDetail.queueId === 420 || matchDetail.queueId === 430 || matchDetail.queueId === 440 || matchDetail.queueId === 450){

                                                matchDetail.participantIdentities.forEach(item => {

                                                    if(item.player.summonerId === id){

                                                        const participantId = item.participantId

                                                        const selectedQueueId = (obj) => obj.queueType === matchDetail.queueId
                                                        let objIdx

                                                        matchDetail.participants.forEach(item => {

                                                            if(item.participantId === participantId){

                                                                objIdx = objArr.findIndex(selectedQueueId)

                                                                if(objIdx > -1){

                                                                    const stats = item.stats

                                                                    objArr[objIdx].cnt++
                                                                    objArr[objIdx].champions.push(item.championId)
                                                                    if(stats.win){
                                                                        objArr[objIdx].win++
                                                                    }else{
                                                                        objArr[objIdx].losses++
                                                                    }
                                                                    
                                                                    objArr[objIdx].kill+=stats.kills
                                                                    objArr[objIdx].death+=stats.deaths
                                                                    objArr[objIdx].assist+=stats.assists
                                                                    objArr[objIdx].damageInTeam+=getDealtRank(matchDetail,participantId,false)
                                                                    objArr[objIdx].damageInAll+=getDealtRank(matchDetail,participantId,true)

                                                                }

                                                            }

                                                        })

                                                    }

                                                })

                                            }

                                            // 모든 게임 검색 후 종합한 데이터 가공
                                            if(count === 0){
                                                //console.log(objArr)
                                                
                                                objArr.forEach(item => {
                                                    if(item.cnt > 0){

                                                        // 게임타입
                                                        console.log(`${getQueueType(item.queueType)}`)

                                                        // 승패 및 승률
                                                        console.log(`${item.win}승 ${item.losses}패 (${Math.floor(100*item.win/(item.win+item.losses))}%)`)

                                                        // 사용한 챔피언
                                                        const res = item.champions.reduce((acc, championId) => {
                                                            acc[getChampionName(championId)] = (acc[getChampionName(championId)] || 0) + 1
                                                            return acc
                                                        },{})
                                                        let championLog = ""
                                                        Object.entries(res).forEach(([name, cnt], index) => {
                                                            if(index === Object.keys(res).length-1){
                                                                championLog += `${name} ${cnt}`
                                                            }else{
                                                                championLog += `${name} ${cnt}, `
                                                            }
                                                        })
                                                        console.log(`사용한 챔피언 : ${championLog}`)

                                                        // K/D/A
                                                        console.log(`K/D/A : ${item.kill}/${item.death}/${item.assist} (${((item.kill+item.assist)/(item.death === 0 ? 1/1.2 : item.death)).toFixed(2)})`)

                                                        // 딜량 순위
                                                        console.log(`평균 딜량 순위 : 팀내 ${(item.damageInTeam/item.cnt).toFixed(1)}등 / 전체 ${(item.damageInAll/item.cnt).toFixed(1)}등`)
                                                        console.log()

                                                    }
                                                })
                                            }

                                        }else if(response.statusCode){
                                            console.log("전적.검색 => " + autoMessage["limit-exceeded"])
                                            return
                                        }else{
                                            console.log("전적.검색 => " + autoMessage["non-info"])
                                            return
                                        }

                                    })

                                })

                                if(matches_obj.length === 0){
                                    console.log("전적.검색.결과 => " + autoMessage["non-info"])
                                    return
                                }

                            }else{
                                console.log("전적.검색실패 => " + autoMessage["non-info"])
                                return
                            }

                        })
                        
                        

                    }

                }else if(response.statusCode === 403){
                    console.log("소환사명 => " + autoMessage["bad-access"])
                }else{
                    console.log("소환사명 => " + autoMessage["bad-input"])
                    return
                }

            })

        }

    }else{
        console.log("메시지 => " + autoMessage["bad-input"])
        return
    }

}

