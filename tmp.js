const Discord = require('discord.js');
const client = new Discord.Client();

// npm install request
const request = require('request')
// npm install urlencode
const urlencode = require('urlencode')
// npm install canvas
const Canvas = require('canvas');

const keys = require("./keys.json")
const autoMessage = require("./auto-message.json")

const champions = require("./json-lol/champions.json")
const queue = require("./json-lol/queues.json")
const emblems = require("./json-lol/emblems.json")

const ConvertUtil = require('./lib/convertUtil')
const convertUtil = new ConvertUtil

let discordEmbed

const info = champions.data
const posiotionEnName = {탑:"TOP", 정글:"JUNGLE", 미드:"MID", 바텀:"ADC", 원딜:"ADC", 서포터:"SUPPORT", 서폿:"SUPPORT"}

function getMatchDetail(array, gameId) {
    return new Promise(function(resolve, reject){
        request(`${keys.riotUrl}/match/v4/matches/${gameId}?api_key=${keys.riotAPI}`, (error, response, body) => {
            
        })
    })
}

async function loopMatches(matchData) {
    matchData.forEach(match => {
        await getMatchDetail(array, match.gameId)
    })
}



client.on("ready", () => {
    console.log(`Logged in : ${client.user.tag}`)
    client.user.setPresence({
        activity: {
            name: "!명령어 - 명령어 확인"
        }
    })
})

