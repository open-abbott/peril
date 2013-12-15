var EChat;
if ( null == EChat ) {
    EChat = {};
}

EChat.ConnectDialog = function ( options ) {
    this._options = {
        connectClick: function () {},
        cssPrefix: "echat"
    };
    $.extend( true, this._options, options );

    this._node = $("<div></div>")
        .addClass( "echat-connect" )
        .addClass( this._options.cssPrefix + "-connect" );

    var self = this;
    var dialog_options = {
        autoOpen: false,
        buttons: [
            {
                text: "Connect",
                click: function () {
                    self._options.connectClick( self );
                    self._node.dialog( "close" );
                }
            }
        ],
        closeOnEscape: false,
        dialogClass: "ui-dialog-no-close",
        draggable: false,
        resizable: false
    };
    this._node.dialog( dialog_options );

    
    this._clientUserPart = $("<textarea></textarea>")
        .appendTo(
            $("<div></div>")
                .appendTo(
                    $("<div></div>")
                        .append( $("<label>User Part</label>") )
                        .appendTo( this._node )
                )
        );
    this._clientEChatPart = $("<textarea></textarea>")
        .appendTo(
            $("<div></div>")
                .appendTo(
                    $("<div></div>")
                        .append( $("<label>Server Part</label>") )
                        .appendTo( this._node )
                )
        );
};

EChat.ConnectDialog.prototype.open = function () {
    this._node.dialog( "open" );
};

EChat.ConnectDialog.prototype.getClient = function () {
    return this._clientUserPart.val();
};
