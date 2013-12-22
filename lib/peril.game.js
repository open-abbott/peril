module.exports.create = function ( options ) {

    return new Game( options );

};


var Maps = require( "./peril.maps" );
var CQueueFactory = require( "./cqueue" );
var Deck = require( "./peril.deck" );
var Player = require( "./peril.player" );


function Game( options ) {

    console.log( "Creating new game: " + JSON.stringify( options || {} ) );

    this.options = {
        playerCount: options.playerCount || 6
    };

    this.board = Maps.Classic();
    this.edges = this.buildEdges();

    this.playerCount = 0;
    this.clients = {};
    this.players = {};
    this.playerQueue = CQueueFactory.create();

    this.turn = null;
    this.deck = Deck.create();

    this.phase = Game.Phase.WaitingForPlayers;

    this.colors = [
        "brown",
        "green",
        "black",
        "yellow",
        "blue",
        "red"
    ];

}


Game.Phase = {
    WaitingForPlayers: "waiting",
    Aquisition:        "acquiring",
    Placement:         "placing",
    Main:              "main",
    Finished:          "finished"
};


Game.prototype.addEdge = function ( edges, from, to ) {
    var edge = edges[from];
    if ( null == edge ) {
        edge = edges[from] = {};
    }
    edge[to] = true;
};


Game.prototype.buildEdges = function () {

    var edges = {};

    for ( var i = 0; i < this.board.edges.length; ++i ) {

        var a = this.board.edges[i][0];
        var b = this.board.edges[i][1];

        this.addEdge( edges, a, b );

        if ( !this.board.directed ) {
            this.addEdge( edges, b, a );
        }

    }

    return edges;

};


Game.prototype.addClient = function ( client ) {

    this.clients[ client.getID() ] = client;

    if (    Game.Phase.Finished == this.phase
         || client.isObserver()
         || ( this.options.playerCount < this.playerCount ) ) {
        return;
    }

    console.log( "Add a player: " + client.getID() );

    var player = Player.create( {
        client: client,
        playerCount: this.options.playerCount,
        color: this.colors.pop()
    } );
    this.players[ client.getID() ] = player;
    this.playerQueue.addItem( player );
    ++this.playerCount;

    console.log( this.options.playerCount + ":" + this.playerCount );

    if ( this.options.playerCount <= this.playerCount ) {
        this.start();
    }

};


Game.prototype.removeClient = function ( client ) {

    delete this.clients[ client.getID() ];

    if ( null == this.players[ client.getID() ] ) {
        return;
    }

    this.gameOver( {
        disconnect: client.getID()
    } );

};


Game.prototype.initiateAcquire = function () {

    var free_space = false;

    for ( var id in this.board.nodes ) {
        if ( null == this.board.nodes[id].owner ) {
            free_space = true;
            break;
        }
    }

    if ( !free_space ) {
        this.phase = Game.Phase.Placement;
        return this.initiatePlacement();
    }

    this.turn.player.startingArmies--;
    this.turn.player.armies++;
    this.refresh( this.turn.player.client );
    this.turn.player.emit( "acquire" );

};


Game.prototype.initiatePlacement = function () {

    var remaining_armies = false;

    for ( var i = 0; i < this.playerQueue.array.length; ++i ) {

        if ( 0 != this.playerQueue.array[i].armies ) {
            remaining_armies = true;
            break;
        }
        
    }

    if ( !remaining_armies ) {
        this.phase = Game.Phase.Main;
        this.playerQueue.reset();
        return this.nextTurn();
    }

    this.turn.player.startingArmies--;
    this.turn.player.armies++;
    this.turn.player.emit( "deploy", {
        armies: this.turn.player.armies
    } );

};


Game.prototype.initiateTurn = function () {

    this.turn.player.allocateArmies( this.board );

    // card redemption happens first

    this.turn.player.emit( "deploy", {
        armies: this.turn.player.armies
    } );

};


Game.prototype.nextTurn = function () {

    this.turn = {
        player: this.playerQueue.next()
    };

    this.refresh();

    switch ( this.phase ) {
    case Game.Phase.Main:
        return this.initiateTurn();
        break;
    case Game.Phase.Aquisition:
        return this.initiateAcquire();
        break;
    case Game.Phase.Placement:
        return this.initiatePlacement();
        break;
    case Game.Phase.WaitingForPlayers:
        break;
    default:
        console.log( "ERROR: Invalid game phase entered." );
        break;
    }

};


Game.prototype.start = function () {
    console.log( "Starting game" );
    this.playerQueue.randomize();
    this.phase = Game.Phase.Aquisition;
    this.nextTurn();
};


Game.prototype.playing = function ( client ) {
    return null != this.players[client.getID()];
}


