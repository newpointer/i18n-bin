/**
 * @module build
 * @desc Сборка i18n
 * @author ankostyuk
 */

"use strict";

//
var fs              = require('fs-extra'),
    util            = require('util'),
    _               = require('lodash'),
    path            = require('path'),
    child_process   = require('child_process'),
    exec            = child_process.exec;

var keyextract      = require('./keyextract'),
    bundle          = require('./bundle');

//
var poHeaderDir     = path.resolve(__dirname, 'po-headers'),
    PO_EXT          = '.po';

//
var options = {
    // Режим работы:
    // signature (по умолчанию) - сбор ключей из сигнатур функций перевода _tr, _trc, _trn, _trnc
    // simple - сбор ключей из текстового файла, в котором каждая строка является ключом для простого перевода
    mode: 'signature|simple',

    // Паттерн для поиска файлов (glob), из которых надо извлекать ключи, например, '**/*.+(js|html)'
    pattern: '',

    // Путь к директории исходных файлов (где собирать ключи)
    inputDir: '',

    // Путь к корню директории исходных файлов
    // Относительно данного пути будут записанны источники ключей в результатах
    inputRootPath: '',

    // Путь к директории, в которой будут сформированы POT-файл и PO-файлы перевода
    outputDir: '',

    // Путь к директории, в которой будет сформирован бандл перевода
    bundleDir: '',

    // Базовый язык - язык ключей перевода
    baseLang: '',

    // Языки перевода
    langs: []
};

//
function run(o, callback) {
    options = o;

    console.log('Базовый язык: ', options.baseLang);

    // извлечение ключей
    keyextract.run(options, extractDone);

    function extractDone(info) {
        merge(info.potFile);
    }

    // формирование файлов перевода
    function merge(potFile) {
        var mergeCount = 0;

        _.each(options.langs, function(lang){
            var poHeaderFile = path.resolve(poHeaderDir, lang + PO_EXT),
                poFile       = path.resolve(options.outputDir, lang + PO_EXT);

            if (!fs.existsSync(poFile)) {
                fs.copySync(poHeaderFile, poFile);
            }

            exec(util.format('msgmerge -U -v -s --no-wrap %s %s', poFile, potFile), function(error, stdout, stderr) {
                console.log(lang + '...');
                console.log(poFile);

                if (error) {
                    throw error;
                }

                console.log(stderr);
                console.log(stdout);

                checkMerge();
            });
        });

        function checkMerge() {
            if (++mergeCount == options.langs.length) {
                console.log('Сформированы (обновлены) файлы перевода для языков:', options.langs.join(', '));
                console.log('Проверьте файлы перевода на наличие недостающих или неточных переводов');
                doBundle();
            }
        }
    }

    // формирование бандла перевода
    function doBundle() {
        bundle.run(options, bundleDone);
    }

    function bundleDone() {
        callback();
    }
}

//
module.exports.run = run;
