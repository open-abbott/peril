# PERIL

A game server and client written for Node.js based on the Risk board
game and intended to be played by bots.



## About

A friend of mine enjoys playing the Risk board game with his family.
Being hyper-nerds, we figured it'd be more fun to write bots to play
the game for us.  This project is all about that idea.



## Requirements

- GIT
- Node.js



## Getting Started

1. Clone the repository.

2. From within the repository, run: npm install

4. From within the repository, run: node server.js


### Using the Built-In Client

Create a file in the repository, public/js/custom.js.  Populate
this file with a line to specify the host and port where your server
will respond as in the following example.

```
var PERIL_URL = "http://localhost:9001";
```

The built-in client also supports connecting as an observer.  An
observer client receives game refreshes, but is not allowed to
interact with the game.


## Writing Clients

The repository comes with an interactive client that is served from
the same port that the game server uses to communicate (9001, by
default).

Other clients can (and ideally, should) be written.  The server uses
web sockets to communicate and is based around the
[socket.io](http://socket.io) Javascript library.  Clients could be
written to run within web browsers or just as easily written using
Node.js.



## Events

All events are documented from the stance of the client.  If the event
is of the request type, then the client is doing the requesting.  If
the event is of the response type, the server is doing the responding.


### connect
Type: request

Connect a game client to the server.  The server will respond with
either a connected or disconnected response.

__Payload example__

In this example...
- requested client name/ID is "Fred"
- requested room is "101"
- client wishes to be a player
- if client is first player, it will set max players to 4

```
{
    "id": "Fred",
    "room": "101",
    "observer": false,
    "playerCount": 4
}
```


### connected
Type: response

If the server responds with a connected response, your client is
connected.

__Payload example__

```
{
    "id": "Fred",
    "room": "101"
}
```


### disconnected
Type: response

If the server responds with a disconnected response, your client is
disconnected

__Payload example__

```
{
    "message": "A client already exists with that identity"
}
```


### refresh
Type: request/response

A client may request a refresh event be sent.  Response provides a
snapshot of the game state.  If the client is also a player and the
current player, the player's state will be added to the response.

__Request payload example__

None.

__Response payload examples__

 In the following example, the current player is "player2", and we are
viewing as that player.  This is during the territory aquisition phase
of the game.  "player3" has already claimed South Africa, but Congo is
unclaimed.

```
{
    "nodes": {
        "10": {
            "name": "South Africa",
            "armies": 1,
            "owner": "player3"
        },
        "11": {
            "name": "Congo",
        },
        .
        .
        .
    },
    "phase": "acquiring",
    "currentPlayer": "player2",
    "players": {
        "player1": { "color": "red" },
        "player2": { "color": "blue" },
        "player3": { "color": "yellow" },
        "player4": { "color": "black" }
    },
    "player": {
        "id": "player2",
        "armies": 1,
        "cards": [],
        "startingArmies": 27
    },
    "sequence": 61
}
```


### acquire
Type: request/response

The server will indicate that the client should issue an acquire
event.

_Request payload example_
 If it is the players turn to acquire a territory, the request simply
indicates the ID of the territory to acquire.

```
{
    "node": "11"
}
```

_Response payload example_
None.


### deploy
Type: request/response

The server will indicate that the client should issue a deploy event.


### redeem
Type: request

The client may issue a redeem request to convert cards to armies at
appropriate junctures.


### attack
Type: request

The client may issue an attack request at appropriate junctures.


### defend
Type: request/response

The server will emit a defend event to inform the client that it
should provide a defense event.


### occupy
Type: request/response

Upon successful attack, the server will inform the client that it
should provide an occupy event.


### fortify
Type: request

The client may choose to emit fortify event(s) at the end if its turn.


### endTurn
Type: request

The client should emit an endTurn event when their turn is complete.


### gameOver
Type: response

The server will emit a gameOver event when the game has come to
conclusion.

This may occur when a player-client disconnects or if one
player-client owns all nodes.


### error
Type: response

If the client attempts to perform an action in an invalid way, an
error response will be emitted.