Game.prototype.participating = function ( client ) {
    return null != this.clients[client.getID()];
};


Game.prototype.toSerializable = function ( client ) {

    var payload = {
        nodes: this.board.nodes,
        phase: this.phase,
        currentPlayer: ( this.turn && this.turn.player && this.turn.player.getID() ) || null
    };

    payload.players = {};
    for ( var key in this.players ) {
        payload.players[key] = {
            color: this.players[key].getColor()
        };
    }

    if ( null != client && this.playing( client ) ) {
        payload.player = this.players[client.getID()].toSerializable();
    }

    console.log( "Game.players: " + JSON.stringify( Object.keys( this.players ) ) );
    console.log( "Game.clients: " + JSON.stringify( Object.keys( this.clients ) ) );
    console.log( "Game.toSerializable: " + JSON.stringify( Object.keys( payload ) ) );

    return payload;

};


Game.prototype.refresh = function ( client ) {

    if ( null == client ) {

        for ( var id in this.clients ) {
            this.refresh( this.clients[id] );
        }

        return;
    }

    if ( !this.participating( client ) ) {
        return;
    }

    client.getSocket().emit( "refresh", this.toSerializable( client ) );

};


Game.prototype.isCurrentPlayer = function ( action, client ) {

    if ( null == this.turn || null == this.turn.player ) {
        return false;
    }

    if ( client.getID() == this.turn.player.getID() ) {
        return true;
    }

    client.getSocket().emit( "error", {
        action: action,
        message: "You are not the current player."
    } );

    return false;

};


Game.prototype.isValidNode = function ( action, node ) {

    if ( null != node ) {
        return true;
    }

    client.getSocket().emit( "error", {
        action: action,
        message: "Invalid node specified."
    } );

    return false;

};


Game.prototype.isNodeOwner = function ( action, client, node, noError ) {

    if ( node.owner == client.getID() ) {
        return true;
    }

    if ( !noError ) {
        client.getSocket().emit( "error", {
            action: action,
            message: "Not the node owner."
        } );
    }

    return false;

};


Game.prototype.acquire = function ( client, node ) {

    var action = "acquire";

    if ( !this.isCurrentPlayer( action, client ) ) {
        return;
    }

    var n = this.board.nodes[node];

    if ( !this.isValidNode( action, n ) ) {
        return;
    }

    if ( 0 < n.armies ) {
        return this.turn.player.emit( "error", {
            action: "acquire",
            message: "Node already owned."
        } );
    }

    n.armies = 1;
    n.owner = this.turn.player.getID();
    this.turn.player.armies--;

    this.nextTurn();

};


Game.prototype.deploy = function ( client, node, armies ) {

    var action = "deploy";

    if ( !this.isCurrentPlayer( action, client ) ) {
        return;
    }

    var n = this.board.nodes[node];

    if ( !this.isValidNode( action, n ) ) {
        return;
    }

    if ( !this.isNodeOwner( action, client, n ) ) {
        return;
    }

    if ( this.turn.player.armies > armies ) {
        this.turn.player.armies -= armies;
        n.armies += armies;
        this.refresh();
        
        return this.turn.player.emit( action, {
            armies: this.turn.player.armies
        } );
    }

    n.armies += this.turn.player.armies;
    this.turn.player.armies = 0;
    this.refresh();

    if ( Game.Phase.Placement == this.phase ) {
        return this.nextTurn();
    }

    this.turn.player.emit( "attack" );

};


Game.prototype.attack = function ( options ) {

    var action = "attack";

    if ( !this.isCurrentPlayer( action, options.client ) ) {
        return;
    }

    var nodeFrom = this.board.nodes[options.nodeFrom];

    if ( !this.isValidNode( action, nodeFrom ) ) {
        return;
    }

    if ( !this.isNodeOwner( action, options.client, nodeFrom ) ) {
        return;
    }

    var nodeTo = this.board.nodes[options.nodeTo];

    if ( !this.isValidNode( action, nodeTo ) ) {
        return;
    }

    var noError = true;

    if ( this.isNodeOwner( action, options.client, nodeTo, noError ) ) {
        return;
    }

    if ( null == this.edges[options.nodeFrom][options.nodeTo] ) {
        return this.turn.player.emit( "error", {
            action: action,
            message: "No edge between from and to nodes."
        } );
    }

    if ( 1 > options.diceCount || nodeFrom.armies < options.diceCount + 1 ) {
        return this.turn.player.emit( "error", {
            action: action,
            message: "Invalid attack dice count."
        } );
    }

    this.turn.battle = {
        attacker: this.turn.player,
        defender: this.players[nodeTo.owner],
        nodeFrom: nodeFrom,
        nodeTo: nodeTo,
        attackDice: options.diceCount,
        defendDice: 1
    };

    this.refresh();

    this.turn.battle.defender.emit( "defend", {
        from: options.nodeFrom,
        to: options.nodeTo,
        dice: options.diceCount
    } );

};


