var EChat;
if ( null == EChat ) {
    EChat = {};
}

EChat.ChatPane = function ( options ) {
    this._options = {
        cssPrefix: "echat",
        sendClick: function () {}
    };
    $.extend( true, this._options, options );
    
    this._node = $("<div></div>")
        .addClass( "echat-chatpane" )
        .addClass( this._options.cssPrefix + "-chatpane" );

    this.clientList = $("<div></div>")
        .addClass( "echat-clientlist" )
        .addClass( this._options.cssPrefix + "-clientlist" )
        .appendTo( this._node );

    var message_log_options = {
        cssPrefix: this._options.cssPrefix,
        cssClass: "echat-messagelog"
    };
    this.messageLog = new EChat.ListControl( message_log_options )
        .appendTo( this._node )
        .bottomAlign();

    this.whoAmI = $("<div></div>")
        .addClass( "echat-whoami" )
        .addClass( this._options.cssPrefix + "-whoami" )
        .appendTo( this._node );

    this.editBox = new EChat.ChatPane.EditBox( this, {} )
        .appendTo( this._node );

    this.sendButton = new EChat.ChatPane.SendButton( this, {} )
        .appendTo( this._node );

    this.identity = null;
};

EChat.ChatPane.prototype._addMessage = function ( client, message, about ) {
    var message = $("<div></div>")
        .addClass( "echat-log-message" )
        .addClass( this._options.cssPrefix + "-log-message" )
        .text( message );

    if ( null != about ) {
        message.append(
            $("<div></div>")
                .addClass( "echat-log-about" )
                .addClass( this._options.cssPrefix + "-log-about" )
                .css( "background-image", "url(/identicon/" + about + ")" )
        );
    }

    var item = $("<div></div>")
        .append(
            $("<div></div>")
                .addClass( "echat-log-client" )
                .addClass( this._options.cssPrefix + "-log-client" )
                .css( "background-image", "url(/identicon/" + client + ")" )
        )
        .append( message );

    this.messageLog.addItem( item );
};

EChat.ChatPane.prototype.update = function ( data ) {
    if ( "message" == data.action ) {
        this._addMessage( data.client, data.payload.message );
    }
    else if ( "connect" == data.action ) {
        this._addMessage( data.client, "connected.", data.payload.client );
    }
    else if ( "disconnect" == data.action ) {
        this._addMessage( data.client, "disconnected.", data.payload.client );
    }
};

EChat.ChatPane.prototype.refreshClients = function ( data ) {
    var self = this;
    this.clientList.empty();
    $.each(
        data,
        function ( key, value ) {
            var node = $("<div></div>")
                .addClass( "echat-client" )
                .addClass( self._options.cssPrefix + "-client" )
                .css( "background-image", "url(/identicon/" + key + ")" );
            self.clientList.append( node );
        }
    );
};

EChat.ChatPane.prototype.identify = function ( data ) {
    this.identity = data;
    var node = $("<div></div>")
        .css( "background-image", "url(/identicon/" + this.identity.client + ")" )
        .appendTo( this.whoAmI );
};

EChat.ChatPane.prototype.appendTo = function ( node ) {
    this._node.appendTo( $(node) );
    return this;
};

EChat.ChatPane.prototype.reset = function () {
    this.identity = null;
    this.whoAmI.css( "background-image", "" );
    this.clientList.empty();
    this.messageLog.clear();
};

EChat.ChatPane.SendButton = function ( pane, options ) {
    var self = this;

    this._pane = pane;

    this._options = {};
    $.extend( true, this._options, options );

    this._node = $("<div></div>")
        .addClass( "echat-sendbutton" )
        .addClass( this._options.cssPrefix + "-sendbutton" );

    this._buffer = $("<div></div>")
        .appendTo( this._node );

    this._input = $("<input/>")
        .attr( "type", "button" )
        .val( "Send" )
        .appendTo( this._buffer )
        .click(
            function () {
                self._pane._options.sendClick( self._pane );
                self._pane.editBox.clear();
                self._pane.editBox.focus();
            }
        );
};

EChat.ChatPane.SendButton.prototype.click = function () {
    this._input.focus().click();
    return this;
};

EChat.ChatPane.SendButton.prototype.appendTo = function ( node ) {
    this._node.appendTo( $(node) );
    return this;
};

EChat.ChatPane.EditBox = function ( pane, options ) {
    this._pane = pane;

    this._options = {};
    $.extend( true, this._options, options );

    this._node = $("<div></div>")
        .addClass( "echat-editbox" )
        .addClass( this._options.cssPrefix + "-editbox" );

    this._buffer = $("<div></div>")
        .appendTo( this._node );

    var self = this;
    this._input = $("<textarea></textarea>")
        .keypress(
            function ( event ) {
                if (    13 != event.which
                     || event.altKey
                     || event.ctrlKey
                     || event.shiftKey
                     || event.metaKey ) {
                    return;
                }
                event.preventDefault();
                $(this).blur();
                self._pane.sendButton.click();
            }
        )
        .appendTo( this._buffer );
};

EChat.ChatPane.EditBox.prototype.clear = function () {
    this._input.val( "" );
    return this;
};

EChat.ChatPane.EditBox.prototype.focus = function () {
    this._input.focus();
    
    return this;
};

EChat.ChatPane.EditBox.prototype.val = function ( value ) {
    if ( 0 == arguments.length ) {
        return this._input.val();
    }
    return this._input.val( value );
};

EChat.ChatPane.EditBox.prototype.appendTo = function ( node ) {
    this._node.appendTo( $(node) );
    return this;
};
