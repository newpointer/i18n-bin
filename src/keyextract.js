/**
 * @module keyextract
 * @desc Извлечение ключей перевода из исходных файлов java, javascript, html, ...
 * @desc Формирование POT-файла с ключами перевода.
 * @author ankostyuk
 */

"use strict"

//
var options = {
     // Путь к директории исходных файлов (где собирать ключи)
    inputDir: '',

    // Путь к корню директории исходных файлов
    // Относительно данного пути будут записанны источники ключей в результатах
    inputRootPath: '',

    // Regexp маски файлов, из которых надо извлекать ключи
    fileMaskRegexp: '',

    // Путь к директории, в которой будут сформированы результаты
    outputDir: '',

    // Базовый язык - язык ключей перевода
    baseLang: ''
};

var poHeaderDir = __dirname + '/po-headers/';

var ROOT_PATH_REPLACER = '...';

//
var TR_REGEXP       = '_tr\\s*\\(\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*\\)';
var TRC_REGEXP      = '_trc\\s*\\(\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*,\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*\\)';
var TRN_REGEXP      = '_trn\\s*\\(\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*,[^,\\)]*\\)';
var TRNC_REGEXP     = '_trnc\\s*\\(\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*,[^,\\)]*\\s*,\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*\\)';

//
var findit          = require('findit'),
    byline          = require('byline'),
    util            = require('util'),
    _               = require('underscore'),
    po2json         = require('po2json'),
    pohelper        = require('./po-helper'),
    fs              = require('fs-extra');

//
var messageMap = {};
var potHeaderFile;

//
function extract(o) {
    messageMap = {};
    options = o;
    potHeaderFile =   poHeaderDir + options.baseLang + '.po';

    doDir();
}

function doDir() {
    var files = findit
        .sync(options.inputDir)
        .filter(function(filePath){
            var stat = fs.statSync(filePath);
            return (stat && stat.isFile() && isDoFile(filePath));
        });

    var doCount = 0;

    files.forEach(function(filePath){
        doFile(filePath, function() {
            if (++doCount == files.length) {
                console.log(util.format('Собрано ключей перевода в %s: %s', options.inputDir, _.size(messageMap)));
                createMessagePotFile();
            }
        });
    });
}

function isDoFile(filePath) {
    var result = filePath.match(new RegExp(options.fileMaskRegexp, 'ig'));
    return (util.isArray(result) && result.length == 1);
}

function doFile(filePath, callback) {
    var lineNumber = 0;
    var order = 0;

    byline(fs.createReadStream(filePath))
        .on('data', function(line) {
            lineNumber++;

            doMessage(filePath, lineNumber, _.union(
                extractMessageParams(TR_REGEXP, line, ['key']),
                extractMessageParams(TRC_REGEXP, line, ['key', 'context']),
                extractMessageParams(TRN_REGEXP, line, ['plural']),
                extractMessageParams(TRNC_REGEXP, line, ['plural', 'context'])
            ));
        })
        .on('end', function(){
            callback();
        });
}

function extractMessageParams(regexp, text, params) {
    var results = [];

    regexpIterator(new RegExp(regexp, 'ig'), text, function(match){
        var result = {};

        for (var i = 0; i < params.length; i++) {
            result[params[i]] = match[i + 1];
        }

        results.push(result);
    });

    return results;
}

function regexpIterator(regexp, text, callback) {
    var result = null;

    while (result = regexp.exec(text)) {
        callback(result);
    }
}

function doMessage(filePath, lineNumber, messageParamsList) {
    messageParamsList.forEach(function(messageParams){
        if (messageParams.plural) {
            messageParams.key = pohelper.getPluralFormsByKey(messageParams.plural)[0];
        }

        var k = messageParams.key + messageParams.context;

        var location = {
            filePath: filePath,
            lineNumber: lineNumber
        };

        var message = messageMap[k];

        if (message) {
            message.plural = (message.plural ? message.plural : messageParams.plural);
            message.locations.push(location);
        } else {
            message = {
                key: messageParams.key,
                plural: messageParams.plural,
                context: messageParams.context,
                locations: [location]
            };
            messageMap[k] = message;
        }
    });
}

function createMessagePotFile() {
    //
    var messages = _.sortBy(_.values(messageMap), function(message){
        // sort locations
        var locations = _.sortBy(message.locations, function(location){
            return location.filePath + lineNumberForSort(location.lineNumber);
        });

        message.locations = locations;

        // sort messages
        var location = message.locations[0];

        return
            location.filePath +
            lineNumberForSort(location.lineNumber) +
            _.size(_.compact(_.values(message)));
    });

    //
    var potFile = options.outputDir + '/messages.pot';

    var potHeaderData = fs.readFileSync(potHeaderFile);
    fs.outputFileSync(potFile, potHeaderData);

    messages.forEach(function(message){
        fs.appendFileSync(potFile, '\n');

        message.locations.forEach(function(location){
            fs.appendFileSync(potFile, util.format('#: %s:%s\n', location.filePath.replace(options.inputRootPath, ROOT_PATH_REPLACER), location.lineNumber));
        });

        if (message.context) {
            fs.appendFileSync(potFile, util.format('msgctxt "%s"\n', message.context));
        }

        fs.appendFileSync(potFile, util.format('msgid "%s"\n', message.key));

        if (message.plural) {
            fs.appendFileSync(potFile, util.format('msgid_plural "%s"\n', '')); // не используется

            var plurals = pohelper.getPluralFormsByKey(message.plural);
            for (var i = 0; i < plurals.length; i++) {
                fs.appendFileSync(potFile, util.format('msgstr[%s] "%s"\n', i, plurals[i]));
            }
        } else {
            fs.appendFileSync(potFile, 'msgstr ""\n');
        }
    });

    //
    console.log(util.format('Сформирован файл ключей перевода PO (POT): %s', potFile));
}

function lineNumberForSort(lineNumber) {
    return 1000000000 + lineNumber;
}

//
module.exports.extract = extract;
