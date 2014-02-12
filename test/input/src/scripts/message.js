//
define(function(require) {'use strict';
    var message = {
        m1: _tr("ключ"),

        m2: _trc("ключ", "к разгадке чего-либо"),
        m3: _trc("ключ", "ключ воды, приток реки"),

        translateKeys: function(count) {
            return _trn("ключ|ключа|ключей", count);
        },

        translateClues: function(count) {
            return _trnc("ключ|ключа|ключей", count, "к разгадке чего-либо");
        },

        translateFeeder: function(count) {
            return _trnc("ключ|ключа|ключей", count, "ключ воды, приток реки");
        },

        m4: _tr("корова")
    };

    return message;
});
