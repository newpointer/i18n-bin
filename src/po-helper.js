/**
 * po-helper
 *
 * @author ankostyuk
 */

"use strict";

//
var po2json = require('po2json'),
    _       = require('lodash');

//
var PO_HEADER_KEY = '';
var PO_HEADER_PLURAL_FORMS_KEY = 'Plural-Forms'.toLowerCase();
var PO_HEADER_CLDR_PLURAL_FORMS_KEY = 'CLDR_PLURAL_FORMS_FORMAT'.toLowerCase();

//
function getPoData(poFile) {
    return po2json.parseFileSync(poFile, {
        fuzzy: true
    });
}

function buildPoPluralFormFunc(poLangData, returnCode) {
    var poPluralForms = getPoPluralForms(poLangData);
    return new Function('n', poPluralForms + returnCode);
}

function getPoHeader(poLangData) {
    return poLangData[PO_HEADER_KEY];
}

function setPoHeader(poLangData, data) {
    poLangData[PO_HEADER_KEY] = data;
}

function getPluralFormCount(poLangData) {
    var func = buildPoPluralFormFunc(poLangData, 'return nplurals;');
    return func(0);
}

function getPluralFormsRuleCode(poLangData) {
    var poPluralForms = getPoPluralForms(poLangData);
    var match = poPluralForms.match(/plural\s*=\s*\((.+)\)\s*;/i);
    return (match ? match[1].trim() : '');
}

function getPoPluralForms(poLangData) {
    return poLangData[PO_HEADER_KEY][PO_HEADER_PLURAL_FORMS_KEY];
}

function getCldrPluralForms(poLangData) {
    return poLangData[PO_HEADER_KEY][PO_HEADER_CLDR_PLURAL_FORMS_KEY];
}

//
module.exports.getPoData = getPoData;
module.exports.getPoHeader = getPoHeader;
module.exports.setPoHeader = setPoHeader;
module.exports.getPluralFormCount = getPluralFormCount;
module.exports.getPluralFormsRuleCode = getPluralFormsRuleCode;
module.exports.getCldrPluralForms = getCldrPluralForms;
