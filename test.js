const champions = require("./json-lol/champions.json")
const ConvertUtil = require('./lib/convertUtil')
// const spectator = require("./json-lol/spectator.json")


// match.json 다루기 예제
// match.matches.forEach(item => {
//     console.log(`gameId : ${item.gameId}`)
//     console.log(`champion : ${getChampionName(''+item.champion)}`)
//     console.log(`role : ${item.role}`)
//     console.log(`lane : ${item.lane}`)
//     console.log(`queue : ${item.queue}`)
//     console.log(`queueType : ${getQueueType(item.queue)}`)
//     console.log(`gameTime : ${item.timestamp}`)
//     console.log()
// })

// match-detail.json 다루기 예제
// matchDetail.participantIdentities.forEach(item => {

//     let participantId = 0

//     if(item.player.summonerName.trim() === ""){

//         participantId = item.participantId

//         matchDetail.participants.forEach(item => {
//             if(item.participantId === participantId){

//                 const stats = item.stats

//                 console.log(`게임 : ${stats.win ? "승리" : "패배"}`)
//                 console.log(`K/D/A : ${stats.kills}/${stats.deaths}/${stats.assists}`)
//                 console.log(`딜량 : ${stats.totalDamageDealtToChampions} (팀내 ${getDealtRank(participantId,false)}등 / 전체 ${getDealtRank(participantId,true)}등)`)

//             }
//         })
//     }

// })

const ref = {kill:0, death:0, assist:0,champions:[]}
let obj = {queueType:420,...ref}
obj.kill += 5
obj.death += 2
obj.assist += 3

obj.champions.push(20)
obj.champions.push(30)
obj.champions.push(30)
obj.champions.push(30)
obj.champions.push(20)

//console.log(obj)

const nums = [30,20,20,40,30,30,40,20,30,40]

let arr = [{id:20,cnt:0},{id:30,cnt:0},{id:40,cnt:0}]

nums.forEach(item => {
    const tmp = arr.find((obj) => {
        return obj.id === item
    })

    tmp.cnt++
})

// 배열 내 요소 제거
arr.forEach(item => {
    if(item.id === 20){
        arr.splice(arr.indexOf(item),1)
    }
})

let chams = [80,   7, 360, 360, 80, 103,  80,  80]
const info = champions.data

const getChampionName = id => {
    for (const [name, obj] of Object.entries(info)) {
        if(obj.key === ""+id){
            return obj.name
        }
    }
}

const res = chams.reduce((acc, cham) => {
    acc[getChampionName(cham)] = (acc[getChampionName(cham)] || 0) + 1
    return acc
},{})

let msg = ""
Object.entries(res).forEach(([name, cnt], index) => {
    if(index === Object.keys(res).length-1){
        msg += `${name} ${cnt}`
    }else{
        msg += `${name} ${cnt}, `
    }
})
//console.log(msg)





const objArr = [
    {
      queueType: 420,
      cnt: 0,
      champions: [ 360, 29, 360, 80, 127 ],
      win: 0,
      losses: 0,
      kill: 0,
      death: 0,
      assist: 0,
      damageInTeam: 0,
      damageInAll: 0
    },
    {
      queueType: 430,
      cnt: 3,
      champions: [ 360, 29, 360, 80, 127 ],
      win: 3,
      losses: 0,
      kill: 13,
      death: 7,
      assist: 14,
      damageInTeam: 0,
      damageInAll: 8
    },
    {
      queueType: 450,
      cnt: 2,
      champions: [ 360, 29, 360, 80, 127 ],
      win: 1,
      losses: 1,
      kill: 17,
      death: 23,
      assist: 44,
      damageInTeam: 3,
      damageInAll: 6
    }
  ]

const selectedQueueId = (obj) => obj.queueType === 430
//console.log(objArr.findIndex(selectedQueueId))



// 1602340296876
// 1602342670535

function elapsedTimeFormatter(ctime){
    const stime = parseInt(ctime/1000);
    return `진행 시간 : ${parseInt(stime/60)}:${stime%60 < 10 ? "0"+stime%60 : stime%60}`;
    //return parseInt(stime/min) + "분 전";
}



// let blue_obj = {teamId:100,isAlly:false,teamArr:[]}
// let red_obj = {teamId:200,isAlly:false,teamArr:[]}
// spectator.participants.forEach(item => {
//     if(item.teamId === 100){   
//         blue_obj.teamArr.push(`${item.summonerName} (${item.championId})`)
//     }else if(item.teamId === 200){
//         red_obj.teamArr.push(`${item.summonerName} (${item.championId})`)
//     }
//     if("논현동지영이" === item.summonerName) {
//         if(item.teamId===100){
//             blue_obj.isAlly = true
//         }else{
//             red_obj.isAlly = true
//         }
//     }
// })

// console.log(`${getQueueType(spectator.gameQueueConfigId)} 진행중`)

// console.log("같은 팀")
// const allies = blue_obj.isAlly ? blue_obj : red_obj
// allies.teamArr.forEach(item => {
//     console.log(`    ${item}`)
// })
// console.log("상대팀")
// const enemies = !blue_obj.isAlly ? blue_obj : red_obj
// enemies.teamArr.forEach(item => {
//     console.log(`    ${item}`)
// })

// console.log(elapsedTimeFormatter(new Date().getTime()-1602342670535))

// const nameObj = {탑:"TOP", 정글:"JUNGLE", 미드:"MID", 바텀:"ADC", 서폿:"SUPPORT"}
// console.log(nameObj)

// console.log(nameObj.탑)


// -----------------------------
// const arr1 = [ [ '브랜드', 1 ], [ '모데카이저', 1 ], [ '자이라', 1 ] ]
// const arr2 = [ [ '판테온', 1 ], [ '진', 1 ] ]
// const arr3 = [
//   [ '노틸러스', 1 ], [ '르블랑', 1 ],
//   [ '피즈', 2 ],     [ '탈리야', 5 ],
//   [ '조이', 1 ],     [ '럼블', 1 ],
//   [ '코르키', 1 ],   [ '바루스', 2 ],
//   [ '에코', 4 ],     [ '진', 1 ],
//   [ '애쉬', 1 ],     [ '룰루', 1 ],
//   [ '트위치', 1 ]
// ]

// function getMax(arr){
//     let max = -1
//     let name = ""
//     arr.forEach(item => {
//         if(item[1]>max){
//             max = item[1]
//             name = item[0]
//         }
//     })
//     return name
// }

// function getImage(name){
//     for (const [enName, obj] of Object.entries(champions.data)) {
//         if(obj.name === name){
//             return obj.image.full
//         }
//     }
// }

// console.log(getImage(getMax(arr3)))

const convertUtil = new ConvertUtil
// console.log(convertUtil.elapsedTimeFormatter(1607348574988))
// console.log(convertUtil.secondTimeFormatter(1364))
// console.log(convertUtil.getSummonerSpellImage(4))

const numArr = [1,3,8,4,7,9,10,2,6,5]
const output = []

function delay(item) {
    return new Promise(function(resolve, reject){
        setTimeout(function(){
            console.log(item);
            resolve();
        },item*100)
    })
}

async function test(array) {
    for(let i=0; i< array.length; i++){
        await delay(array[i]);
    }
    console.log('Done');
}



async function test(array) {
    for(let i=0; i< array.length; i++){
        await new Promise(function(resolve, reject){
            setTimeout(function(){
                console.log(array[i]);
                output.push(array[i]*10)
                resolve();
            },array[i]*100)
        })
    }
    console.log('Done');
}

test(numArr).then(res => {
    console.log(output)
})

