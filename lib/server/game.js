'use strict'

const deckFactory = require('./card-deck')
const events = require('./events')
const maps = require('./maps')
const playerFactory = require('./player')
const shufflingQueue = require('./shuffling-queue')

class Game {

    static Phase = Object.freeze({
        WaitingForPlayers: 'waiting',
        Aquisition: 'acquiring',
        Placement: 'placing',
        Main: 'main',
        Finished: 'finished'
    })

    constructor(options) {

        console.log("Creating new game: " + JSON.stringify(options || {}))

        this.options = {
            playerCount: options.playerCount || 6
        }

        this.callbacks = options.callbacks
        this.emitter = options.room.emitter
        this.board = maps.getClassic()
        this.edges = this.buildEdges()

        this.playerCount = 0
        this.clients = {}
        this.players = {}
        this.playerQueue = shufflingQueue.create()

        this.turn = null
        this.deck = deckFactory.create()

        this.phase = Game.Phase.WaitingForPlayers
        this.colors = [ 'brown', 'green', 'black', 'yellow', 'blue', 'red' ]
    }

    addEdge(edges, from, to) {
        let edge = edges[from]
        if (null == edge) {
            edge = edges[from] = {}
        }
        edge[to] = true;
    }

    buildEdges() {
        const edges = {}
        this.board.edges.forEach(edge => {
            const a = edge[0]
            const b = edge[1]
            this.addEdge(edges, a, b)
            if (!this.board.directed) {
                this.addEdge(edges, b, a)
            }
        })
        return edges
    }

    addClient(client) {

        this.clients[client.getID()] = client

        if (Game.Phase.Finished === this.phase
            || client.isObserver()
            || (this.options.playerCount < this.playerCount)) {
            return
        }

        console.log(`Add a player: ${client.getID()}`)

        const player = playerFactory.create({
            game: this,
            client: client,
            playerCount: this.options.playerCount,
            color: this.colors.pop()
        });
        this.players[client.getID()] = player
        this.playerQueue.addItem(player)
        ++this.playerCount

        console.log(this.options.playerCount + ":" + this.playerCount)

        if (this.options.playerCount <= this.playerCount) {
            this.start()
        }

    }

    removeClient(client) {

        delete this.clients[client.getID()]

        if (null == this.players[client.getID()]) {
            return
        }

        if (Game.Phase.Finished === this.phase) {
            return
        }

        this.gameOver({
            disconnect: client.getID()
        })

    }

    initiateAcquire() {

        let free_space = false

        for (var id in this.board.nodes) {
            if (null == this.board.nodes[id].owner) {
                free_space = true
                break
            }
        }

        if (!free_space) {
            this.phase = Game.Phase.Placement
            this.refresh(this.turn.player.client)
            return this.initiatePlacement()
        }

        this.turn.player.startingArmies--
        this.turn.player.armies++
        this.refresh(this.turn.player.client)
        this.turn.player.emit(events.acquire)

    }

    initiatePlacement() {

        let remaining_armies = false

        for (var i = 0; i < this.playerQueue.array.length; ++i) {
            if (0 < this.playerQueue.array[i].startingArmies) {
                remaining_armies = true
                break
            }
        }

        if (!remaining_armies) {
            this.phase = Game.Phase.Main
            this.playerQueue.reset()
            return this.nextTurn()
        }

        this.turn.player.startingArmies--
        this.turn.player.armies++
        this.refresh(this.turn.player.client)
        this.turn.player.emit(events.deploy, {
            armies: this.turn.player.armies
        })

    }

    initiateTurn() {

        // card redemption happens first

        this.turn.player.allocateArmies(this.board)
        this.refresh(this.turn.player.client)

        this.turn.player.emit(events.deploy, {
            armies: this.turn.player.armies
        })

    }

    nextTurn() {

        this.turn = {
            player: this.playerQueue.next()
        }

        this.refresh()

        console.log("nextTurn (" + this.turn.player.getID() + "), " + this.phase);

        switch (this.phase) {
            case Game.Phase.Main:
                return this.initiateTurn()
                break
            case Game.Phase.Aquisition:
                return this.initiateAcquire()
                break
            case Game.Phase.Placement:
                return this.initiatePlacement()
                break
            case Game.Phase.WaitingForPlayers:
                break
            default:
                console.log("ERROR: Invalid game phase entered.")
                break
        }

    }

    start() {
        console.log('Starting game')
        this.playerQueue.randomize()
        this.phase = Game.Phase.Aquisition
        this.nextTurn()
    }

    playing(client) {
        return null != this.players[client.getID()]
    }

    participating(client) {
        return null != this.clients[client.getID()]
    }

    toSerializable(client) {

        const payload = {
            nodes: this.board.nodes,
            phase: this.phase,
            currentPlayer: (this.turn && this.turn.player && this.turn.player.getID()) || null
        }

        payload.players = {}
        for (var key in this.players) {
            payload.players[key] = {
                color: this.players[key].getColor()
            }
        }

        if (null != client && this.playing(client)) {
            payload.player = this.players[client.getID()].toSerializable()
        }

        return payload

    }

