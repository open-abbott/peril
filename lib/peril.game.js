module.exports.create = function ( options ) {

    return new Game( options );

};


var Maps = require( "./peril.maps" );
var CQueueFactory = require( "./cqueue" );


function Player( options ) {

    this.client = options.client;
    this.armies = 25;
}


Player.prototype.getID = function () {
    return this.client.getID();
};


Player.prototype.toSerializable = function () {
    return {};
};


function Game( options ) {

    this.options = {
        playerCount: 6
    };

    this.board = Maps.Classic();
    this.playerCount = 0;
    this.clients = {};
    this.players = {};
    this.playerQueue = CQueueFactory.create();
    this.phase = this.Phase.Aquisition;
    this.currentPlayer = null;
    this.defendingPlayer = null;

}


Game.prototype.Phase = {
    Aquisition: 0,
    Deployment: 1,
    Main: 2
};


Game.prototype.addClient = function ( client ) {

    this.clients[client.getID()] = client;

    if ( client.isObserver() || ( this.options.playerCount < this.playerCount ) ) {
        return;
    }

    console.log( "Add a player: " + client.getID() );

    var player = new Player( {
        client: client
    } );
    this.players[client.getID()] = player;
    this.playerQueue.addItem( player );
    ++this.playerCount;

    if ( this.options.playerCount >= this.playerCount ) {
        this.start();
    }

};


Game.prototype.start = function () {

    this.playerQueue.randomize();
    this.step();

};


Game.prototype.step = function () {

    this.currentPlayer = this.playerQueue.next();

    switch ( this.phase ) {
    case this.Phase.Main:
        break;
    case this.Phase.Deployment:
        break;
    case this.Phase.Aquisition:
        break;
    default:
        break;
    }

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
    if ( client.getID() == this.currentPlayer.getID() ) {
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

Game.prototype.isNodeOwner = function ( action, client, node ) {
    if ( node.owner == client.getID() ) {
        return true;
    }

    client.getSocket().emit( "error", {
        action: action,
        message: "Not the node owner."
    } );
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
    n.owner = this.currentPlayer.getID();
    this.currentPlayer.armies--;

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

    if ( 3 <= this.currentPlayer.armies ) {
        n.armies += 3;
        this.currentPlayer.armies -= 3;
    }
    else {
        n.armies += this.currentPlayer.armies;
        this.currentPlayer.armies = 0;
    }

};


Game.prototype.attack = function ( options ) {

    var action = "attack";

    if ( !this.isCurrentPlayer( action, client ) ) {
        return;
    }

    var nodeFrom = this.board.nodes[options.nodeFrom];

    if ( !this.isValidNode( action, nodeFrom ) ) {
        return;
    }

    if ( !this.isNodeOwner( action, client, nodeFrom ) ) {
        return;
    }

    var nodeTo = this.board.nodes[options.nodeTo];

    if ( !this.isValidNode( action, nodeTo ) ) {
        return;
    }


};