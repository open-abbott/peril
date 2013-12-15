var EChat;
if ( null == EChat ) {
    EChat = {};
}

EChat.ListControl = function ( options ) {
    this._options = {
    };
    $.extend( true, this._options, options );

    this._node = $("<div></div>")
        .addClass( "echat-listcontrol" )
        .addClass( this._options.cssPrefix + "-listcontrol" );

    this._container = $("<div></div>")
        .appendTo( this._node );

    if ( null != this._options.cssClass ) {
        this._node.addClass( this._options.cssClass );
    }

    this._bottomAligned = false;
    this._items = [];
};

EChat.ListControl.prototype.addItem = function ( content_node ) {
    this._items.push(
        new EChat.ListControl.ListItem(
            this._container,
            content_node,
            this._options
        )
    );
    if ( this._bottomAligned ) {
        this.bottomAlign();
    }
    return this;
};

EChat.ListControl.prototype.clear = function () {
    var item;
    while ( item = this._items.pop() ) {
        item.remove();
    }
    return this;
};

EChat.ListControl.prototype.appendTo = function ( node ) {
    this._node.appendTo( $(node) );
    return this;
};

EChat.ListControl.prototype.bottomAlign = function () {
    this._bottomAligned = true;
    if ( this._container.height() > this._node.height() ) {
        var delta = this._container.height() - this._node.height();
        this._node.scrollTop( delta );
    }
    return this;
};

EChat.ListControl.ListItem = function ( container, content_node, options ) {
    this._container = container;
    this._content = content_node;

    this._options = {};
    $.extend( true, this._options, options );

    this._node = $("<div></div>")
        .addClass( "echat-listitem" )
        .addClass( this._options.cssPrefix + "-listitem" )
        .append( this._content )
        .appendTo( this._container );
};

EChat.ListControl.ListItem.prototype.appendTo = function ( node ) {
    this._node.appendTo( $(node) );
    return this;
};

EChat.ListControl.ListItem.prototype.remove = function () {
    this._node.remove();
};