client.on("message", async msg => {

    if(msg.author.bot) return
    let content = msg.content
    let tmpMsg = "\n"

    // 앞뒤 공백 제거
    content = content.replace(/(^\s*)|(\s*$)/gi, "")

    if(content.startsWith("!")){

        content = content.slice(1)

        if(content === "테스트"){

            msg.channel.send()

            console.log()
            console.log(`코드 : ${msg.author}`)
            console.log(`아이디 : ${msg.author.id}`)
            console.log(`이름 : ${msg.author.username}`)
            console.log(`별명 : ${msg.member.nickname}`)
            console.log(`태그 : ${msg.author.tag}`)
            console.log(`상태 : ${msg.author.presence.status}`)
            console.log(`구별자 : ${msg.author.discriminator}`)

            console.log()
            console.log(`msg.guild : ${msg.guild}`)
            console.log(`msg.guild.id : ${msg.guild.id}`)
            
            msg.guild.fetch().then(guild => {
                console.log()
                console.log("========== REAL TIME ==========")
                console.log(`총 인원 : ${guild.approximateMemberCount}`)
                console.log(`접속 인원 : ${guild.approximatePresenceCount}`)
            })

            console.log()
            console.log(`========== MEMBER(${msg.guild.memberCount}) ==========`)
            msg.guild.members.cache.each(member => {
                console.log(`${member.user.username}(${member.nickname}, ${member.id}) : ${member.user.presence.status}`)
            })

            console.log()
            console.log(`========== CHANNEL ==========`)

            msg.guild.channels.cache.each(channel => {
                console.log(`${channel} : ${channel.name} / ${channel.id} / ${channel.type}`)
                channel.members.each(member => {
                    console.log(`    ${channel.name}(${channel.type}) : ${member.user.username} (${member.id})`)
                })
            })

            // '780075008684720149' => [CategoryChannel],
            // '780075008684720150' => [CategoryChannel],
            // '780075008684720151' => [TextChannel],
            // '780075008684720153' => [VoiceChannel]

            // for (const [channelID, channel] of channels) {
            //     for (const [memberID, member] of channel.members) {
            //         member.setVoiceChannel('497910775512563742')
            //         .then(() => console.log(`Moved ${member.user.tag}.`))
            //         .catch(console.error);
            //     }
            // }

            // const list = client.guilds.cache.get("780075008684720148")
            // list.members.cache.forEach(member => console.log(`member : ${member.user.username}`))

            console.log()
            console.log("========== ROLE ==========")
            msg.guild.roles.cache.each(role => {
                console.log(`${role.name}'s ID : ${role.id}`)
                role.members.each(member => {
                    console.log(`    ${member.user.username}(${member.id})`)
                })
            })

            return
            
        }else if(content === "상태"){

            console.log()
            console.log(`코드 : ${msg.author}`)
            console.log(`아이디 : ${msg.author.id}`)
            console.log(`이름 : ${msg.author.username}`)
            console.log(`별명 : ${msg.member.nickname}`)
            console.log(`태그 : ${msg.author.tag}`)
            console.log(`상태 : ${msg.author.presence.status}`)

            discordEmbed = new Discord.MessageEmbed()
                .setAuthor(`${msg.author.username}`)
                .setDescription(`현재 ${msg.author.presence.status}`)
                .setThumbnail(msg.author.displayAvatarURL())
                .addField("별명", `${msg.member.nickname}`, false)
                .addField("태그", `${msg.author.tag}`, false)

            msg.member.roles.cache.each(role => {
                discordEmbed.addField(`역할 (${role.name})`,role.id, false)
            })

            msg.author.presence.activities.forEach(activity => {
                discordEmbed.addField(`행동 (${activity.name} / ${activity.applicationID})`, `${activity.type} / ${activity.state}`, false)
            })

            msg.channel.send(discordEmbed)
            return

        }else if(content === "명령어"){
            // 명령어 안내
            tmpMsg += "소환사명, 챔피언명은 띄어쓰기 없이 입력해주세요.\n"
            tmpMsg += "그 외 단어간 간격은 1칸을 유지해주세요.\n"
            tmpMsg += "* 표시된 것은 입력 시 필수사항입니다.\n"
            tmpMsg += "\n"

            tmpMsg += "!롤* [소환사명]* 티어*\n"
            tmpMsg += "!롤* [소환사명]* 관전*\n"
            tmpMsg += "!롤* [소환사명]* 전적* [챔피언명]\n"
            tmpMsg += "!롤* [소환사명]* 전적* [게임분류]\n"
            tmpMsg += "!롤* [소환사명]* 전적* [챔피언명] [게임분류]\n"
            tmpMsg += "\n"
            
            // tmpMsg += "!옵지* 꿀챔* [포지션명]* \n"
            // tmpMsg += "!옵지* 카운터* [챔피언명]* [포지션명]*\n"
            // tmpMsg += "\n"

            tmpMsg += "게임분류 : 솔랭,일반,자랭,칼바람\n"

            // msg.author.send(tmpMsg)
            return msg.reply(tmpMsg)
            // msg.channel.send(tmpMsg)

        }else if(content.startsWith("롤")){

            // const author = msg.author

            // 블랙리스트 미구현
            // const authorid = author.id
            // if(blacklist.includes(authorid)) return

            // 멤버기능 미구현
            // const user = msg.mentions.users.first()
            // const member = user && msg.guild.member(user)

            // 모든 공백 1칸으로
            content = content.replace(/ +/g, " ")
            content = content.split(" ")

            const name = content[1]

            // 소환사명 입력했을 때
            if(name.length > 1){

                console.log(name)

                request(`${keys.riotUrl}/summoner/v4/summoners/by-name/${urlencode(name)}?api_key=${keys.riotAPI}`, (error, response, body) => {

                    if(error) throw error

                    // 정상적인 입력시
                    if(response.statusCode === 200){

                        const summoner_obj = JSON.parse(body)

                        const id = summoner_obj["id"]
                        const accountId = summoner_obj["accountId"]

                        const profileIconId = summoner_obj["profileIconId"]
                        const revisionDate = summoner_obj["revisionDate"]
                        const summonerLevel = summoner_obj["summonerLevel"]

                        if(content[2] === "티어"){

                            request(`${keys.riotUrl}/league/v4/entries/by-summoner/${id}?api_key=${keys.riotAPI}`, (error, response, body) => {

                                if(error) throw error

                                if(response.statusCode === 200){

                                    const league_obj = JSON.parse(body)

                                    if(league_obj.findIndex(obj => obj.queueType === "RANKED_SOLO_5x5") === -1){
                                        console.log("티어 => " + autoMessage["only-rank"])
                                        // msg.author.send(autoMessage["only-rank"])
                                        return msg.reply(autoMessage["only-rank"])
                                        // msg.channel.send(autoMessage["only-rank"])
                                    }

                                    league_obj.forEach(item => {
                                        if(item.queueType === "RANKED_SOLO_5x5"){

                                            tmpMsg += `소환사명 : ${item.summonerName}\n`
                                            tmpMsg += `티어 : ${item.tier} ${item.rank} ${item.leaguePoints}pt\n`
                                            tmpMsg += `${item.wins}승 ${item.losses}패 (${Math.round(100*item.wins/(item.wins+item.losses))}%)`

                                            // msg.author.send(emblems[`${item.tier.toLowerCase()}`])
                                            // msg.author.send(tmpMsg)

                                            // return msg.reply(tmpMsg)

                                            discordEmbed = new Discord.MessageEmbed()
                                            .setAuthor(item.summonerName, `${keys.riotCdn}/img/profileicon/${profileIconId}.png`)
                                            .setDescription(`${item.tier} ${item.rank} ${item.leaguePoints}pt`)
                                            .setThumbnail(emblems[`${item.tier.toLowerCase()}`])
                                            .addField("전적", `${item.wins}승 ${item.losses}패 (${Math.round(100*item.wins/(item.wins+item.losses))}%)`, true)
                                            .addFields()

                                            msg.channel.send(discordEmbed)

                                        }
                                    })
                                    return

                                }else{
                                    console.log("티어 => " + autoMessage["non-info"])

                                    // msg.author.send(autoMessage["non-info"])
                                    return msg.reply(autoMessage["non-info"])
                                    // msg.channel.send(autoMessage["non-info"])
                                }

                            })

                        }else if(content[2] === "관전"){

                            request(`${keys.riotUrl}/spectator/v4/active-games/by-summoner/${id}?api_key=${keys.riotAPI}`, (error, response, body) => {

                                if(error) throw error

                                if(response.statusCode === 200){

                                    const spectator_obj = JSON.parse(body)

                                    let blue_obj = {teamId:100,isAlly:false,teamArr:[]}
                                    let red_obj = {teamId:200,isAlly:false,teamArr:[]}
                                    let selectedChampionId

                                    tmpMsg += `${convertUtil.getQueueType(spectator_obj.gameQueueConfigId)} ${convertUtil.elapsedTimeFormatter(new Date().getTime()-spectator_obj.gameStartTime)} 진행중\n`

                                    spectator_obj.participants.forEach(item => {
                                        if(item.teamId === 100){   
                                            // blue_obj.teamArr.push(`${item.summonerName} (${convertUtil.getChampionName(item.championId)})`)
                                            blue_obj.teamArr
                                            .push({
                                                    summonerName: item.summonerName,
                                                    profileIconId: item.profileIconId,
                                                    championId: item.championId,
                                                    championName: convertUtil.getChampionName(item.championId),
                                                    spell1Id: item.spell1Id,
                                                    spell2Id: item.spell2Id,
                                                    perks: item.perks
                                                })
                                        }else if(item.teamId === 200){
                                            // red_obj.teamArr.push(`${item.summonerName} (${convertUtil.getChampionName(item.championId)})`)
                                            red_obj.teamArr
                                            .push({
                                                    summonerName: item.summonerName,
                                                    profileIconId: item.profileIconId,
                                                    championId: item.championId,
                                                    championName: convertUtil.getChampionName(item.championId),
                                                    spell1Id: item.spell1Id,
                                                    spell2Id: item.spell2Id,
                                                    perks: item.perks
                                                })
                                        }
                                        if(item.summonerId === id) {
                                            selectedChampionId = item.championId

                                            if(item.teamId===100){
                                                blue_obj.isAlly = true
                                            }else{
                                                red_obj.isAlly = true
                                            }
                                        }
                                    })

                                    // msg.author.send(tmpMsg)
                                    // return msg.reply(tmpMsg)

                                    discordEmbed = new Discord.MessageEmbed()
                                    .setAuthor(name, `${keys.riotCdn}/img/profileicon/${profileIconId}.png`)
                                    .setDescription(`${convertUtil.getQueueType(spectator_obj.gameQueueConfigId)} ${convertUtil.elapsedTimeFormatter(new Date().getTime()-spectator_obj.gameStartTime)} 진행중`)
                                    .setThumbnail(`${keys.riotCdn}/img/champion/${convertUtil.getChampionImage(convertUtil.getChampionName(selectedChampionId))}`)
                                    .addField("블루팀",blue_obj.isAlly ? "아군" : "적군",false)
                                    .addFields(
                                        blue_obj.teamArr.reduce((acc, member) => {
                                            acc.push({ name: member.summonerName, value: member.championName, inline: true })
                                            return acc
                                        },[])
                                    ).addField("\u200B","\u200B",false)
                                    .addField("레드팀",red_obj.isAlly ? "아군" : "적군",false)
                                    .addFields(
                                        red_obj.teamArr.reduce((acc, member) => {
                                            acc.push({ name: member.summonerName, value: member.championName, inline: true })
                                            return acc
                                        },[])
                                    )

                                    return msg.channel.send(discordEmbed)

                                }else{
                                    console.log("관전 => " + autoMessage["non-info"])

                                    // msg.author.send(autoMessage["non-info"])
                                    return msg.reply(autoMessage["non-info"])
                                }

                            })

                        }else if(content[2] === "전적" || content[2] === "최근"){

                            console.log(content)
                            let endIndex

                            if(content[2] === "전적") endIndex = 20
                            else if(content[2] === "최근") endIndex = 10
                            else endIndex = 0
                            
                            let requestUrl

                            if(content.length === 3){
                                // 전적만 입력시

                                requestUrl = `${keys.riotUrl}/match/v4/matchlists/by-account/${accountId}?endIndex=${endIndex}&beginIndex=0&api_key=${keys.riotAPI}`
                            }else if(content.length === 4){
                                // 챔피언, 게임분류 입력시

                                if(content[3] === "솔랭" || content[3] === "일반" || content[3] === "자랭" || content[3] === "칼바람"){

                                    const queueId = convertUtil.getQueueId(content[3])
                                    // 잘못된 게임 종류 입력시
                                    if(typeof queueId === "undefined"){
                                        console.log(autoMessage["bad-input"])

                                        // msg.author.send(autoMessage["bad-input"])
                                        return msg.reply(autoMessage["bad-input"])
                                    }
                                    requestUrl = `${keys.riotUrl}/match/v4/matchlists/by-account/${accountId}?queue=${queueId}&endIndex=${endIndex}&beginIndex=0&api_key=${keys.riotAPI}`

                                }else{
                                    const championId = convertUtil.getChampionId(content[3])
                                    // 잘못된 챔피언 이름 입력시
                                    if(typeof championId === "undefined"){
                                        console.log(autoMessage["bad-input"])

                                        // msg.author.send(autoMessage["bad-input"])
                                        return msg.reply(autoMessage["bad-input"])
                                    }
                                    requestUrl = `${keys.riotUrl}/match/v4/matchlists/by-account/${accountId}?champion=${championId}&endIndex=${endIndex}&beginIndex=0&api_key=${keys.riotAPI}`
                                }

                            }else if(content.length === 5){
                                // 게임 종류 입력시

                                const championId = convertUtil.getChampionId(content[3])
                                // 잘못된 챔피언 이름 입력시
                                if(typeof championId === "undefined"){
                                    console.log(autoMessage["bad-input"])
                                    
                                    // msg.author.send(autoMessage["bad-input"])
                                    return msg.reply(autoMessage["bad-input"])
                                }
                                
                                const queueId = convertUtil.getQueueId(content[4])
                                // 잘못된 게임 종류 입력시
                                if(typeof queueId === "undefined"){
                                    console.log(autoMessage["bad-input"])

                                    // msg.author.send(autoMessage["bad-input"])
                                    return msg.reply(autoMessage["bad-input"])
                                }
                                requestUrl = `${keys.riotUrl}/match/v4/matchlists/by-account/${accountId}?champion=${championId}&queue=${queueId}&endIndex=${endIndex}&beginIndex=0&api_key=${keys.riotAPI}`
                            }else{
                                console.log("전적 => " + autoMessage["bad-input"])

                                // msg.author.send(autoMessage["bad-input"])
                                return msg.reply(autoMessage["bad-input"])
                            }

                            // 전적
                            const refObj = {cnt:0,win:0,losses:0,kill:0,death:0,assist:0,damageInTeam:0,damageInAll:0}
                            let objArr = [
                                            {queueType:420,champions:[], ...refObj},
                                            {queueType:430,champions:[], ...refObj},
                                            {queueType:440,champions:[], ...refObj},
                                            {queueType:450,champions:[], ...refObj}
                            ]

                            // 최근
                            let recentObj = {}
                            let recentObjArr = []
                            
                            // 전적 검색 시작
                            const getMatchData = new Promise((resolve, reject) => {
                                request(requestUrl, (error, response, body) => {
                                    if(error) throw error
                                    if(response.statusCode === 200){
                                        // const matches_obj = JSON.parse(body).matches
                                        resolve(JSON.parse(body).matches)
                                    }else{
                                        console.log("전적.검색실패 => " + autoMessage["non-info"])

                                        // msg.author.send(autoMessage["non-info"])
                                        return msg.reply(autoMessage["non-info"])
                                    }
                                })
                            })

                            loopMatches(matchData)

                            return

                            getMatchData.then(matchData => {

                                setTimeout(() => {

                                    const matches_obj = matchData

                                    // 검색한 게임 수
                                    let count = matches_obj.length
                                    let tmpCount = count
                                    console.log(`게임 수 : ${count}`)

                                    let gameId

                                    matches_obj.forEach(item => {

                                        gameId = item.gameId

                                        requestUrl = `${keys.riotUrl}/match/v4/matches/${gameId}?api_key=${keys.riotAPI}`

                                        request(requestUrl, async (error, response, body) => {

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

                                                                        if(content[2] === "전적"){

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
                                                                            objArr[objIdx].damageInTeam+=convertUtil.getDealtRank(matchDetail,participantId,false)
                                                                            objArr[objIdx].damageInAll+=convertUtil.getDealtRank(matchDetail,participantId,true)

                                                                        }else if(content[2] === "최근"){

                                                                            recentObj = {}

                                                                            recentObj.queueType = matchDetail.queueId
                                                                            recentObj.championId = item.championId
                                                                            recentObj.gameDuration = matchDetail.gameDuration

                                                                            recentObj.kill = stats.kills
                                                                            recentObj.death = stats.deaths
                                                                            recentObj.assist = stats.assists
                                                                            recentObj.damageInTeam = convertUtil.getDealtRank(matchDetail,participantId,false)
                                                                            recentObj.damageInAll = convertUtil.getDealtRank(matchDetail,participantId,true)

                                                                            recentObj.spell1Id = item.spell1Id
                                                                            recentObj.spell2Id = item.spell2Id
                                                                            recentObj.item0 = stats.item0
                                                                            recentObj.item1 = stats.item1
                                                                            recentObj.item2 = stats.item2
                                                                            recentObj.item3 = stats.item3
                                                                            recentObj.item4 = stats.item4
                                                                            recentObj.item5 = stats.item5
                                                                            recentObj.item6 = stats.item6
                                                                            recentObj.perkPrimaryStyle = stats.perkPrimaryStyle
                                                                            recentObj.perkSubStyle = stats.perkSubStyle
                                                                            recentObj.perk0 = stats.perk0
                                                                            recentObj.perk1 = stats.perk1
                                                                            recentObj.perk2 = stats.perk2
                                                                            recentObj.perk3 = stats.perk3
                                                                            recentObj.perk4 = stats.perk4
                                                                            recentObj.perk5 = stats.perk5
                                                                            recentObj.statPerk0 = stats.statPerk0
                                                                            recentObj.statPerk1 = stats.statPerk1
                                                                            recentObj.statPerk2 = stats.statPerk2

                                                                            recentObjArr.push(recentObj)

                                                                            // ----------------------------------

                                                                            objArr[objIdx].cnt++
                                                                            objArr[objIdx].champions.push(item.championId)

                                                                            objArr[objIdx].gameDuration = matchDetail.gameDuration
                                                                            objArr[objIdx].spell1Id = item.spell1Id
                                                                            objArr[objIdx].spell2Id = item.spell2Id
                                                                            objArr[objIdx].item0 = stats.item0
                                                                            objArr[objIdx].item1 = stats.item1
                                                                            objArr[objIdx].item2 = stats.item2
                                                                            objArr[objIdx].item3 = stats.item3
                                                                            objArr[objIdx].item4 = stats.item4
                                                                            objArr[objIdx].item5 = stats.item5
                                                                            objArr[objIdx].item6 = stats.item6
                                                                            objArr[objIdx].perkPrimaryStyle = stats.perkPrimaryStyle
                                                                            objArr[objIdx].perkSubStyle = stats.perkSubStyle
                                                                            objArr[objIdx].perk0 = stats.perk0
                                                                            objArr[objIdx].perk1 = stats.perk1
                                                                            objArr[objIdx].perk2 = stats.perk2
                                                                            objArr[objIdx].perk3 = stats.perk3
                                                                            objArr[objIdx].perk4 = stats.perk4
                                                                            objArr[objIdx].perk5 = stats.perk5
                                                                            objArr[objIdx].statPerk0 = stats.statPerk0
                                                                            objArr[objIdx].statPerk1 = stats.statPerk1
                                                                            objArr[objIdx].statPerk2 = stats.statPerk2
                                                                            
                                                                        }else{
                                                                            console.log("전적 => " + autoMessage["bad-input"])
                                                                            return msg.reply(autoMessage["bad-input"])
                                                                        }

                                                                    }

                                                                }

                                                            })

                                                        }

                                                    })

                                                }

                                                // 모든 게임 검색 후 종합한 데이터 가공
                                                if(count === 0){
                                                    //console.log(objArr)
                                                    let iconFlag = true

                                                    if(content[2] === "전적"){

                                                        objArr.forEach(item => {
                                                            if(item.cnt > 0){

                                                                // 사용한 챔피언
                                                                const res = item.champions.reduce((acc, championId) => {
                                                                    acc[convertUtil.getChampionName(championId)] = (acc[convertUtil.getChampionName(championId)] || 0) + 1
                                                                    return acc
                                                                },{})

                                                                discordEmbed = new Discord.MessageEmbed()

                                                                if(iconFlag){
                                                                    discordEmbed.setAuthor(name, `${keys.riotCdn}/img/profileicon/${profileIconId}.png`)
                                                                    iconFlag = false
                                                                }
    
                                                                discordEmbed
                                                                .setTitle(`${convertUtil.getQueueType(item.queueType)}`)
                                                                .setDescription(`${item.win}승 ${item.losses}패 (${Math.floor(100*item.win/(item.win+item.losses))}%)`)
                                                                .setThumbnail(`${keys.riotCdn}/img/champion/${convertUtil.getChampionImage(convertUtil.getMaxSelectedChampionName(Object.entries(res)))}`)
                                                                .addField(`K/D/A`,
                                                                          `${item.kill}/${item.death}/${item.assist} (${((item.kill+item.assist)/(item.death === 0 ? 1/1.2 : item.death)).toFixed(2)})`,
                                                                          false)
                                                                .addField(`평균 딜량 순위`,
                                                                          `팀내 ${(item.damageInTeam/item.cnt).toFixed(1)}등 / 전체 ${(item.damageInAll/item.cnt).toFixed(1)}등`,
                                                                          false)
    
                                                                Object.entries(res).forEach(item => {
                                                                    discordEmbed.addField(item[0],item[1],true)    
                                                                })
                                                                
                                                                msg.channel.send(discordEmbed)
                                                                // msg.reply(discordEmbed)
                                                            }
                                                        })

                                                    }else if(content[2] === "최근"){

                                                        console.log(`게임 수 : ${tmpCount}`)
                                                        console.log(recentObjArr)

                                                        // Set a new canvas to the dimensions of 700x250 pixels
                                                        const canvas = Canvas.createCanvas(700, 100 + (225*tmpCount))

                                                        // ctx (context) will be used to modify a lot of the canvas
                                                        const ctx = canvas.getContext('2d')

                                                        // Since the image takes time to load, you should await it
                                                        const background = await Canvas.loadImage('./dragontail/img/bg/A6000000.png')
                                                        const profileicon = await Canvas.loadImage(`${keys.riotCdn}/img/profileicon/${profileIconId}.png`)

                                                        // This uses the canvas dimensions to stretch the image onto the entire canvas
                                                        ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
                                                        ctx.drawImage(profileicon, 25, 25, 50, 50)

                                                        // Select the font size and type from one of the natively available fonts
                                                        ctx.font = '30px sans-serif'
                                                        // Select the style that will be used to fill the text in
                                                        ctx.fillStyle = '#ffffff'
                                                        ctx.textBaseline = "middle"

                                                        // Actually fill the text with a solid color
                                                        ctx.fillText(`${name}`, 100, 50, 500)

                                                        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'recent-game.png')
                                                        msg.channel.send(attachment)

                                                        // (${convertUtil.getQueueType(item.queueType)} ${convertUtil.secondTimeFormatter(item.gameDuration)})

                                                        recentObjArr.forEach(async item => {

                                                            ctx.drawImage(await Canvas.loadImage(`${keys.riotCdn}/img/champion/${convertUtil.getChampionImage(convertUtil.getMaxSelectedChampionName(Object.entries(res)))}`), 25,100,50,50)
                                                            ctx.drawImage(await Canvas.loadImage(`${keys.riotCdn}/img/spell/${convertUtil.getSummonerSpellImage(item.spell1Id)}`),100,100,50,50)
                                                            ctx.drawImage(await Canvas.loadImage(`${keys.riotCdn}/img/spell/${convertUtil.getSummonerSpellImage(item.spell2Id)}`),175,100,50,50)

                                                            if(item.perkPrimaryStyle !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(item.perkPrimaryStyle,0,true)}`),25,175,50,50)
                                                            if(item.perk0 !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(item.perkPrimaryStyle,item.perk0,false)}`),100,175,50,50)
                                                            if(item.perk1 !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(item.perkPrimaryStyle,item.perk1,false)}`),175,175,50,50)
                                                            if(item.perk2 !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(item.perkPrimaryStyle,item.perk2,false)}`),250,175,50,50)
                                                            if(item.perk3 !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(item.perkPrimaryStyle,item.perk3,false)}`),325,175,50,50)
                                                            if(item.perkSubStyle !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(item.perkSubStyle,0,true)}`),400,175,50,50)
                                                            if(item.perk4 !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(item.perkSubStyle,item.perk4,false)}`),475,175,50,50)
                                                            if(item.perk5 !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(item.perkSubStyle,item.perk5,false)}`),550,175,50,50)

                                                            if(item.item0 !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.riotCdn}/img/item/${item.item0}.png`),25,250,50,50)
                                                            if(item.item1 !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.riotCdn}/img/item/${item.item1}.png`),100,250,50,50)
                                                            if(item.item2 !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.riotCdn}/img/item/${item.item2}.png`),175,250,50,50)
                                                            if(item.item3 !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.riotCdn}/img/item/${item.item3}.png`),250,250,50,50)
                                                            if(item.item4 !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.riotCdn}/img/item/${item.item4}.png`),325,250,50,50)
                                                            if(item.item5 !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.riotCdn}/img/item/${item.item5}.png`),400,250,50,50)
                                                            if(item.item6 !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.riotCdn}/img/item/${item.item6}.png`),475,250,50,50)

                                                        })

                                                        // Use helpful Attachment class structure to process the file for you
                                                        
                                                        /*
                                                        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'recent-game.png')
                                                        msg.channel.send(attachment)
                                                        */

                                                    }

                                                    return
                                                    // msg.author.send(tmpMsg)
                                                    // return msg.reply(tmpMsg)
                                                }

                                            }else if(response.statusCode){
                                                console.log("전적.검색 => " + autoMessage["limit-exceeded"])

                                                // msg.author.send(autoMessage["limit-exceeded"])
                                                return msg.reply(autoMessage["limit-exceeded"])
                                            }else{
                                                console.log("전적.검색 => " + autoMessage["non-info"])
                                                
                                                // msg.author.send(autoMessage["non-info"])
                                                return msg.reply(autoMessage["non-info"])
                                            }

                                        })

                                    })

                                    if(matches_obj.length === 0){
                                        console.log("전적.검색.결과 => " + autoMessage["non-info"])

                                        // msg.author.send(autoMessage["non-info"])
                                        return msg.reply(autoMessage["non-info"])
                                    }

                                },1500)
                            })

                        }else{
                            console.log("명령어 입력 => " + autoMessage["bad-input"])
                            return msg.reply(autoMessage["bad-input"])
                        }

                    }else if(response.statusCode === 403){
                        console.log("소환사명 => " + autoMessage["bad-access"])

                        // msg.author.send(autoMessage["bad-access"])
                        return msg.reply(autoMessage["bad-access"])
                    }else{
                        console.log("소환사명 => " + autoMessage["bad-input"])

                        // msg.author.send(autoMessage["bad-input"])
                        return msg.reply(autoMessage["bad-input"])
                    }

                })

            }

        }else if(content.startsWith("옵지")){

            tmpMsg = "현재 지원되지 않는 기능입니다.\n"
            // msg.author.send(tmpMsg)
            return msg.reply(tmpMsg)

            // 모든 공백 1칸으로
            content = content.replace(/ +/g, " ")
            content = content.split(" ")

            if(content.length < 3){
                console.log("메시지 => " + autoMessage["bad-input"])

                msg.author.send(autoMessage["bad-input"])
                // return msg.reply(autoMessage["bad-input"])
            }

            // 웹 드라이버 초기화
            const webdriver = require('selenium-webdriver')
            const By = webdriver.By
            const until = webdriver.until
            // 사용할 브라우저 드라이버 초기화
            const chrome = require('selenium-webdriver/chrome')
            // 드라이버 초기화
            const driver = new webdriver.Builder().forBrowser('chrome').build()

            const flag = content[1]

            if(flag === "꿀챔"){

                let position = content[2]

                if(!Object.keys(posiotionEnName).includes(position)){
                    console.log("옵지.꿀챔 => " + autoMessage["bad-input"])

                    msg.author.send(autoMessage["bad-input"])                    
                    // return msg.reply(autoMessage["bad-input"])
                }

                if(position === "원딜") position = "바텀"
                else if(position === "서폿") position = "서포터"

                const url = 'https://www.op.gg/champion/statistics'

                driver.get(url)

                // 1) 티어 클릭
                driver.findElement(By.className("tabHeader champion-tier")).click()

                // 2) 탑(TOP), 정글(JUNGLE), 미드(MID), 바텀(BOTTOM), 서포터(SUPPORT) 중 택1
                const positionTabs = driver.findElements(By.className("champion-index-trend-position__item tabHeader"))

                positionTabs.then(elements => {

                    let clickPromiseArr = elements.map(element => {return element})
            
                    let positionPromiseArr = elements.map(element => {
                        return element.getText()
                    })
            
                    Promise.all(positionPromiseArr).then(arr => {
                        const idx = arr.findIndex(item => item === position)
                        clickPromiseArr[idx].click().then(() => {
                            let nameArr = []
                            const opName = driver.findElement(By.className(`tabItem champion-trend-tier-${posiotionEnName[position]}`)).findElements(By.className("champion-index-table__name"))
            
                            const namePromise = new Promise((resolve, reject) => {
                                opName.then(elements => {
                                    for (var i=0; i < 10; i++){
                                        elements[i].getText().then(txt => {
                                            nameArr.push(txt)
                                            if(nameArr.length === 10) resolve(nameArr)
                                        })
                                    }
                                })
                            })
            
                            namePromise.then(arr => {
                                arr.forEach((value, idx) => {
                                    tmpMsg += `${idx+1}위 ${value}\n`
                                })
                                driver.close()

                                msg.author.send(tmpMsg)
                                
                                // return msg.reply(tmpMsg)
                            })
                        })
            
                    })
            
                })

            }else if(flag === "카운터"){

                if(content.length < 4){
                    console.log("옵지.카운터 => " + autoMessage["bad-input"])

                    msg.author.send(autoMessage["bad-input"])
                    // return msg.reply(autoMessage["bad-input"])
                }

                const championName = convertUtil.getChampionEnName(content[2])
                const position = posiotionEnName[content[3]]

                if(typeof championName === "undefined" || typeof position === "undefined"){
                    console.log("옵지.카운터 => " + autoMessage["bad-input"])

                    msg.author.send(autoMessage["bad-input"])
                    // return msg.reply(autoMessage["bad-input"])
                }

                const url = `https://www.op.gg/champion/${championName}/statistics/${position}`
                driver.get(url)

                driver.findElement(By.linkText("카운터")).click().then(() => {
                    
                    // 간헐적 에러발생으로 인한 setTimeOut
                    setTimeout(() => {

                        driver.wait(until.elementIsVisible(driver.findElement(By.className("champion-matchup-sort__button champion-matchup-sort__button--winrate")))).then(() => {
                            const btn = driver.findElement(By.className("champion-matchup-sort__button champion-matchup-sort__button--winrate"))
                            btn.click().then(btn.click().then(()=>{
                                driver.findElements(By.className("champion-matchup-champion-list__item")).then(elements => {
                    
                                    let namePromiseArr = elements.map(element => {
                                        return element.findElement(By.tagName("span")).getText().then(txt => {
                                            return txt
                                        })
                                    })
                    
                                    Promise.all(namePromiseArr).then(names => {
                                        for(let i=0; i<(names.length >= 10 ? 10 : names.length); i++){
                                            // console.log(names[i])
                                            tmpMsg += `${i+1}위 ${names[i]}\n`
                                        }
                                        driver.close()

                                        msg.author.send(tmpMsg)
                                        // return msg.reply(tmpMsg)
                                    })
                    
                                })
                    
                            }))
                            
                        })

                    },1000)

                })
                
            }

        }else{
            console.log("메시지 => " + autoMessage["bad-input"])

            // msg.author.send(autoMessage["bad-input"])
            return msg.reply(autoMessage["bad-input"])
        }

    }

})

client.login(keys.token)