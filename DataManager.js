var ThirtyMinutes = 0.0208333;

function DataManager() {
    
    this.data = {};
    this.parsedData = {};

}

DataManager.prototype.getCookie = function (name) {
    if (document.cookie.length > 0) {
        var s = document.cookie.indexOf(name + '=');
        if (s != -1) {
            s = s + name.length + 1;
            var e = document.cookie.indexOf(';', s);
            if (e == -1) { e = document.cookie.length; }
            this.data[name] = unescape(document.cookie.substring(s, e));
        }
    }
};

DataManager.prototype.hasData = function (key) {
    return (key in this.data);
};

DataManager.prototype.objToStr = function (val, id) {
    var str = ['&' + id + '='];
    if (val && val.constructor === Array) {
        for (var i = 0; i < val.length; i++) {
            str.push(val[i].time);
            str.push('|');
            str.push(val[i].data);
            if (i < val.length - 1) {
                str.push('|');
            }
        }
    }
    return str.join('');
};

DataManager.prototype.saveCookie = function (name, value, expires, path, domain, secure) {
    var exdate = new Date();
    if (expires) {
        exdate.setTime(exdate.getTime() + (expires * 24 * 60 * 60 * 1000));
    }
    var curCookie = name + "=" + value +
        ((expires) ? "; expires=" + exdate.toGMTString() : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");
    document.cookie = curCookie;
};

DataManager.prototype.getChip = function (name, chip, storageSystem) {
    var parsed = this.getParsedData(name, storageSystem);
    if (parsed) {
        return this.parsedData[name][chip];
    }
    return;
};

DataManager.prototype.saveChip = function (name, chip, value, expires, path, storageSystem) {
    var parsed = this.getParsedData(name, storageSystem);
    if (!parsed) {
        // don't have the [cookie] - create
        this.parsedData[name] = {};
    }

    // set the chip
    this.parsedData[name][chip] = value;


    // (re)compose the parsed data and save
    this.saveData(name, this.composeData(name), expires, path, storageSystem);
};

// helper to convert parsed data back to a string
DataManager.prototype.composeData = function (data) {
    var parsed;

    if (typeof data === 'string') {
        // data is the *name* of the cookie
        if (!(data in this.parsedData)) return;
        parsed = this.parsedData[data];
    }
    else {
        // data is just the data to be composed
        parsed = data;
    }

    var composed = [];
    for (var chip in parsed) {
        composed.push(chip + '=' + parsed[chip]);
    }
    return composed.join('&');
};

DataManager.prototype.getParsedData = function (name, storageSystem) {
    if ( !(name in this.parsedData) ) {
        this.getData(name, storageSystem);
    }
    if (name in this.parsedData)
        return this.parsedData[name];
    return;
};

DataManager.prototype.getData = function (name, storageSystem) {
    try {
        if (typeof (storageSystem) == 'undefined')  {
            return this.getCookie(name);
        } else {
            if (storageSystem.getItem(name) !== null) {
                this.data[name] = storageSystem[name];
            }
        }
    } catch (e) {
        return this.getCookie(name);
    }

    if (name in this.data) {
        this.parsedData[name] = {};
        var c = this.data[name].toString().split('&');
        var ca = [];
        for (var i = 0; i < c.length; i++) {
            ca = c[i].split('=');
            this.parsedData[name][ca[0].toLowerCase()] = ca[1];
        }
    }

    return this.data[name];
};

DataManager.prototype.saveData = function (name, value, expires, path, storageSystem) {

        if (!path || path == null) {
            path = '/';
        }
        
        if ((storageSystem == sessionStorage) && (typeof (expires) == 'undefined' || expires == null)) {
            expires = ThirtyMinutes;
        }

        try {
            if (typeof (localStorage) == 'undefined') {
                this.saveCookie(name, value, expires, path);
            } else {
                try {
                    storageSystem.setItem(name, value);
                } catch (e) {
                    this.saveCookie(name, value, expires, path);
                }
            }
        } catch (e) {
            this.saveCookie(name, value, expires, path);
        }
    }

module.exports = DataManager;