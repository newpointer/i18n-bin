/**
 * @author ankostyuk
 */

var chai        = require('chai'),
    assert      = chai.assert,
    expect      = chai.expect,
    should      = chai.should();

var build = require('../src/build');

describe('build test...', function(){
    it('Сборка i18n', function(done){
        build.run({
            pattern:        '**/*.+(js|ftl|html)',
            inputDir:       __dirname + '/input',
            inputRootPath:  __dirname,
            outputDir:      __dirname + '/output',
            bundleDir:      __dirname + '/result',
            baseLang:       'ru',
            langs:          ['ru', 'en']
        }, function(){
            done();
        });
    })
})
