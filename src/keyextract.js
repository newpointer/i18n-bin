/**
 * @module keyextract
 * @desc Извлечение ключей перевода из исходных файлов java, javascript, html, ...
 * @desc Формирование POT-файла с ключами перевода.
 * @author ankostyuk
 */

"use strict";

//
var glob            = require("glob"),
    byline          = require('byline'),
    util            = require('util'),
    _               = require('underscore'),
    pohelper        = require('./po-helper'),
    path            = require('path'),
    fs              = require('fs-extra');

//
var options = {}; // см. build.js

var poHeaderDir         = path.resolve(__dirname, 'po-headers'),
    PO_EXT              = '.po',
    POT_FILE_NAME       = 'messages.pot',
    ROOT_PATH_REPLACER  = '...',
    FUZZY_TAG           = '#, fuzzy';

//
var TR_REGEXP       = '_tr\\s*\\(\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*\\)',
    TRC_REGEXP      = '_trc\\s*\\(\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*,\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*\\)',
    TRN_REGEXP      = '_trn\\s*\\(\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*,[^,\\)]*\\)',
    TRNC_REGEXP     = '_trnc\\s*\\(\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*,[^,\\)]*\\s*,\\s*"((?:[^"\\\\]|\\\\.)*)"\\s*\\)';

//
var messageMap = {},
    potFile, potHeaderFile;

//
function run(o, callback) {
    messageMap = {};
    options = o;
    potFile     = path.resolve(options.outputDir, POT_FILE_NAME);
    potHeaderFile = path.resolve(poHeaderDir, options.baseLang + PO_EXT);

    doDir(function(){
        callback({
            potFile: potFile
        });
    });
}

function doDir(callback) {

    glob(options.pattern, {
        cwd: options.inputDir
    }, function(error, files) {
        var doCount = 0;

        files.forEach(function(file){
            doFile(path.resolve(options.inputDir, file), function() {
                if (++doCount == files.length) {
                    console.log('Собрано ключей перевода в');
                    console.log(util.format('%s: %s', options.inputDir, _.size(messageMap)));
                    createMessagePotFile();
                    callback();
                }
            });
        });
    });
}

function doFile(filePath, callback) {
    var lineNumber  = 0,
        order       = 0;

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

    while ((result = regexp.exec(text))) {
        callback(result);
    }
}

function doMessage(filePath, lineNumber, messageParamsList) {
    messageParamsList.forEach(function(messageParams){
        if (messageParams.plural) {
            messageParams.key = messageParams.plural;
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

        return location.filePath +
               lineNumberForSort(location.lineNumber) +
               _.size(_.compact(_.values(message)));
    });

    //
    var potData         = pohelper.getPoData(potHeaderFile),
        pluralFormCount = pohelper.getPluralFormCount(potData);

    var potHeader   = fs.readFileSync(potHeaderFile);

    fs.outputFileSync(potFile, potHeader);

    messages.forEach(function(message){
        fs.appendFileSync(potFile, '\n');

        message.locations.forEach(function(location){
            // Путь информационный (от "базовой" директории),
            // поэтому помещен в простые комментарии [#], а не в тег location [#:]
            fs.appendFileSync(potFile, util.format('# %s:%s\n', location.filePath.replace(options.inputRootPath, ROOT_PATH_REPLACER), location.lineNumber));
        });

        if (message.plural) {
            fs.appendFileSync(potFile, util.format('%s\n', FUZZY_TAG));
        }

        if (message.context) {
            fs.appendFileSync(potFile, util.format('msgctxt "%s"\n', message.context));
        }

        fs.appendFileSync(potFile, util.format('msgid "%s"\n', message.key));

        if (message.plural) {
            fs.appendFileSync(potFile, util.format('msgid_plural "%s"\n', '')); // не используется

            for (var i = 0; i < pluralFormCount; i++) {
                fs.appendFileSync(potFile, util.format('msgstr[%s] "%s"\n', i, message.key));
            }
        } else {
            fs.appendFileSync(potFile, 'msgstr ""\n');
        }
    });

    //
    console.log('Сформирован файл ключей перевода PO (POT):');
    console.log(potFile);
}

function lineNumberForSort(lineNumber) {
    return 1000000000 + lineNumber;
}

//
module.exports.run = run;