Game.prototype.rollDie = function () {
    return Math.round( Math.random() * 5 ) + 1;
};


Game.prototype.grantCard = function () {
    this.turn.player.addCard( this.deck.draw() );
    this.turn.grantedCard = true;
};


Game.prototype.resolveBattle = function ( options ) {
    var my = this;

    var entry = {
        attackers: this.turn.battle.nodeFrom.armies,
        attack: [],
        defend: [],
        defenders: this.turn.battle.nodeTo.armies
    };

    for ( var i = 0; i < this.turn.battle.attackDice; ++i ) {
        entry.attack.push( my.rollDie() );
    }

    for ( var i = 0; i < this.turn.battle.defendDice; ++i ) {
        entry.defend.push( my.rollDie() );
    }

    var numerically = function ( a, b ) {
        return b - a;
    };
    entry.attack.sort( numerically );
    entry.defend.sort( numerically );

    for ( var i = 0; i < entry.attack.length; ++i ) {
        if ( null == entry.defend[i] ) {
            break;
        }
        if ( entry.attack[i] > entry.defend[i] ) {
            this.turn.battle.nodeTo.armies--;
        }
        else {
            this.turn.battle.nodeFrom.armies--;
        }
    }

    this.refresh();

    if ( 0 == this.turn.battle.nodeTo.armies ) {
        this.turn.battle.attacker.emit( "occupy", {
            from: this.turn.battle.nodeFrom,
            to: this.turn.battle.nodeTo
        } );

        this.turn.grantCard = true;
    }
};


Game.prototype.defend = function ( options ) {

    if ( null == this.turn.battle ) {
        return options.client.getSocket().emit( "error", {
            action: "defend",
            message: "No battle to defend in."
        } );
    }

    if ( this.turn.battle.defender.getID() != options.client.getID() ) {
        return options.client.getSocket().emit( "error", {
            action: "defend",
            message: "Not the current defender."
        } );
    }

    if (                    2 < options.diceCount
         ||                 1 > options.diceCount
         || options.diceCount > this.turn.battle.nodeTo.armies ) {
        return options.client.getSocket().emit( "error", {
            action: "defend",
            message: "Invalid number of defense dice."
        } );
    }

    this.turn.battle.defendDice = options.diceCount;
    this.resolveBattle();

};


Game.prototype.occupy = function ( options ) {

    var action = "occupy";

    if ( !this.isCurrentPlayer( action, options.client ) ) {
        return;
    }

    var nodeFrom = this.board.nodes[options.nodeFrom];

    if ( !this.isValidNode( action, nodeFrom ) ) {
        return;
    }

    if ( !this.isNodeOwner( action, options.client, nodeFrom ) ) {
        return;
    }

    var nodeTo = this.board.nodes[options.nodeTo];

    if ( !this.isValidNode( action, nodeTo ) ) {
        return;
    }

    if ( !this.isNodeOwner( action, options.client, nodeTo ) ) {
        return;
    }

    if ( 1 > options.armies || options.armies >= nodeFrom.armies ) {
        return this.turn.player.emit( "error", {
            action: action,
            message: "Invalid army count specified." 
        } );
    }

    nodeFrom.armies -= options.armies;
    nodeTo.armies = options.armies;
    this.turn.battle = null;

    this.refresh();

};


Game.prototype.fortify = function ( options ) {
    this.nextTurn();
};


Game.prototype.determineVictor = function ( exclude ) {

    var players = {};

    for ( var id in this.board.nodes ) {
        var owner = this.board.nodes[id].owner;

        if ( null == owner ) {
            continue;
        }

        if ( null == players[ owner ] ) {
            players[ owner ] = 0;
        }
        players[ owner ]++;
    }    

    var ranked = [];

    for ( var id in players ) {
        ranked.push( {
            id: id,
            score: players[id]
        } );
    }

    var by_score = function ( a, b ) {
        return a.score > b.score;
    };

    ranked.sort( by_score );

    var top = ranked.pop();

    if ( top.id == exclude ) {
        top = ranked.pop();
    }

    return top.id;

};


Game.prototype.gameOver = function ( payload, client ) {

    this.phase = Game.Phase.Finished;

    if ( null == payload ) {
        payload = {
            message: "Game complete."
        };
    }

    if ( null == client ) {

        payload.victor = this.determineVictor( payload.disconnect );

        for ( var id in this.clients ) {
            this.gameOver( payload, this.clients[id] );
        }

        return;
    }

    console.log( "Game over sent to " + client.getID() + ": " + JSON.stringify( payload ) );

    client.getSocket().emit( "gameOver", payload );    

};
