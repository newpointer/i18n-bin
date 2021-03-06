# nullpointer-i18n

> Модуль скриптов интернационализации.

Извлечение ключей перевода из исходных файлов.

Формирование файла ключей перевода POT, файлов перевода PO ([http://en.wikipedia.org/wiki/Gettext](http://en.wikipedia.org/wiki/Gettext)).

Формирование JSON-бандла переводов для использования в сторонних компонентах, например:

[nullpointer-i18n-js](https://github.com/newpointer/i18n-js/blob/master/docs/i18n.md)

[nullpointer-i18n-java](https://github.com/newpointer/i18n-java/blob/master/docs/i18n.md)

## Философия

Использование в качестве ключей для перевода естественный язык, например, русский.

Поддержка контекста перевода, например,
перевод слова _ключ_ в английском языке может быть различным в зависимости от контекста:

_clue_ - ключ к разгадке чего-либо, путеводная нить, улика;

_feeder_ - приток реки, канал.

Поддержка форм множественного числа.

Простые сигнатуры функций:

    // простой перевод
    _tr("ключ");
    _tr("Красивый лиловый шар, наполненный водородом.");

    // перевод с контекстом
    _trc("ключ", "к разгадке чего-либо");

    // простой перевод с формами множественного числа
    _trn("ключ", 123);
    _trn("Красивый лиловый шар, наполненный водородом.", ballCount);

    // перевод с контекстом и с формами множественного числа
    _trnc("ключ", 321, "к разгадке чего-либо");

    // трансляция "системных ключей"
    _tr("SYSTEM_ERROR");

Унифицированный перевод как в коде, так и в шаблонах.

Поддержка файлов "системных ключей", в которых каждая строка является ключом для простого перевода.

Ключи в файле "системных ключей" должны быть `C-style` строками и располагаться по одному в строке.

Пустые строки и строки начинающиеся с символа `#` игнорируются.

Пример файла ключей:

#### system.keys

    #
    # Однострочный комментарий
    #
    SYSTEM_ERROR
    STATUS_OK
    STATUS_ERROR

    Многострочный \nключ
    Ключ содержащий символ \" (двойная кавычка)

## Использование

### Окружение

* node.js 0.10.x+
* npm 1.3.x+
* msgmerge [GNU 'gettext' utilities](https://www.gnu.org/software/gettext/manual/html_node/msgmerge-Invocation.html)

### Установка

    npm install git+ssh://git@repo.nkb:nullpointer/i18n-bin.git

### Импорт

    // Импорт
    var build = require('nullpointer-i18n-bin');

### Сборка i18n

    build.run(options, callback);

    options: {
        // Режим работы:
        // signature (по умолчанию) - сбор ключей из сигнатур функций перевода _tr, _trc, _trn, _trnc
        // simple - сбор ключей из текстового файла, в котором каждая строка является ключом для простого перевода
        mode: 'signature',

        // Паттерн для поиска файлов (glob), из которых надо извлекать ключи
        pattern: '**/*.+(js|ftl|html)',

        // Путь к директории исходных файлов (где собирать ключи)
        inputDir: '../src',

        // Путь к корню директории исходных файлов
        // Относительно данного пути будут записанны источники ключей в результатах
        inputRootPath: '/projects/myprojects',

        // Путь к директории, в которой будут сформированы POT-файл и PO-файлы перевода
        outputDir: '../i18n/po',

        // Путь к директории, в которой будет сформирован бандл перевода
        bundleDir: '../i18n/bundle',

        // Базовый язык - язык ключей перевода
        baseLang: 'ru',

        // Языки перевода
        langs: ['ru', 'en']
    }

    callback - будет вызван по завершению сборки

### Функции перевода в исходных файлах

#### JavaScript

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

#### Шаблоны

    <div>
        <p>${_tr("ключ")}</p>

        <p>${_trc("ключ", "к разгадке чего-либо")}</p>
        <p>${_trc("ключ", "ключ воды, приток реки")}</p>

        <p>0 ${_trn("ключ", 0)}</p>
        <p>1 ${_trn("ключ", 1)}</p>
        <p>2 ${_trn("ключ", 2)}</p>
        <p>5 ${_trn("ключ", 5)}</p>

        <p>0 ${_trnc("ключ", 0, "к разгадке чего-либо")}</p>
        <p>1 ${_trnc("ключ", 1, "к разгадке чего-либо")}</p>
        <p>2 ${_trnc("ключ", 2, "к разгадке чего-либо")}</p>
        <p>5 ${_trnc("ключ", 5, "к разгадке чего-либо")}</p>

        <p>0 ${_trnc("ключ", 0, "ключ воды, приток реки")}</p>
        <p>1 ${_trnc("ключ", 1, "ключ воды, приток реки")}</p>
        <p>2 ${_trnc("ключ", 2, "ключ воды, приток реки")}</p>
        <p>5 ${_trnc("ключ", 5, "ключ воды, приток реки")}</p>

        <p>${_tr("корова")}</p>
    </div>

## Процесс

1. Выполнить `сборку i18n` по исходным файлам (коду, шаблонам, ...) в директории `inputDir`
    * в директории `outputDir` сформируются PO-файлы для языков перевода `langs`
    * отредактировать (перевести и заполнить формы множественного числа) PO-файлы посредством специального ПО, например, [Poedit](http://www.poedit.net/)
1. Выполнить `сборку i18n` еще раз для формирования бандла перевода в директории `bundleDir`
    * `bundle.json` можно использовать в компонентах
1. При модификации исходного кода повторить шаги 1 и 2
    * в PO-файлах будут объеденены старые ключи перевода с новыми
    * будет сформирован обновленный `bundle.json`


## Формат бандла перевода

    {
        // Для базового языка (языка ключей перевода)
        "ru": {
            // Заголовок
            "": {
                // Описание форм множественного числа
                // http://docs.translatehouse.org/projects/localization-guide/en/latest/l10n/pluralforms.html
                "pluralForms": {
                    // Кол-во форм
                    "count": 3,

                    // C-like код вычисления индекса формы
                    "ruleCode": "n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2",

                    // CLDR формат
                    // http://unicode.org/repos/cldr-tmp/trunk/diff/supplemental/language_plural_rules.html
                    "cldrFormat": "one{0}few{1}many{2}other{2}"
                }
            },

            // Сообщения по ключу
            "ключ": [
                // Зарезервированно для простого множественного числа. В данный момент не используется.
                null,

                // Единственное число при формах множественного числа (форма 0).
                "ключ",

                // Множественное число при формах множественного числа (форма 1).
                "ключа",

                // Множественное число при формах множественного числа (форма 2).
                "ключей"
            ],

            // Сообщения по ключу и контексту
            "к разгадке чего-либо\u0004ключ": [
                // Зарезервированно для простого множественного числа. В данный момент не используется.
                null,

                // Единственное число при формах множественного числа (форма 0).
                "ключ",

                // Единственное число при формах множественного числа (форма 1).
                "ключа",

                // Единственное число при формах множественного числа (форма 2).
                "ключей"
            ],

            // Сообщение по ключу. Ключ и является сообщением.
            "корова": [
                null,
                ""
            ],

            // "Системные сообщения"
            "SYSTEM_ERROR": [
              null,
              "Системная ошибка"
            ]
        },

        // Для языка перевода
        "en": {
            "": {
                // Описание форм множественного числа
                "pluralForms": {
                    "count": 2,
                    "ruleCode": "n != 1",
                    "cldrFormat": "one{0}other{1}"
                }
            },

            // Сообщения по ключу
            "ключ": [
                null,

                // Сообщение по ключу и единственное число при формах множественного числа (форма 0).
                "key",

                // Множественное число при формах множественного числа (форма 1).
                "keys"
            ],

            // Сообщения по ключу и контексту
            "к разгадке чего-либо\u0004ключ": [
                null,
                "clue",
                "clues"
            ],

            // Сообщение по ключу. При формировании бандла не были сформированы формы множественного числа для данного ключа.
            "корова": [
                null,
                "cow"
            ],

            // "Системные сообщения"
            "SYSTEM_ERROR": [
              null,
              "System error"
            ]
        }
    }