    refresh(client) {

        if (null == client) {
            for (var id in this.clients) {
                this.refresh(this.clients[id])
            }
            return
        }

        if (!this.participating(client)) {
            console.log('Refreshing non-participating client')
            return
        }

        console.log('Refreshing client: ' + client.getID())
        this.emitter.emit(
            client.getSocket(),
            events.refresh,
            this.toSerializable(client)
        )

    }

    isCurrentPlayer(action, client) {

        if (null == this.turn || null == this.turn.player) {
            return false
        }

        if (client.getID() === this.turn.player.getID()) {
            return true
        }

        // probably need some DoS protection here
        this.emitter.emit(
            client.getSocket(),
            'error',
            {
                action: action,
                message: 'Not the current player'
            }
        )

        return false

    }

    isValidNode(action, node) {

        if (null != node) {
            return true
        }

        this.emitter.emit(
            client.getSocket(),
            "error",
            {
                action: action,
                message: 'Invalid node specified'
            }
        )

        return false;

    }

    isNodeOwner(action, client, node, noError) {

        if (node.owner === client.getID()) {
            return true
        }

        if (!noError) {
            this.emitter.emit(
                client.getSocket(),
                "error",
                {
                    action: action,
                    message: 'Not the node owner'
                }
            )
        }

        return false

    }

    acquire(client, node) {

        if (!this.isCurrentPlayer(events.acquire, client)) {
            return
        }

        var n = this.board.nodes[node];

        if (!this.isValidNode(events.acquire, n)) {
            return
        }

        if (0 < n.armies) {
            return this.turn.player.emit('error', {
                action: events.acquire,
                message: 'Node already owned'
            });
        }

        n.armies = 1;
        n.owner = this.turn.player.getID()
        this.turn.player.armies--

        this.nextTurn()

    }

    deploy(client, node, armies) {

        if (!this.isCurrentPlayer(events.deploy, client)) {
            return
        }

        const n = this.board.nodes[node]

        if (!this.isValidNode(events.deploy, n)) {
            return
        }

        if (!this.isNodeOwner(events.deploy, client, n)) {
            return;
        }

        if (this.turn.player.armies > armies) {
            this.turn.player.armies -= armies
            n.armies += armies
            this.refresh()

            return this.turn.player.emit(events.deploy, {
                armies: this.turn.player.armies
            })
        }

        n.armies += this.turn.player.armies;
        this.turn.player.armies = 0
        this.refresh()

        if (Game.Phase.Placement === this.phase) {
            return this.nextTurn()
        }

        this.turn.player.emit(events.attack)

    }

    attack(options) {

        if (!this.isCurrentPlayer(events.attack, options.client)) {
            return
        }

        // error if undeployed armies

        const nodeFrom = this.board.nodes[options.nodeFrom];

        if (!this.isValidNode(events.attack, nodeFrom)) {
            return
        }

        if (!this.isNodeOwner(events.attack, options.client, nodeFrom)) {
            return
        }

        const nodeTo = this.board.nodes[options.nodeTo]

        if (!this.isValidNode(events.attack, nodeTo)) {
            return
        }

        let noError = true

        if (this.isNodeOwner(events.attack, options.client, nodeTo, noError)) {
            return
        }

        if (null == this.edges[options.nodeFrom][options.nodeTo]) {
            return this.turn.player.emit('error', {
                action: events.attack,
                message: "No edge between from and to nodes"
            })
        }

        if (1 > options.diceCount || nodeFrom.armies < options.diceCount + 1) {
            return this.turn.player.emit('error', {
                action: events.attack,
                message: "Invalid attack dice count"
            })
        }

        this.turn.battle = {
            attacker: this.turn.player,
            defender: this.players[nodeTo.owner],
            nodeFrom: nodeFrom,
            nodeTo: nodeTo,
            attackDice: options.diceCount,
            defendDice: 1
        }

        this.refresh()

        this.turn.battle.defender.emit(events.defend, {
            from: options.nodeFrom,
            to: options.nodeTo,
            dice: options.diceCount
        })

    }

    rollDie() {
        return Math.round(Math.random() * 5) + 1
    }

    grantCard() {
        this.turn.player.addCard(this.deck.draw())
        this.turn.grantedCard = true
    }

    onePlayerRemaining() {

        const players = {}

        for (var id in this.board.nodes) {
            var owner = this.board.nodes[id].owner

            if (null == owner) {
                continue
            }

            if (null == players[owner]) {
                players[owner] = 0
            }
            players[owner]++
        }

        const playerCount = Object.keys(players).length
        return 1 === playerCount;

    }

