L.U.Icon = L.DivIcon.extend({
    initialize: function(map, options) {
        this.map = map;
        var default_options = {
            iconSize: null,  // Made in css
            iconUrl: this.map.getDefaultOption('iconUrl'),
            feature: null
        };
        options = L.Util.extend({}, default_options, options);
        L.Icon.prototype.initialize.call(this, options);
        this.feature = this.options.feature;
        if (this.feature && this.feature.isReadOnly()) {
            this.options.className += ' readonly';
        }
    },

    _getIconUrl: function (name) {
        var url;
        if(this.feature && this.feature._getIconUrl(name)) url = this.feature._getIconUrl(name);
        else url = this.options[name + 'Url'];
        return this.formatUrl(url, this.feature);
    },

    _getColor: function () {
        var color;
        if(this.feature) color = this.feature.getOption('color');
        else if (this.options.color) color = this.options.color;
        else color = this.map.getDefaultOption('color');
        return color;
    },

    formatUrl: function (url, feature) {
        return L.Util.greedyTemplate(url || '', feature ? feature.extendedProperties() : {});
    }

});

L.U.Icon.Default = L.U.Icon.extend({
    default_options: {
        iconAnchor: new L.Point(16, 40),
        popupAnchor: new L.Point(0, -40),
        tooltipAnchor: new L.Point(16, -24),
        className: 'umap-div-icon'
    },

    initialize: function(map, options) {
        options = L.Util.extend({}, this.default_options, options);
        L.U.Icon.prototype.initialize.call(this, map, options);
    },

    _setColor: function() {
        var color = this._getColor();
        this.elements.container.style.backgroundColor = color;
        this.elements.arrow.style.borderTopColor = color;
    },

    createIcon: function() {
        this.elements = {};
        this.elements.main = L.DomUtil.create('div');
        this.elements.container = L.DomUtil.create('div', 'icon_container', this.elements.main);
        this.elements.arrow = L.DomUtil.create('div', 'icon_arrow', this.elements.main);
        var src = this._getIconUrl('icon');
        if (src) {
            // An url.
            if (src.indexOf('http') === 0 || src.indexOf('/') === 0 || src.indexOf('data:image') === 0) {
                this.elements.img = L.DomUtil.create('img', null, this.elements.container);
                this.elements.img.src = src;
            } else {
                this.elements.span = L.DomUtil.create('span', null, this.elements.container)
                this.elements.span.textContent = src;
            }
        }
        this._setColor();
        this._setIconStyles(this.elements.main, 'icon');
        return this.elements.main;
    }

});

L.U.Icon.Circle = L.U.Icon.extend({
    initialize: function(map, options) {
        var default_options = {
            iconAnchor: new L.Point(6, 6),
            popupAnchor: new L.Point(0, -6),
            tooltipAnchor: new L.Point(6, 0),
            className: 'umap-circle-icon'
        };
        options = L.Util.extend({}, default_options, options);
        L.U.Icon.prototype.initialize.call(this, map, options);
    },

    _setColor: function() {
        this.elements.main.style.backgroundColor = this._getColor();
    },

    createIcon: function() {
        this.elements = {};
        this.elements.main = L.DomUtil.create('div');
        this.elements.main.innerHTML = '&nbsp;';
        this._setColor();
        this._setIconStyles(this.elements.main, 'icon');
        return this.elements.main;
    }

});

L.U.Icon.CircleMed = L.U.Icon.Circle.extend({
    initialize: function(map, options) {
        var default_options = {
            iconAnchor: new L.Point(12, 12),
            popupAnchor: new L.Point(0, -12),
            tooltipAnchor: new L.Point(13, 5),
            className: 'umap-circle-icon-medium'
        };
        options = L.Util.extend({}, default_options, options);
        L.U.Icon.prototype.initialize.call(this, map, options);
    }
});

L.U.Icon.CircleBig = L.U.Icon.Circle.extend({
    initialize: function(map, options) {
        var default_options = {
            iconAnchor: new L.Point(16, 16),
            popupAnchor: new L.Point(0, -16),
            tooltipAnchor: new L.Point(24, 8),
            className: 'umap-circle-icon-big'
        };
        options = L.Util.extend({}, default_options, options);
        L.U.Icon.prototype.initialize.call(this, map, options);
    }
});


L.U.Icon.Drop = L.U.Icon.Default.extend({
    default_options: {
            iconAnchor: new L.Point(16, 42),
            popupAnchor: new L.Point(0, -42),
            tooltipAnchor: new L.Point(16, -24),
            className: 'umap-drop-icon'
    }
});




