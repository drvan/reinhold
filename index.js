const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('reinhold.db');
const sentiment = require('sentiment');
const readline = require('readline');
let stmt;

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS message (
          timestamp TEXT NOT NULL,
          user TEXT NOT NULL,
          positive TEXT,
          negative TEXT,
          score INT NOT NULL,
          comparative REAL NOT NULL)`);

  stmt = db.prepare("INSERT INTO message VALUES(DATETIME('NOW'), ?, ?, ?, ?, ?)");
});

var rl = readline.createInterface({input: process.stdin, output: process.stdout});

rl.on('line', (input) => {
  insert(input);
});

rl.on('close', () => {
  stmt.finalize();
  db.close();
})

function insert(message) {
  let s = sentiment(message);
  stmt.run('Arc', s.positive.join(','), s.negative.join(','), s.score, s.comparative);
}