    resolveBattle(options) {

        var my = this

        var entry = {
            attackers: this.turn.battle.nodeFrom.armies,
            attack: [],
            defend: [],
            defenders: this.turn.battle.nodeTo.armies
        }

        for (var i = 0; i < this.turn.battle.attackDice; ++i) {
            entry.attack.push(my.rollDie())
        }

        for (var i = 0; i < this.turn.battle.defendDice; ++i) {
            entry.defend.push(my.rollDie())
        }

        var numerically = function (a, b) {
            return b - a
        }
        entry.attack.sort(numerically)
        entry.defend.sort(numerically)

        for (var i = 0; i < entry.attack.length; ++i) {
            if (null == entry.defend[i]) {
                break
            }
            if (entry.attack[i] > entry.defend[i]) {
                this.turn.battle.nodeTo.armies--
            }
            else {
                this.turn.battle.nodeFrom.armies--
            }
        }

        this.refresh()

        if (0 === this.turn.battle.nodeTo.armies) {
            this.turn.battle.nodeTo.owner = this.turn.battle.nodeFrom.owner

            if (this.onePlayerRemaining()) {
                return this.gameOver()
            }

            this.turn.battle.attacker.emit(events.occupy, {
                from: this.turn.battle.nodeFrom,
                to: this.turn.battle.nodeTo
            })

            this.turn.grantCard = true
        }
    }

    defend(options) {

        if (null == this.turn.battle) {
            return this.emitter.emit(
                options.client.getSocket(),
                'error',
                {
                    action: events.defend,
                    message: 'No battle to defend in'
                }
            )
        }

        if (this.turn.battle.defender.getID() !== options.client.getID()) {
            return this.emitter.emit(
                options.client.getSocket(),
                'error',
                {
                    action: events.defend,
                    message: 'Not the current defender'
                }
            )
        }

        if (2 < options.diceCount
            || 1 > options.diceCount
            || options.diceCount > this.turn.battle.nodeTo.armies) {
            return this.emitter.emit(
                options.client.getSocket(),
                'error',
                {
                    action: events.defend,
                    message: 'Invalid number of defense dice'
                }
            )
        }

        this.turn.battle.defendDice = options.diceCount
        this.resolveBattle()

    }

    occupy(options) {

        if (!this.isCurrentPlayer(events.occupy, options.client)) {
            return;
        }

        const nodeFrom = this.board.nodes[options.nodeFrom];

        if (!this.isValidNode(events.occupy, nodeFrom)) {
            return
        }

        if (!this.isNodeOwner(events.occupy, options.client, nodeFrom)) {
            return
        }

        const nodeTo = this.board.nodes[options.nodeTo]

        if (!this.isValidNode(events.occupy, nodeTo)) {
            return
        }

        if (!this.isNodeOwner(events.occupy, options.client, nodeTo)) {
            return
        }

        if (1 > options.armies || options.armies >= nodeFrom.armies) {
            return this.turn.player.emit('error', {
                action: events.occupy,
                message: 'Invalid army count specified'
            })
        }

        nodeFrom.armies -= options.armies
        nodeTo.armies = options.armies
        this.turn.battle = null

        this.refresh()

    }

    fortify(options) {
        // error if armies are left undeployed
    }

    endTurn(options) {
        // error if armies are left undeployed
        // grant card if necessary
        this.nextTurn()
    }

    determineVictor(exclude) {

        const players = {}

        for (var id in this.board.nodes) {
            var owner = this.board.nodes[id].owner

            if (null == owner) {
                continue
            }

            if (null == players[owner]) {
                players[owner] = 0
            }
            players[owner]++
        }

        var ranked = []

        for (var id in players) {
            ranked.push({
                id: id,
                score: players[id]
            })
        }

        var by_score = function (a, b) {
            return a.score > b.score;
        }

        ranked.sort(by_score)

        var top = ranked.pop()

        console.log("Excluding " + exclude + ", remaining players: " + ranked.length)
        if (1 > ranked.length) {
            return null
        }

        if (top.id === exclude) {
            top = ranked.pop()
        }

        return top.id

    }

    endGame() {
        return this.callbacks.endGame && this.callbacks.endGame.call()
    }

    gameOver(payload, client) {

        this.phase = Game.Phase.Finished

        if (null == payload) {
            payload = {
                message: 'Game complete'
            }
        }

        if (null == client) {

            payload.victor = this.determineVictor(payload.disconnect);

            var clients = []
            for (var id in this.clients) {
                clients.push(this.clients[id])
            }

            var c
            while (c = clients.pop()) {
                this.gameOver(payload, c)
            }

            this.endGame()
            return
        }

        console.log("Game over sent to " + client.getID() + ": " + JSON.stringify(payload))

        this.emitter.emit(
            client.getSocket(),
            'gameOver',
            payload
        )
        client.getSocket().disconnect()
        delete this.clients[client.getID()]

    }

}

module.exports = {
    create: (options) => {
        return new Game(options)
    }
}