L.U.Icon.Triangle = L.U.Icon.Default.extend({
    default_options: {
            iconAnchor: new L.Point(8, 21),
            popupAnchor: new L.Point(0, -21),
            tooltipAnchor: new L.Point(8, -12),
            className: 'umap-triangle-icon',
            fontClassName: 'umap-font-triangle umap-icon-small'
    },

    _setColor: function() {
        var color = this._getColor();
        this.elements.container.style.color = color;
        this.elements.arrow.style.borderTopColor = color;
    },

    createIcon: function() {
        this.elements = {};
        this.elements.main = L.DomUtil.create('div');
        this.elements.container = L.DomUtil.create('div', 'icon_container', this.elements.main);
        this.elements.arrow = L.DomUtil.create('div', 'icon_arrow', this.elements.main);
        this.elements.span = L.DomUtil.create('span', this.options.fontClassName, this.elements.container)
        this._setColor();
        this._setIconStyles(this.elements.main, 'icon');
        return this.elements.main;
    }
});

L.U.Icon.DropMed = L.U.Icon.Triangle.extend({
    default_options: {
            iconAnchor: new L.Point(16, 42),
            popupAnchor: new L.Point(0, -42),
            tooltipAnchor: new L.Point(16, -24),
            className: 'umap-drop-med-icon',
            fontClassName : 'umap-font-drop umap-icon-default'
    }
});

L.U.Icon.DropSm = L.U.Icon.Triangle.extend({
    default_options: {
            iconAnchor: new L.Point(10, 32),
            popupAnchor: new L.Point(0, -32),
            tooltipAnchor: new L.Point(10, -24),
            className: 'umap-drop-sm-icon',
            fontClassName : 'umap-font-drop umap-icon-medium'
    }
});

L.U.Icon.Vollwegweiser =  L.U.Icon.Triangle.extend({
    default_options: {
            iconAnchor: new L.Point(8, 21),
            popupAnchor: new L.Point(0, -21),
            tooltipAnchor: new L.Point(8, -12),
            className: 'umap-vollwegweiser-icon',
            fontClassName : 'umap-font-vollwegweiser umap-icon-small'
    }
});

L.U.Icon.Tafel =  L.U.Icon.Triangle.extend({
    default_options: {
            iconAnchor: new L.Point(8, 21),
            popupAnchor: new L.Point(0, -21),
            tooltipAnchor: new L.Point(8, -12),
            className: 'umap-tafel-icon',
            fontClassName : 'umap-font-tafel umap-icon-small'
 
    }

});


L.U.Icon.Ball = L.U.Icon.Default.extend({
    default_options: {
            iconAnchor: new L.Point(8, 30),
            popupAnchor: new L.Point(0, -28),
            tooltipAnchor: new L.Point(8, -23),
            className: 'umap-ball-icon'
    },

    createIcon: function() {
        this.elements = {};
        this.elements.main = L.DomUtil.create('div');
        this.elements.container = L.DomUtil.create('div', 'icon_container', this.elements.main);
        this.elements.arrow = L.DomUtil.create('div', 'icon_arrow', this.elements.main);
        this._setColor();
        this._setIconStyles(this.elements.main, 'icon');
        return this.elements.main;
    },

    _setColor: function() {
        var color = this._getColor('color'),
            background;
        if (L.Browser.ielt9) {
            background = color;
        }
        else if (L.Browser.webkit) {
            background = '-webkit-gradient( radial, 6 38%, 0, 6 38%, 8, from(white), to(' + color + ') )';
        }
        else {
            background = 'radial-gradient(circle at 6px 38% , white -4px, ' + color + ' 8px) repeat scroll 0 0 transparent';
        }
        this.elements.container.style.background = background;
    }

});

var _CACHE_COLOR = {};
L.U.Icon.Cluster = L.DivIcon.extend({
    options: {
        iconSize: [40, 40]
    },

    initialize: function (datalayer, cluster) {
        this.datalayer = datalayer;
        this.cluster = cluster;
    },

    createIcon: function () {
        var container = L.DomUtil.create('div', 'leaflet-marker-icon marker-cluster'),
            div = L.DomUtil.create('div', '', container),
            span = L.DomUtil.create('span', '', div),
            backgroundColor = this.datalayer.getColor();
        span.textContent = this.cluster.getChildCount();
        div.style.backgroundColor = backgroundColor;
        return container;
    },

    computeTextColor: function (el) {
        var color,
            backgroundColor = this.datalayer.getColor();
        if (this.datalayer.options.cluster && this.datalayer.options.cluster.textColor) {
            color = this.datalayer.options.cluster.textColor;
        }
        if (!color) {
            if (typeof _CACHE_COLOR[backgroundColor] === 'undefined') {
                color = L.DomUtil.TextColorFromBackgroundColor(el);
                _CACHE_COLOR[backgroundColor] = color;
            } else {
                color = _CACHE_COLOR[backgroundColor];
            }
        }
        return color;
    }

});
