//
var chai = require('chai');
var expect = chai.expect;

var fs = require('fs-extra');
var path = require('path');
var glob = require('glob');

var map = require('lodash/collection/map');
var flatten = require('lodash/array/flatten');
var endsWith = require('lodash/string/endsWith');
var isNumber = require('lodash/lang/isNumber');

var testUtils = require('test/utils');
var Handlebars = require('handlebars');

// -----------------------------------------------------------------------------

var harvester = require('src/harvester');

var JS_WRAP_OPTIONS = {
  translatorRequireTemplate: "var {translator} = require('{translatorRequire}').translator;",
  translatorRequire: 'L10n',
  translator: 'tr',
  message: 'msg'
};

var HANDLEBARS_WRAP_OPTIONS = {
  message: 'MSG'
};

describe('harvester', function() {
  describe('collect keys', function() {
    it('from Handlebars template', function() {
      var template = fs.readFileSync(
        'test/data/templates/handlebars/0.handlebars', 'utf8'
      );
      var keyItems = {};

      var keyItemsRet =
        harvester.collectKeyItemsFromHandlebarsTemplate(keyItems, template);

      // console.log(testUtils.stringifyObject(keyItems));

      expect(keyItemsRet).to.equal(keyItems);

      expect(testUtils.normalizeJson(keyItems)).to.deep.equal({
        "Ключ 0_1": [ {
            "key": "Ключ 0_1",
            "context": null,
            "location": {
              "start": {
                "line": 3,
                "column": 10
              },
              "end": {
                "line": 3,
                "column": 20
              }
            }
          },
          {
            "key": "Ключ 0_1",
            "context": null,
            "location": {
              "start": {
                "line": 5,
                "column": 10
              },
              "end": {
                "line": 5,
                "column": 20
              }
            }
          }
        ],
        "Ключ 0_1\u0004Контекст 0_1": [ {
            "key": "Ключ 0_1",
            "context": "Контекст 0_1",
            "location": {
              "start": {
                "line": 4,
                "column": 10
              },
              "end": {
                "line": 4,
                "column": 20
              }
            }
          },
          {
            "key": "Ключ 0_1",
            "context": "Контекст 0_1",
            "location": {
              "start": {
                "line": 6,
                "column": 10
              },
              "end": {
                "line": 6,
                "column": 20
              }
            }
          }
        ],
        "Ключ с форматированием: {result}": [ {
          "key": "Ключ с форматированием: {result}",
          "context": null,
          "location": {
            "start": {
              "line": 12,
              "column": 10
            },
            "end": {
              "line": 12,
              "column": 44
            }
          }
        } ],
        "Ключ с форматированием: {count, plural, =0 {a} =1 {b} one {c} few {d} many {e} other {f}}\u0004Контекст 0_1": [ {
          "key": "Ключ с форматированием: {count, plural, =0 {a} =1 {b} one {c} few {d} many {e} other {f}}",
          "context": "Контекст 0_1",
          "location": {
            "start": {
              "line": 14,
              "column": 10
            },
            "end": {
              "line": 14,
              "column": 101
            }
          }
        } ]
      });
    });

    it('from Handlebars template: i18n helper as SubExpression', function() {
      var template = fs.readFileSync(
        'test/data/templates/handlebars/3.handlebars', 'utf8'
      );

      Handlebars.registerHelper('MSG', require('src/handlebars/helpers/MSG'));
      Handlebars.registerPartial('item', fs.readFileSync(
        'test/data/templates/handlebars/3_item.handlebars', 'utf8'
      ));

      var html = testUtils.evalHandlebars(template);

      expect(html).to.equal([
        '<div>',
        '  Ключ 3_1',
        '  <span>',
        '    Ключ 3_2 ',
        '  </span>',
        '  <span>',
        '    Ключ 3_3_1 Ключ 3_3_2',
        '  </span>',
        '</div>',
        ''
      ].join('\n'));

      var keyItems = {};

      var keyItemsRet =
        harvester.collectKeyItemsFromHandlebarsTemplate(keyItems, template);

      // console.log(testUtils.stringifyObject(keyItems));

      expect(testUtils.normalizeJson(keyItems)).to.deep.equal({
        "Ключ 3_1": [ {
          "key": "Ключ 3_1",
          "context": null,
          "location": {
            "start": {
              "line": 3,
              "column": 8
            },
            "end": {
              "line": 3,
              "column": 18
            }
          }
        } ],
        "Ключ 3_3_1": [ {
          "key": "Ключ 3_3_1",
          "context": null,
          "location": {
            "start": {
              "line": 7,
              "column": 23
            },
            "end": {
              "line": 7,
              "column": 35
            }
          }
        } ],
        "Ключ 3_3_2\u0004Контекст 3_3_2": [ {
          "key": "Ключ 3_3_2",
          "context": "Контекст 3_3_2",
          "location": {
            "start": {
              "line": 7,
              "column": 49
            },
            "end": {
              "line": 7,
              "column": 61
            }
          }
        } ]
      });
    });

    it('from JS', function() {
      var template = fs.readFileSync(
        'test/data/js/0.js', 'utf8'
      );
      var keyItems = {};

      var keyItemsRet =
        harvester.collectKeyItemsFromJs(keyItems, template);

      // console.log(testUtils.stringifyObject(keyItems));

      expect(keyItemsRet).to.equal(keyItems);

      expect(testUtils.normalizeJson(keyItems)).to.deep.equal({
        "Ключ 0_1\u0004Контекст 0_1": [ {
            "key": "Ключ 0_1",
            "context": "Контекст 0_1",
            "location": {
              "start": {
                "line": 4,
                "column": 2
              },
              "end": {
                "line": 4,
                "column": 12
              }
            }
          },
          {
            "key": "Ключ 0_1",
            "context": "Контекст 0_1",
            "location": {
              "start": {
                "line": 11,
                "column": 2
              },
              "end": {
                "line": 11,
                "column": 12
              }
            }
          },
          {
            "key": "Ключ 0_1",
            "context": "Контекст 0_1",
            "location": {
              "start": {
                "line": 27,
                "column": 19
              },
              "end": {
                "line": 27,
                "column": 29
              }
            }
          },
          {
            "key": "Ключ 0_1",
            "context": "Контекст 0_1",
            "location": {
              "start": {
                "line": 33,
                "column": 19
              },
              "end": {
                "line": 33,
                "column": 29
              }
            }
          }
        ],
        "Ключ 0_1": [ {
            "key": "Ключ 0_1",
            "context": null,
            "location": {
              "start": {
                "line": 16,
                "column": 21
              },
              "end": {
                "line": 16,
                "column": 31
              }
            }
          },
          {
            "key": "Ключ 0_1",
            "context": null,
            "location": {
              "start": {
                "line": 25,
                "column": 19
              },
              "end": {
                "line": 25,
                "column": 29
              }
            }
          },
          {
            "key": "Ключ 0_1",
            "context": null,
            "location": {
              "start": {
                "line": 29,
                "column": 19
              },
              "end": {
                "line": 29,
                "column": 29
              }
            }
          }
        ]
      });
    });

    it('from files', function() {
      var keyItems = {};
      var keyItemsRet = harvester.collectKeyItemsFromFiles(
        keyItems, 'test/data', '**/0.+(js|handlebars)', null
      );

      var sources = flatten(map(keyItems, function(items) {
          return map(items, function(item) {
            return item.location.src;
          });
      })).sort();

      expect(sources).to.deep.equal([
        'js/0.js',
        'js/0.js',
        'js/0.js',
        'js/0.js',
        'js/0.js',
        'js/0.js',
        'js/0.js',
        'templates/handlebars/0.handlebars',
        'templates/handlebars/0.handlebars',
        'templates/handlebars/0.handlebars',
        'templates/handlebars/0.handlebars',
        'templates/handlebars/0.handlebars',
        'templates/handlebars/0.handlebars'
      ]);
    });

    it('build PO files', function() {
      var keyItems = {};
      var keyItemsRet = harvester.collectKeyItemsFromFiles(
        keyItems, 'test/data', '**/0.+(js|handlebars)', null
      );

      var locales = [ 'ru', 'en' ];
      var poFileDir = 'test/tmp/po';
      var poFileBaseName = 'test_';

      harvester.buildPoFiles(keyItems, locales, poFileDir, poFileBaseName);
    });
  });

  describe('wrap translation texts', function() {
    describe('JS', function() {
      it('clean (without tr)', function() {
        test_wrapTranslationTextsInJs('test/data/wrap-translation/js/clean');
      });

      it('dirty (with tr and spaces)', function() {
        test_wrapTranslationTextsInJs('test/data/wrap-translation/js/dirty');
      });

      it('empty (no wrap)', function() {
        test_wrapTranslationTextsInJs('test/data/wrap-translation/js/empty');
      });

      it('test', function() {
        test_wrapTranslationTextsInJs('test/data/wrap-translation/js/test', true);
      });
    });

    describe('Handlebars template', function() {
      it('clean (HTML only)', function(done) {
        test_wrapTranslationTextsInHandlebars('test/data/wrap-translation/templates/handlebars/clean', done);
      });

      it('dirty (with Handlebars)', function(done) {
        test_wrapTranslationTextsInHandlebars('test/data/wrap-translation/templates/handlebars/dirty', done);
      });

      it('empty (no wrap)', function(done) {
        test_wrapTranslationTextsInHandlebars('test/data/wrap-translation/templates/handlebars/empty', done);
      });

      it('test', function(done) {
        test_wrapTranslationTextsInHandlebars('test/data/wrap-translation/templates/handlebars/test', done, true);
      });
    });

    it('from files', function(done) {
      var dir = 'wrap-translation';
      var srcDir = path.resolve('test/data', dir);
      var targetDir = path.resolve('test/tmp', dir);
      var pattern = '**/*.+(js|handlebars)';

      fs.removeSync(targetDir);
      fs.copySync(srcDir, targetDir);

      harvester.wrapTranslationTextsInFiles(
        targetDir,
        pattern,
        null, {
          handlebars: HANDLEBARS_WRAP_OPTIONS,
          js: JS_WRAP_OPTIONS
        },
        function(err, result) {
          expect(err).to.be.null;
          expect(result.files).to.have.lengthOf(16);
          expect(result.stat.counts.wrappedTexts).to.be.at.least(1);

          var wrappedTextsCount = 0;

          result.files.forEach(function(file) {
            expect(file.name).to.match(/\.(js|handlebars)$/);
            wrappedTextsCount += file.stat.counts.wrappedTexts;
          });

          expect(wrappedTextsCount).to.be.equal(result.stat.counts.wrappedTexts);

          //
          var files = glob.sync(pattern, {
            cwd: targetDir,
            nodir: true
          });

          files.forEach(function(file) {
            var wrappedExt = '_wrapped';
            var ext = path.extname(file);
            var name = path.basename(file, ext);

            var isWrapped = endsWith(name, wrappedExt);
            var expactedFile = isWrapped ? file :
              path.join(path.dirname(file), name + wrappedExt + ext);

            var filePath = path.resolve(targetDir, file);
            var expactedFilePath = path.resolve(targetDir, expactedFile);

            expect(
              fs.readFileSync(filePath, 'utf8')
            ).to.equal(
              fs.readFileSync(expactedFilePath, 'utf8')
            );
          });

          done();
        },
        true
      );
    });

    describe('TAIS', function() {
      describe('Handlebars template', function() {
        it('rule.handlebars', function(done) {
          test_wrapTranslationTextsInHandlebars('test/data/tais/wrap-translation/handlebars/rule', done, true);
        });

        it('initializers.handlebars', function(done) {
          test_wrapTranslationTextsInHandlebars('test/data/tais/wrap-translation/handlebars/initializers', done, true);
        });
      });
    });

  });
});

