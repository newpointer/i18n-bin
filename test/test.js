/**
 * @author ankostyuk
 */

var chai        = require('chai'),
    assert      = chai.assert,
    expect      = chai.expect,
    should      = chai.should();

var keyextract  = require('../src/keyextract');

describe('keyextract...', function(){
    it('Извлечение ключей', function(){
        keyextract.extract({
            inputDir: __dirname + '/input',
            inputRootPath: __dirname,
            fileMaskRegexp: '\.((js)|(html)|(ftl))$',
            outputDir: __dirname + '/output',
            baseLang: 'ru'
        });
    })
})
