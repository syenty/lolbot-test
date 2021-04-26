const Discord = require('discord.js');
const client = new Discord.Client();

// npm install request
const request = require('request')
// npm install urlencode
const urlencode = require('urlencode')
// npm install canvas
const Canvas = require('canvas');

// const keys = require("./keys.json")
const autoMessage = require("./auto-message.json")

const champions = require("./json-lol/champions.json")
const queue = require("./json-lol/queues.json")
const emblems = require("./json-lol/emblems.json")
const properties = require("./properties.json")

const ConvertUtil = require('./lib/convertUtil');
const { default: axios } = require('axios');
const convertUtil = new ConvertUtil

let discordEmbed
let keys

const info = champions.data
const posiotionEnName = {탑:"TOP", 정글:"JUNGLE", 미드:"MID", 바텀:"ADC", 원딜:"ADC", 서포터:"SUPPORT", 서폿:"SUPPORT"}

// flag : RECORD, RECENT
async function loopMatches(matchData, emptyArray, emptyObj, id, flag) {

    let loopLength

    if(flag === "RECORD") loopLength = 20
    else if (flag === "RECENT") loopLength = 10
    else loopLength = 10

    for(let i=0; i<loopLength; i++){

        console.log(`1. ${i}`)

        await new Promise(function(resolve, reject){

            console.log(`2. ${matchData[i].gameId}`)

            request(`${keys.riotUrl}/match/v4/matches/${matchData[i].gameId}?api_key=${keys.riotAPI}`, (error, response, body) => {

                if(error) throw error
    
                if(response.statusCode === 200){
                    const matchDetail = JSON.parse(body)

                    console.log(`3. ${matchDetail.queueId}`)

                    if(matchDetail.queueId === 420 || matchDetail.queueId === 430 || matchDetail.queueId === 440 || matchDetail.queueId === 450){
                        matchDetail.participantIdentities.forEach(participantIdentity => {
                            if(participantIdentity.player.summonerId === id){

                                console.log(`4. ${participantIdentity.player.summonerId}`)

                                const participantId = participantIdentity.participantId

                                console.log(`5. ${participantIdentity.participantId}`)

                                let objIdx
                                const selectedQueueId = (obj) => obj.queueType === matchDetail.queueId

                                matchDetail.participants.forEach(participant => {

                                    const stats = participant.stats

                                    if(participant.participantId === participantId){

                                        console.log(`6. ${participant.participantId}`)
                                        console.log(`7. ${emptyArray}`)

                                        if(flag === "RECORD"){

                                            objIdx = emptyArray.findIndex(selectedQueueId)

                                            console.log(`8. ${objIdx}`)

                                            if(objIdx > -1){

                                                emptyArray[objIdx].cnt++
                                                emptyArray[objIdx].champions.push(participant.championId)
                                                if(stats.win){
                                                    emptyArray[objIdx].win++
                                                }else{
                                                    emptyArray[objIdx].losses++
                                                }
                                                
                                                emptyArray[objIdx].kill+=stats.kills
                                                emptyArray[objIdx].death+=stats.deaths
                                                emptyArray[objIdx].assist+=stats.assists
                                                emptyArray[objIdx].damageInTeam+=convertUtil.getDealtRank(matchDetail,participantId,false)
                                                emptyArray[objIdx].damageInAll+=convertUtil.getDealtRank(matchDetail,participantId,true)

                                                console.log(`9. ${participant.championId}`)
                                                resolve()
                                            }else resolve()

                                        }else if(flag === "RECENT"){

                                            emptyObj = {}

                                            emptyObj.queueType = matchDetail.queueId
                                            emptyObj.championId = participant.championId
                                            emptyObj.gameDuration = matchDetail.gameDuration

                                            emptyObj.win = stats.win
                                            emptyObj.kill = stats.kills
                                            emptyObj.death = stats.deaths
                                            emptyObj.assist = stats.assists
                                            emptyObj.damageInTeam = convertUtil.getDealtRank(matchDetail,participantId,false)
                                            emptyObj.damageInAll = convertUtil.getDealtRank(matchDetail,participantId,true)

                                            emptyObj.spell1Id = participant.spell1Id
                                            emptyObj.spell2Id = participant.spell2Id
                                            emptyObj.item0 = stats.item0
                                            emptyObj.item1 = stats.item1
                                            emptyObj.item2 = stats.item2
                                            emptyObj.item3 = stats.item3
                                            emptyObj.item4 = stats.item4
                                            emptyObj.item5 = stats.item5
                                            emptyObj.item6 = stats.item6
                                            emptyObj.perkPrimaryStyle = stats.perkPrimaryStyle
                                            emptyObj.perkSubStyle = stats.perkSubStyle
                                            emptyObj.perk0 = stats.perk0
                                            emptyObj.perk1 = stats.perk1
                                            emptyObj.perk2 = stats.perk2
                                            emptyObj.perk3 = stats.perk3
                                            emptyObj.perk4 = stats.perk4
                                            emptyObj.perk5 = stats.perk5
                                            emptyObj.statPerk0 = stats.statPerk0
                                            emptyObj.statPerk1 = stats.statPerk1
                                            emptyObj.statPerk2 = stats.statPerk2

                                            emptyArray.push(emptyObj)
                                            console.log(`8. ${emptyObj}`)
                                            resolve()
                                            
                                        }else resolve()

                                    }

                                })
                            }
                            
                        })
                    }
                }else{
                    console.log(`Problem Detected : ${response.statusCode}`)
                }
            })
        })
    }
    
}

