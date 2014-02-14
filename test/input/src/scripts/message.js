//
define(function(require) {'use strict';
    var message = {
        m1: _tr("ключ"),

        m2: _trc("ключ", "к разгадке чего-либо"),
        m3: _trc("ключ", "ключ воды, приток реки"),

        translateKeys: function(count) {
            return _trn("ключ", count);
        },

        translateClues: function(count) {
            return _trnc("ключ", count, "к разгадке чего-либо");
        },

        translateFeeder: function(count) {
            return _trnc("ключ", count, "ключ воды, приток реки");
        },

        m4: _tr("корова"),

        m5: {
            '1': _tr("Красивый лиловый шар, наполненный водородом."),
            '2': _trn("Красивый лиловый шар, наполненный водородом.", 534)
        },

        // Достаточно только "засветить" системные ключи,
        // которые могут использоваться, например,
        // в качестве статусов ответов API,
        // системных сообщений, ...
        // а далее их перевод при "рендеренге"
        // -- не надо "морочиться" с локализацией данных констант на бэкенде
        system: [
            _tr("SYSTEM_ERROR"),
            _tr("STATUS_OK"),
            _tr("STATUS_ERROR")
        ]
    };

    return message;
});
