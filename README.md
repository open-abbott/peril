# PERIL

A game server and client written for Node.js based on the Risk board game and intended to be played by bots.



## About

A friend of mine enjoys playing the Risk board game with his family.  Being hyper-nerds, we figured it'd be more fun to write bots to play the game for us.  This project is all about that idea.



## Requirements

- GIT
- Node.js



## Getting Started

1. Clone the repository.
2. From within the repository, run: npm install
3. From within the repository, run: node server.js



## Writing Clients

The repository comes with an interactive client that is served from the same port that the game server uses to communicate (9001, by default).

Other clients can (and ideally, should) be written.  The server uses web sockets to communicate and is based around the [socket.io](http://socket.io) Javascript library.  Clients could be written to run within web browsers or just as easily written using Node.js.



## Events

All events are documented from the stance of the client.  If the event is of the request type, then the client is doing the requesting.  If the event is of the response type, the server is doing the responding.


### connect
Type: request

Connect a game client to the server.  The server will respond with either a connected or disconnected response.


### connected
Type: response

If the server responds with a connected response, your client is connected.


### disconnected
Type: response

If the server responds with a disconnected response, your client is disconnected


### refresh
Type: request/response

A client may request a refresh event be sent.  Response provides a snapshot of the game state.


### acquire
Type: request/response

The server will indicate that the client should issue an acquire event.


### deploy
Type: request/response

The server will indicate that the client should issue a deploy event.


### redeem
Type: request

The client may issue a redeem request to convert cards to armies at appropriate junctures.


### attack
Type: request

The client may issue an attack request at appropriate junctures.


### defend
Type: request/response

The server will emit a defend event to inform the client that it should provide a defense event.


### occupy
Type: request/response

Upon successful attack, the server will inform the client that it should provide an occupy event.


### fortify
Type: request

The client may choose to emit fortify event(s) at the end if its turn.


### endTurn
Type: request

The client should emit an endTurn event when their turn is complete.


### gameOver
Type: response

The server will emit a gameOver event when the game has come to conclusion.

This may occur when a player-client disconnects or if one player-client owns all nodes.