async function drawRecentCanvas(canvas, recentArray, profileIconId, name){

    console.log(`9. ${profileIconId} ${name}`)

    // ctx (context) will be used to modify a lot of the canvas
    const ctx = canvas.getContext('2d')

    ctx.beginPath()
    ctx.fillRect(0, 0, 700, 100 + (225*10))

    // Since the image takes time to load, you should await it
    // const background = await Canvas.loadImage('./dragontail/img/bg/A6000000.png')
    const profileicon = await Canvas.loadImage(`${keys.riotCdn}/img/profileicon/${profileIconId}.png`)

    // This uses the canvas dimensions to stretch the image onto the entire canvas
    // ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
    ctx.drawImage(profileicon, 25, 25, 50, 50)

    // Select the font size and type from one of the natively available fonts
    ctx.font = '30px sans-serif'
    // Select the style that will be used to fill the text in
    ctx.fillStyle = '#ffffff'
    ctx.textBaseline = "middle"

    // Actually fill the text with a solid color
    ctx.fillText(name, 100, 50, 500)
    ctx.lineWidth = 5

    for(let i=0; i<recentArray.length; i++){

        await new Promise(async function(resolve, reject){

            ctx.beginPath()
            console.log(`10. ${recentArray[i].win}`)
            ctx.strokeStyle = recentArray[i].win ? "blue" : "red"
            ctx.rect(10,90+(i*225)+5,680,215)
            ctx.stroke()

            console.log(`${keys.riotCdn}/img/champion/${convertUtil.getChampionImage(convertUtil.getChampionName(recentArray[i].championId))}`)
            ctx.drawImage(await Canvas.loadImage(`${keys.riotCdn}/img/champion/${convertUtil.getChampionImage(convertUtil.getChampionName(recentArray[i].championId))}`), 25,100+(i*225),50,50)

            console.log(`${keys.riotCdn}/img/spell/${convertUtil.getSummonerSpellImage(recentArray[i].spell1Id)}`)
            ctx.drawImage(await Canvas.loadImage(`${keys.riotCdn}/img/spell/${convertUtil.getSummonerSpellImage(recentArray[i].spell1Id)}`),100,100+(i*225),50,50)

            console.log(`${keys.riotCdn}/img/spell/${convertUtil.getSummonerSpellImage(recentArray[i].spell2Id)}`)
            ctx.drawImage(await Canvas.loadImage(`${keys.riotCdn}/img/spell/${convertUtil.getSummonerSpellImage(recentArray[i].spell2Id)}`),175,100+(i*225),50,50)

            // Select the font size and type from one of the natively available fonts
            ctx.font = '25px sans-serif'

            ctx.textBaseline = "bottom"
            ctx.fillText(`${convertUtil.getQueueType(recentArray[i].queueType)} ${convertUtil.secondTimeFormatter(recentArray[i].gameDuration)}    K/D/A : ${recentArray[i].kill}/${recentArray[i].death}/${recentArray[i].assist}`, 250, 100+(i*225)+25, 450)
            
            ctx.textBaseline = "top"
            ctx.fillText(`딜량 : 팀내 ${recentArray[i].damageInTeam}/5등 전체 ${recentArray[i].damageInAll}/10등`, 250, 100+(i*225)+25, 450)

            console.log(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(recentArray[i].perkPrimaryStyle,0,true)}`)
            if(recentArray[i].perkPrimaryStyle !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(recentArray[i].perkPrimaryStyle,0,true)}`),25,175+(i*225),50,50)

            console.log(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(recentArray[i].perkPrimaryStyle,recentArray[i].perk0,false)}`)
            if(recentArray[i].perk0 !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(recentArray[i].perkPrimaryStyle,recentArray[i].perk0,false)}`),100,175+(i*225),50,50)

            console.log(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(recentArray[i].perkPrimaryStyle,recentArray[i].perk1,false)}`)
            if(recentArray[i].perk1 !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(recentArray[i].perkPrimaryStyle,recentArray[i].perk1,false)}`),175,175+(i*225),50,50)

            console.log(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(recentArray[i].perkPrimaryStyle,recentArray[i].perk2,false)}`)
            if(recentArray[i].perk2 !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(recentArray[i].perkPrimaryStyle,recentArray[i].perk2,false)}`),250,175+(i*225),50,50)

            console.log(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(recentArray[i].perkPrimaryStyle,recentArray[i].perk3,false)}`)
            if(recentArray[i].perk3 !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(recentArray[i].perkPrimaryStyle,recentArray[i].perk3,false)}`),325,175+(i*225),50,50)

            console.log(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(recentArray[i].perkSubStyle,0,true)}`)
            if(recentArray[i].perkSubStyle !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(recentArray[i].perkSubStyle,0,true)}`),400,175+(i*225),50,50)

            console.log(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(recentArray[i].perkSubStyle,recentArray[i].perk4,false)}`)
            if(recentArray[i].perk4 !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(recentArray[i].perkSubStyle,recentArray[i].perk4,false)}`),475,175+(i*225),50,50)

            console.log(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(recentArray[i].perkSubStyle,recentArray[i].perk5,false)}`)
            if(recentArray[i].perk5 !== 0) ctx.drawImage(await Canvas.loadImage(`${keys.nonVersionCdn}/img/${convertUtil.getRunesImage(recentArray[i].perkSubStyle,recentArray[i].perk5,false)}`),550,175+(i*225),50,50)

            console.log(`${keys.riotCdn}/img/item/${recentArray[i].item0}.png`)
            if(recentArray[i].item0 !== 0 && recentArray[i].item0 <= 6695) ctx.drawImage(await Canvas.loadImage(`${keys.riotCdn}/img/item/${recentArray[i].item0}.png`),25,250+(i*225),50,50)

            console.log(`${keys.riotCdn}/img/item/${recentArray[i].item1}.png`)
            if(recentArray[i].item1 !== 0 && recentArray[i].item1 <= 6695) ctx.drawImage(await Canvas.loadImage(`${keys.riotCdn}/img/item/${recentArray[i].item1}.png`),100,250+(i*225),50,50)

            console.log(`${keys.riotCdn}/img/item/${recentArray[i].item2}.png`)
            if(recentArray[i].item2 !== 0 && recentArray[i].item2 <= 6695) ctx.drawImage(await Canvas.loadImage(`${keys.riotCdn}/img/item/${recentArray[i].item2}.png`),175,250+(i*225),50,50)

            console.log(`${keys.riotCdn}/img/item/${recentArray[i].item3}.png`)
            if(recentArray[i].item3 !== 0 && recentArray[i].item3 <= 6695) ctx.drawImage(await Canvas.loadImage(`${keys.riotCdn}/img/item/${recentArray[i].item3}.png`),250,250+(i*225),50,50)

            console.log(`${keys.riotCdn}/img/item/${recentArray[i].item4}.png`)
            if(recentArray[i].item4 !== 0 && recentArray[i].item4 <= 6695) ctx.drawImage(await Canvas.loadImage(`${keys.riotCdn}/img/item/${recentArray[i].item4}.png`),325,250+(i*225),50,50)

            console.log(`${keys.riotCdn}/img/item/${recentArray[i].item5}.png`)
            if(recentArray[i].item5 !== 0 && recentArray[i].item5 <= 6695) ctx.drawImage(await Canvas.loadImage(`${keys.riotCdn}/img/item/${recentArray[i].item5}.png`),400,250+(i*225),50,50)

            console.log(`${keys.riotCdn}/img/item/${recentArray[i].item6}.png`)
            if(recentArray[i].item6 !== 0 && recentArray[i].item6 <= 6695) ctx.drawImage(await Canvas.loadImage(`${keys.riotCdn}/img/item/${recentArray[i].item6}.png`),475,250+(i*225),50,50)
            
            console.log(`11. ${i}`)
            resolve()
        })

    }

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

                                    return msg.reply(autoMessage["non-info"])
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

                                        return msg.reply(autoMessage["bad-input"])
                                    }
                                    requestUrl = `${keys.riotUrl}/match/v4/matchlists/by-account/${accountId}?queue=${queueId}&endIndex=${endIndex}&beginIndex=0&api_key=${keys.riotAPI}`

                                }else{
                                    const championId = convertUtil.getChampionId(content[3])
                                    // 잘못된 챔피언 이름 입력시
                                    if(typeof championId === "undefined"){
                                        console.log(autoMessage["bad-input"])

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
                                    return msg.reply(autoMessage["bad-input"])
                                }
                                
                                const queueId = convertUtil.getQueueId(content[4])
                                // 잘못된 게임 종류 입력시
                                if(typeof queueId === "undefined"){
                                    console.log(autoMessage["bad-input"])
                                    return msg.reply(autoMessage["bad-input"])
                                }
                                requestUrl = `${keys.riotUrl}/match/v4/matchlists/by-account/${accountId}?champion=${championId}&queue=${queueId}&endIndex=${endIndex}&beginIndex=0&api_key=${keys.riotAPI}`
                            }else{
                                console.log("전적 => " + autoMessage["bad-input"])
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
                                        resolve(JSON.parse(body).matches)
                                    }else{
                                        console.log("전적.검색실패 => " + autoMessage["non-info"])
                                        return msg.reply(autoMessage["non-info"])
                                    }
                                })
                            })

                            getMatchData.then(matchData => {

                                setTimeout(() => {

                                    let iconFlag = true

                                    if(content[2] === "전적"){
                                        loopMatches(matchData,objArr,refObj,id,"RECORD").then(res => {
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

                                                }
                                            })
                                        })
                                    }else if(content[2] === "최근"){
                                        loopMatches(matchData,recentObjArr,recentObj,id,"RECENT").then(async res => {

                                            // Set a new canvas to the dimensions of 700x250 pixels
                                            const canvas = Canvas.createCanvas(700, 100 + (225*10))

                                            drawRecentCanvas(canvas, recentObjArr, profileIconId, name).then(res => {
                                                // Use helpful Attachment class structure to process the file for you
                                                const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'recent-game.png')
                                                msg.channel.send(attachment)
                                            })

                                        })
                                    }

                                }, 1000)

                            })

                        }else{
                            console.log("명령어 입력 => " + autoMessage["bad-input"])
                            return msg.reply(autoMessage["bad-input"])
                        }

                    }else if(response.statusCode === 403){
                        console.log("소환사명 => " + autoMessage["bad-access"])
                        return msg.reply(autoMessage["bad-access"])
                    }else{
                        console.log("소환사명 => " + autoMessage["bad-input"])
                        return msg.reply(autoMessage["bad-input"])
                    }

                })

            }

        }else if(content.startsWith("옵지")){

            tmpMsg = "현재 지원되지 않는 기능입니다.\n"
            return msg.reply(tmpMsg)

            // 모든 공백 1칸으로
            content = content.replace(/ +/g, " ")
            content = content.split(" ")

            if(content.length < 3){
                console.log("메시지 => " + autoMessage["bad-input"])

                msg.author.send(autoMessage["bad-input"])
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
                                
                            })
                        })
            
                    })
            
                })

            }else if(flag === "카운터"){

                if(content.length < 4){
                    console.log("옵지.카운터 => " + autoMessage["bad-input"])
                    msg.author.send(autoMessage["bad-input"])
                }

                const championName = convertUtil.getChampionEnName(content[2])
                const position = posiotionEnName[content[3]]

                if(typeof championName === "undefined" || typeof position === "undefined"){
                    console.log("옵지.카운터 => " + autoMessage["bad-input"])
                    msg.author.send(autoMessage["bad-input"])
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
                                            tmpMsg += `${i+1}위 ${names[i]}\n`
                                        }
                                        driver.close()

                                        msg.author.send(tmpMsg)
                                    })
                    
                                })
                    
                            }))
                            
                        })

                    },1000)

                })
                
            }

        }else{
            console.log("메시지 => " + autoMessage["bad-input"])
            return msg.reply(autoMessage["bad-input"])
        }

    }

})

axios.get(`${properties.middleware}/discord/lolbot.json`)
.then(res => {
    keys = res.data
    client.login(res.data.token)
    .then(toekn => {
        console.log("login success")
    })
}).catch(err => console.log(err))
