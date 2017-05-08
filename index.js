'use strict'

const sqlite3 = require('sqlite3')
  .verbose();
const pg = require('pg');
const sentiment = require('sentiment');
// const readline = require('readline');
const Discord = require('discord.js');
const client = new Discord.Client();
const argv = require('yargs')
  .usage('Usage: $0 [options]')
  .alias('t', 'token')
  .nargs('t', 1)
  .describe('t', 'Discord bot token')
  .alias('h', 'host')
  .nargs('h', 1)
  .describe('h', 'Database hostname')
  .alias('u', 'user')
  .nargs('u', 1)
  .describe('u', 'Database username')
  .alias('d', 'database')
  .nargs('d', 1)
  .describe('d', 'Database name')
  .demandOption(['t', 'h', 'u', 'd'])
  .help()
  .argv;

let config = {
  host: argv.host,
  user: argv.user,
  database: argv.database
};

let db = new pg.Client(config);

db.connect((err) => {
  if (err)
    throw err;

  db.query(`CREATE TABLE IF NOT EXISTS message (
        ts TIMESTAMPTZ NOT NULL,
        username TEXT NOT NULL,
        positive TEXT[],
        negative TEXT[],
        score INTEGER NOT NULL,
        comparative NUMERIC NOT NULL)`, (err, result) => {
    if (err)
      throw err;

    client.on('message', message => {
      insert(db, message.author.username + '#' + message.author.discriminator, message.content);
    });

    client.login(argv.token);

  });
});

function insert(db, username, message) {
  let s = sentiment(message);
  if (s.words.length > 0) {
    db.query(`INSERT INTO message VALUES(NOW(), $1, $2, $3, $4, $5)`, [username, s.positive, s.negative, s.score, s.comparative]);
  }
}

process.on('SIGINT', () => {
  db.end((err) => {
    if (err)
      throw err;
    process.exit();
  });
});

// var rl = readline.createInterface({input: process.stdin, output: process.stdout});
//
// rl.on('line', (input) => {
//   insert(input);
// });
//
// rl.on('close', () => {
//   stmt.finalize();
//   db.close();
// })
