module.exports.create = function ( options ) {

    return new Game( options );

};


var Maps = require( "./peril.maps" );
var CQueueFactory = require( "./cqueue" );


function Card( options ) {
    this.node = null;
    this.type = null;
}


function Deck( options ) {
    this.cards = [];
    this.bonus = 4;
}


Deck.prototype.draw = function () {
    return this.cards.pop();
};


Deck.prototype.incrementBonus = function () {
    var bonus = this.bonus;

    if ( 12 < this.bonus ) {
        this.bonus += 5;
    }
    else if ( 10 < this.bonus ) {
        this.bonus += 3;
    }
    else {
        this.bonus += 2;
    }

    return bonus;
};


Deck.prototype.redeem = function ( cards ) {
    var armies = null;

    // if cards are valid, check set
    // if set is valid

    armies = this.incrementBonus();
    return armies;
};


function Player( options ) {

    this.client = options.client;
    this.cards = [];
    this.armies = 0;

    switch ( options.playerCount ) {
    case 3:
        this.armies = 35;
        break;
    case 4:
        this.armies = 30;
        break;
    case 5:
        this.armies = 25;
        break;
    default:
        this.armies = 20;
        break;
    }

}


Player.prototype.getID = function () {
    return this.client.getID();
};


Player.prototype.getSocket = function () {
    return this.client.getSocket();
};


Player.prototype.addCard = function ( card ) {
    this.cards.push( card );
};


Player.prototype.toSerializable = function () {
    return {};
};


Player.prototype.allocateArmies = function ( board ) {
    // nodes/3 rounded down or 3 (whichever greater)
    // cluster bonus
    // redeem cards
};


function Game( options ) {

    this.options = {
        playerCount: 6
    };

    this.board = Maps.Classic();
    this.edges = this.buildEdges();

    this.playerCount = 0;
    this.clients = {};
    this.players = {};
    this.playerQueue = CQueueFactory.create();

    this.turn = null;
    this.deck = new Deck();

    this.phase = Game.Phase.Aquisition;

}


Game.prototype.Phase = {
    Aquisition: 0,
    Main: 1
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

    this.clients[client.getID()] = client;

    if ( client.isObserver() || ( this.options.playerCount < this.playerCount ) ) {
        return;
    }

    console.log( "Add a player: " + client.getID() );

    var player = new Player( {
        client: client,
        totalPlayers: this.options.playerCount
    } );
    this.players[client.getID()] = player;
    this.playerQueue.addItem( player );
    ++this.playerCount;

    if ( this.options.playerCount >= this.playerCount ) {
        this.start();
    }

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
        this.phase = Game.Phase.Main;
        return this.iniateTurn();
    }

    this.turn.player.getSocket.emit( "acquire", {} );

};


Game.prototype.initiateTurn = function () {

    this.turn.player.allocateArmies( this.board );

    this.turn.player.getSocket().emit( "beginTurn", {
        armies: 0
    } );

};


Game.prototype.nextTurn = function () {

    this.turn = {
        player: this.playerQueue.next()
    };

    if ( Game.Phase.Aquisition == this.phase ) {
        return this.initiateAcquire();
    }

    return this.initiateTurn();
};


Game.prototype.start = function () {
    this.playerQueue.randomize();
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
        nodes: this.board.nodes
    };

    if ( null != client && this.playing( client ) ) {
        payload.client = this.players[client.getID()].toSerializable();
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
        return client.getSocket().emit( "error", {
            action: "acquire",
            message: "Node already owned."
        } );
    }

    n.armies = 1;
    n.owner = this.turn.player.getID();
    this.turn.player.armies--;

};


Game.prototype.deploy = function ( client, node ) {

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

    if ( 3 <= this.turn.player.armies ) {
        n.armies += 3;
        this.turn.player.armies -= 3;
    }
    else {
        n.armies += this.turn.player.armies;
        this.turn.player.armies = 0;
    }

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
        return options.client.getSocket().emit( "error", {
            action: action,
            message: "No edge between from and to nodes."
        } );
    }

    if ( 1 > options.diceCount || nodeFrom.armies < options.diceCount + 1 ) {
        return options.client.getSocket().emit( "error", {
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

    this.turn.battle.defender.getSocket().emit( "defend", {
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

    if ( 0 == this.turn.battle.nodeTo.armies ) {
        this.turn.battle.attacker.getSocket().emit( "occupy", {
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
        return options.cient.getSocket().emit( "error", {
            action: action,
            message: "Invalid army count specified." 
        } );
    }

    nodeFrom.armies -= options.armies;
    nodeTo.armies = options.armies;
    this.turn.battle = null;

};


Game.prototype.fortify = function ( options ) {
    this.nextTurn();
};
