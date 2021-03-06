'use strict';

var dep_1 = require('xxx/yyy');
var tr = translator = require('L10n').translator;

var str_0 = 'text 1' + 'text # 2\n' +
  "TEXT 3" + "TEXT # 4\n";

var str_1 = tr.msg('текст 1') + ' ' + tr.msg('text № 2\n') +
  tr.msg("ТЕКСТ 3") + " " + " " + tr.msg("TEXT № 4\n") +
  "TEXT 3" + "TEXT # 4\n";

var str_2 = tr.msg(
  'текст 1' + 'текст № 2\n' +
  "ТЕКСТ 3" + "ТЕКСТ № 4\n"
);

var str_3 = tr.msg('текст 1');

//------------------------------------------------------------------------------

var str_4 = obj.foo(
  tr.msg('текст 1') + tr.msg('текст № 2\n') +
  tr.msg("ТЕКСТ 3") + "   " + tr.msg("ТЕКСТ № 4") + "      " + " " +
  "TEXT 3" + "TEXT # 4\n"
);

var str_5 = obj.foo(tr.msg('текст 1'));

var str_6 = tr.msg('текст 1');

var str_7 = '   ' + tr.msg('текст 1') + '     ';

//------------------------------------------------------------------------------

obj = {
  'Ключ': tr.msg('Текст'),
  'Key': 'Text'
};

var str_ru = tr.msg('Текст');
var str_en = 'Text';

//------------------------------------------------------------------------------
// В комментариях не оборачиваем...

// var str_6 = 'текст 1';

/*
var str_6 = "текст 1";
*/

/*
 * var str_6 = 'текст 1';
 */

//------------------------------------------------------------------------------
// TODO:
//  special characters: unicode ...
