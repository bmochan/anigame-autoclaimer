//Self-explanatory
//Put all values within " "
const SPAM_CHANNEL_ID = "";
const GRIND_CHANNEL_ID = "";
const LOG_CHANNEL_ID = "";
const ANIGAME_ID = "";
const SERVER_ID = "";

//ON or OFF
let CLIMB_FLOORS = "ON";

//Put as many spammers as you want, each token seperated by a ","
const SPAMMER_TOKENS = [];
const CLAIMER_TOKEN = "";

//Don't touch anything below this, unless you know what you are doing
const { Client } = require('discord.js-selfbot-v13');
const client = new Client({checkUpdate: false}); 

const txtgen = require('txtgen');
const fs = require('fs');
const { waitForDebugger } = require('inspector');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

client.on('ready', async () => {
    console.log(`[CLAIMER] ${client.user.username} is ready!`);
    await spam(SPAM_CHANNEL_ID, SPAMMER_TOKENS);
    await farm(GRIND_CHANNEL_ID);

    if (CLIMB_FLOORS === "ON") {
        console.log("[AUTO-CLIMBER] Floor climbing is active");

    } else {
        console.log("[AUTO-GRINDER] Floor grinding is active");
    };
});

client.on('messageCreate', async message => {
    if (!message.guild) return;
    
    if (message.guild.id === SERVER_ID) {

        if (message.author.id === ANIGAME_ID && message.embeds.length > 0) {
            if (message.embeds[0].title === null) return;
    
            if (CLIMB_FLOORS === "ON") {
                climbFloors(GRIND_CHANNEL_ID, message);
            };
    
            if (message.embeds[0].title.startsWith("**What")) {
          
                let custom_id = message.components[0].components[0].customId;
    
                await sleep(Math.random() * 1.5 * 1000);
                await message.clickButton(custom_id);
    
            } else if (message.embeds[0].title.includes("Challenging")) {
      
                try {
            
                    let custom_id_str = message.components[0].components.filter(btn => btn.emoji.name === "✅")[0];
                    if (custom_id_str === undefined) return;
    
                    let custom_id = custom_id_str.customId;
                    await sleep(Math.random() * 1.5 * 1000);
                    await message.clickButton(custom_id);
                  
                } catch (e) {
                    return console.log(e);
                };
    
            } else if (message.embeds[0].title.startsWith("**Successfully")) {
                const rares = ["Super Rare", "Ultra Rare"];
                
                if (rares.some(rare => message.embeds[0].description.includes(rare))) {
                    let msg = message.embeds[0].description + '\n' + `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;
                    let channel = await client.channels.fetch(LOG_CHANNEL_ID);
    
                    channel.sendTyping();
    
                    await sleep(Math.random() * 1.5 * 1000);
                    channel.send(msg);
                };
    
            };
    
        } else if (message.author.id === ANIGAME_ID) {
            if (message.content.startsWith(`Congratulations fellow summoner <@${client.user.id}>`) && CLIMB_FLOORS === "OFF") {
                message.channel.sendTyping();
              
                await sleep(Math.random() * 1.5 * 1000);
                message.channel.send(".bt all");
            };
        };
    };
});

async function spam(channelID, SPAMMER_TOKENS) {
    if (Array.isArray(SPAMMER_TOKENS) !== true && typeof(channelID) !== "string") return console.log("Correct datatypes were not provided.");
    
    SPAMMER_TOKENS.forEach(token => {
        const spammer = new Client({checkUpdate: false});

        spammer.on('ready', async () => {
            console.log(`[SPAMMER] ${spammer.user.username} is ready!`);
            let channel = await spammer.channels.fetch(channelID);

            setInterval(async () => {
                channel.sendTyping();

                await sleep(((Math.random() * 2.12) * 1000) + ((Math.random() * 1.5) * 1000));
                channel.send(txtgen.sentence());

            }, 4000);
        });

        spammer.login(token);
    });
};

async function farm(grindChannelID) {
    if (CLIMB_FLOORS === "ON") return;
    
    const channel = await client.channels.fetch(grindChannelID);
    
    setInterval(async () => {
        let data;
        
        try {
            data = fs.readFileSync("time.txt", "utf8");
    
        } catch (e) {
            data = null;
        };
      
        if (data === "" || data === null) {
            fs.writeFileSync("time.txt", Date.now().toString());
          
        } else {
            let last = parseInt(data);
    
            if (Date.now() - last >= 3600000) {    
                channel.sendTyping();
    
                await sleep(((Math.random() * 2.12) * 1000) + ((Math.random() * 1.5) * 1000));
                channel.send(".hourly");
                channel.sendTyping();
    
                await sleep(4000 + (Math.random() * 1.3 * 1000));
                channel.send(".bt all");
                fs.writeFileSync("time.txt", Date.now().toString());
            };
        };
      
    }, 10000);
};

async function climbFloors(grindChannelID, message) {

    if (message.embeds[0].title === "Error ⛔" && message.embeds[0].author.name === client.user.username && message.channel.id === GRIND_CHANNEL_ID && message.embeds[0].description.includes("this floor is not accessible")) {
        CLIMB_FLOORS = "OFF";
        
        let channel = await client.channels.fetch(LOG_CHANNEL_ID);
        channel.sendTyping();
        
        await sleep(Math.random() * 1.5 * 1000);
        channel.send(`[AUTO-CLIMBER] Auto floor climbing has been turned off temporarily since you cleared all floors in the area. Change your location to a new area or disable floor climbing.`);
        
        client.user.battleOngoing = undefined;
        farm(grindChannelID);
        return console.log("[AUTO-GRINDER] Floor grinding is now active");
    };
  
    if (client.user.battleOngoing === undefined || client.user.battleOngoing === false) {

        client.user.battleOngoing = false;
        
        let channel = await client.channels.fetch(grindChannelID);
        channel.sendTyping();

        client.user.battleOngoing = true;
        await sleep(Math.random() * 1.5 * 1000);
        channel.send('.bt');

        const filter = m => m.author.id === ANIGAME_ID && m.embeds.length > 0 && m.channel.id === grindChannelID && m.embeds[0].title.startsWith("**__Challenging Floor");
        channel.awaitMessages({ filter, max: 1, time: 60_000, errors: ['time'] })
            .then(() => {
                console.log('[AUTO-CLIMBER] Received battle message');
            })
            .catch(() => {
                client.user.battleOngoing = false;
            });

    } else if (client.user.battleOngoing === true) {
        if (message.channel.id === grindChannelID && message.embeds[0].title.startsWith("**Victory") && message.embeds[0].author.name === client.user.username) {
            message.channel.sendTyping();

            await sleep(Math.random() * 1.5 * 1000);
            message.channel.send(".fl n");
            client.user.battleOngoing = false;

        } else if (message.channel.id === grindChannelID && message.embeds[0].title.startsWith("**Defeated") && message.embeds[0].author.name === client.user.username) {
            CLIMB_FLOORS = "OFF";

            let channel = await client.channels.fetch(LOG_CHANNEL_ID);
            channel.sendTyping();

            await sleep(Math.random() * 1.5 * 1000);
            channel.send(`[AUTO-CLIMBER] Auto floor climbing has been turned off temporarily since you were defeated. Change your current card to a stronger one or disable floor climbing.`);

            client.user.battleOngoing = undefined;
            console.log("[AUTO-GRINDER] Floor grinding is now active");
        };
    };
};

client.login(CLAIMER_TOKEN);
