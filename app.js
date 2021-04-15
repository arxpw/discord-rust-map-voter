const config = require('./config.json');

const defaultSeeds = require('./defaults/seeds.json');
const { defaultActivity, defaultStatus } = require('./defaults/bot-status.js')
const { sendErrorMsg } = require('./helpers/errors.js');
const { nextWipe, votingEnds } = require('./helpers/next-wipe.js');
const { monuments, hasMonumentString } = require('./helpers/monuments.js');

const Discord = require('discord.js');
const moment = require('moment');

const client = new Discord.Client();
const prefix = config.prefix; 

const axios = require('axios').default;

let seeds = defaultSeeds;

// amount of random maps chosen
const amountOfMaps = config.maps || 3;

// request
const getMapBySeedAndSize = async (map) => {
  return axios.get(`https://rustmaps.com/api/v2/maps/${map.seed}/${map.size}`)
    .then((response) => response)
    .catch((err) => {
      if(err.response) {
        return err.response;
      }
      return err;
    });
}

client.on('ready', () => {
  console.log(`Bot logged in as: ${client.user.tag}!`);
  client.user.setPresence({
    status: defaultStatus,
    activity: defaultActivity
  }); 
});

client.on('message', async msg => {

  // prefix + permissions
  if (!msg.content.startsWith(prefix)) return;
  if (!msg.member.hasPermission("ADMINISTRATOR")) return;

  // argument and very very basic command logic..
  const args = msg.content.slice(prefix.length).trim().split(' ');
  const isEmptyCommand = args[0] === '';

  const hasArgs = (amount) => args.length === amount;
  const command = (cmd) => args[0] === cmd;

  if (isEmptyCommand) {
    const commands = ['map','seeds'];
    const mappedCommands = commands.map((command) => config.prefix + ' ' + command + '\n').join('');

    msg.channel.send(`**General Commands:**\n${mappedCommands}`);
    return;
  }

  if (args.length <= 2 && command('add-seed')) return sendErrorMsg(msg, 'empty-seed');;

  // seeds
  if (command('seeds')) {
    if (seeds.length === 0) return sendErrorMsg(msg, 'invalid-seed');

    return msg.channel.send(seeds.map(
      (singleSeed, i) => `${i+1}. ${singleSeed.seed}, Size = ${singleSeed.size}`).join("\n")
    );
  }

  // add-seed
  if (command('add-seed') && hasArgs(3)) {
    const seed = args[1];
    const size = args[2];

    const validSeed = seed.length > 0 && seed.length < 24 && !seed.includes('http') && !seed.includes('www') && !seed.includes('!');
    const validSize = size > 100 && size <= 6000;

    if (!validSeed) return sendErrorMsg(msg, 'invalid-seed');
    if (!validSize) return sendErrorMsg(msg, 'invalid-map-size');

    seeds.push({ seed, size });
    msg.channel.send(`Seed added! There are now *${seeds.length} total seeds* for voting. use \`${config.prefix} seeds\` to see them!`);
    return;
  }

  // announce map
  if (command('map')) {
    if (seeds.length === 0) return sendErrorMsg(msg, 'invalid-seed');

    // delete users's original message
    msg.delete();
    const randomSeeds = seeds.sort(() => Math.random() - Math.random()).slice(0, amountOfMaps);

    const responses = await Promise.all(randomSeeds.map((thisSeed) => getMapBySeedAndSize(thisSeed)));
    const mapsFormatted = responses.map((d) => {
      return {
        image: d.data.thumbnailUrl,
        monuments: d.data.monuments.map((e) => e.monument),
        url: d.data.url,
        seed: d.data.seed,
      }
    });

    // announce
    msg.channel.send(
      new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Map Voting')
        .setDescription(`Get started voting for the next map! React with a 👍 to map you want!`)
        .addField('Voting Ends:', votingEnds.calendar())
        .addField('Next Wipe:', nextWipe.calendar())
    );
    
    mapsFormatted.forEach((map, index) => {
      const a = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`Map #${index+1}`)
        .addField('URL', map.url)
        .setImage(map.image);

      monuments.forEach((firstMonument, index) => {
        const even = !(index % 2);

        if (even) {
          const nextMonument = monuments[index+1];
          a.addField(hasMonumentString(map.monuments, firstMonument), hasMonumentString(map.monuments, nextMonument), true);
        }
      });

      msg.channel.send(a)
        .then((message) => message.react('👍'));
    });
  }
});

client.login(config.token);
