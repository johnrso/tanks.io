const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const socketio = require('socket.io');

const Constants = require('../shared/constants');
const Game = require('./game');
const webpackConfig = require('../../webpack.dev.js');

// Setup an Express server
const app = express();
app.use(express.static('public'));

if (process.env.NODE_ENV === 'development') {
  // Setup Webpack for development
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler));
} else {
  // Static serve the dist/ folder in production
  app.use(express.static('dist'));
}

// Listen on port
const port = process.env.PORT || 3000;
const server = app.listen(port);
console.log(`Server listening on port ${port}`);

// Setup socket.io
const io = socketio(server);

// Listen for socket.io connections
io.on('connection', socket => {
  console.log('Player connected!', socket.id);

  socket.on(Constants.MSG_TYPES.JOIN_GAME, joinGame);
  socket.on(Constants.MSG_TYPES.INPUT, handleInput);
  socket.on('disconnect', onDisconnect);
});

// Setup the Game
let games = [];
games[0] = new Game();

function joinGame(username) {
    if(games[games.length - 1].numPlayers == 10){ //assuming 10 is the max number of players
        games[games.length - 1].addPlayer(this, username);
    }else{ //if over max numbers of players, create a new game and add the player to that game
        games.push(new Game());
        games[games.length - 1].addPlayer(this, username);
    }
}

function handleInput(dir) { // need to modify this to accomadate for which game the player is in
    // not sure best way to tackle this
    // naive solution would be to search each game to see if that playerid exists in that game
    // naive solution is super slow 
    // second idea is to create a dictionary of where each playerid is
    // tbh how does the original code take care of this problem? does the socket automatically deal with this?
  game.handleInput(this, dir);
}

function onDisconnect() {
  game.removePlayer(this);
}
