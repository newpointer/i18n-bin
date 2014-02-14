/**
 * @module bundle
 * @desc Формирование JSON-бандла переводов.
 * @author ankostyuk
 */

"use strict";

//
var util            = require('util'),
    _               = require('underscore'),
    pohelper        = require('./po-helper'),
    path            = require('path'),
    fs              = require('fs-extra');

//
var options = {}; // см. build.js

var BUNDLE_FILE_NAME    = 'bundle.json',
    PO_EXT              = '.po',
    PLURAL_FORMS_KEY    = 'pluralForms';

//
function run(o, callback) {
    options = o;

    var bundle      = {},
        bundleFile  = path.resolve(options.bundleDir, BUNDLE_FILE_NAME);

    _.each(options.langs, function(lang){
        var poFile = path.resolve(options.outputDir, lang + PO_EXT);

        var poData = pohelper.getPoData(poFile);

        var pluralForms = buildPluralForms(poData);
        pohelper.setPoHeader(poData, pluralForms);

        bundle[lang] = poData;
    });

    fs.outputJson(bundleFile, bundle, function(){
        console.log('Сформирован JSON-бандл перевода:');
        console.log(bundleFile);

        callback();
    });
}

function buildPluralForms(langData) {
    var p = {};

    p[PLURAL_FORMS_KEY] = {
        count: pohelper.getPluralFormCount(langData),
        ruleCode: pohelper.getPluralFormsRuleCode(langData),
        cldrFormat: pohelper.getCldrPluralForms(langData)
    };

    return p;
}


//
module.exports.run = run;