function test_wrapTranslationTextsInJs(file, dump) {
  var js = fs.readFileSync(
    file + '.js', 'utf8'
  );

  var expextedJs = fs.readFileSync(
    file + '_wrapped.js', 'utf8'
  );

  var result = harvester.wrapTranslationTextsInJs(js, JS_WRAP_OPTIONS);
  dump && fs.outputFileSync('test/tmp/' + file + '_wrapped.js', result.wrapped);
  assert_wrapTranslationTextsInJs(js, result, expextedJs);

  result = harvester.wrapTranslationTextsInJs(result.wrapped, JS_WRAP_OPTIONS);
  dump && fs.outputFileSync('test/tmp/' + file + '_wrapped_2.js', result.wrapped);
  assert_wrapTranslationTextsInJs(result.wrapped, result, expextedJs);
}

//
function test_wrapTranslationTextsInHandlebars(file, done, dump) {
  var template = fs.readFileSync(
    file + '.handlebars', 'utf8'
  );

  var expextedTemplate = fs.readFileSync(
    file + '_wrapped.handlebars', 'utf8'
  );

  harvester.wrapTranslationTextsInHandlebars(template, HANDLEBARS_WRAP_OPTIONS, function(result) {
    dump && fs.outputFileSync('test/tmp/' + file + '_wrapped.handlebars', result.wrapped);
    assert_wrapTranslationTextsInHandlebars(template, result, expextedTemplate);

    harvester.wrapTranslationTextsInHandlebars(result.wrapped, HANDLEBARS_WRAP_OPTIONS, function(result) {
      dump && fs.outputFileSync('test/tmp/' + file + '_wrapped_2.handlebars', result.wrapped);
      assert_wrapTranslationTextsInHandlebars(result.wrapped, result, expextedTemplate);

      done();
    });
  });
}

function assert_wrapTranslationTexts(mathRegexp, input, result, expected) {
  var inputMatch = (input.match(mathRegexp) || []).length;
  var resultMatch = (result.wrapped.match(mathRegexp) || []).length;

  expect(result.stat.counts.wrappedTexts).to.equal(
    resultMatch - inputMatch,
    '[result.stat] test error...'
  );

  expect(result.wrapped).to.equal(
    expected, '[result.wrapped] test error...'
  );
}

function assert_wrapTranslationTextsInJs(input, result, expected) {
  assert_wrapTranslationTexts(/[^a-z]tr\./g, input, result, expected);
}

function assert_wrapTranslationTextsInHandlebars(input, result, expected) {
  assert_wrapTranslationTexts(/[^a-z]MSG\s'/g, input, result, expected);
}
