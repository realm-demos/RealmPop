'use strict';

//
// imports
//

var fs = require('fs');
var Realm = require('realm');

var { Token } = require('./token.js');
var { Pop } = require('./pop-event-handler');
var { Server } = require('./server.js');
var { Board, ScoreRecord } = require('./board.js');

//
// parse command line arguments
//
global.print = function (line) { console.log('[pop] ' + line); }

const args = process.argv.slice(2);

if (args.length < 6) {
  print("start the pop server app with 6 parameters like so:\n  node pop.js [IP] [PORT] [ADMIN_TOKEN_PATH] [ACCESS_TOKEN_PATH] [CREDENTIALS_PATH] [BOARD_HTML_FILE]");
  process.exit(1);
}

const config = {
  host: args[0],
  port: args[1]
};

const token = new Token();
token.load('admin', args[2]);
token.load('access', args[3]);
token.load('credentials', args[4]);

// Set up score board 
Board.targetFilePath = args[5];
Board.updateHtmlFile();

// authorize ROS
Realm.Sync.setAccessToken(token.get('access'));
Realm.Sync.setLogLevel('error');

//
// initialize and start the Pop app 🚀
//

let server = new Server(config, token.get('admin'), token.get('credentials'));
server.start();

let pop = new Pop(config, token.get('credentials'));
pop.connect(token.get('admin'));
pop.didUpdateAvailability = server.didUpdateAvailability;
