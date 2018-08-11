const cm_expect = require("chai").expect;


const {
  f_console_stringify
} = require("ccc_console");


const {
  f_number_cmp,
  f_number_is_valid,
  f_number_max,
  f_number_min,
  f_number_parse,
  f_number_round_with_precision
} = require("ccc_utils");


const ca_test_list = [
  [ f_number_cmp, -1, [ 1, 2] ],
  [ f_number_cmp, -1, [ null, 1] ],
  [ f_number_cmp, 0, [ 1, 1] ],
  [ f_number_cmp, 1, [ 1, null] ],
  [ f_number_cmp, 1, [ 2, 1] ],

  [ f_number_is_valid, false, [ "toto" ] ],
  [ f_number_is_valid, false, [ NaN ] ],
  [ f_number_is_valid, false, [ null ] ],
  [ f_number_is_valid, false, [ undefined ] ],
  [ f_number_is_valid, true, [ "+12345" ] ],
  [ f_number_is_valid, true, [ "-12345" ] ],
  [ f_number_is_valid, true, [ "0" ] ],
  [ f_number_is_valid, true, [ "123456789" ] ],
  [ f_number_is_valid, true, [ 0 ] ],

  [ f_number_max, -1, [ -1, -2, -3, -4 ] ],
  [ f_number_max, 1, [ "toto", 1 ] ],
  [ f_number_max, 1, [ NaN, 1 ] ],
  [ f_number_max, 1, [ null, 1 ] ],
  [ f_number_max, 1, [ undefined, 1 ] ],
  [ f_number_max, 4, [ 1, 2, 3, 4 ] ],

  [ f_number_min, -4, [ -1, -2, -3, -4 ] ],
  [ f_number_min, 1, [ "toto", 1 ] ],
  [ f_number_min, 1, [ 1, 2, 3, 4 ] ],
  [ f_number_min, 1, [ NaN, 1 ] ],
  [ f_number_min, 1, [ null, 1 ] ],
  [ f_number_min, 1, [ undefined, 1 ] ],

  [ f_number_parse, -20563, [ " -20563 " ] ],
  [ f_number_parse, -20563.12, [ " -20563.12 " ] ],
  [ f_number_parse, 20563, [ " + 20563 " ] ],
  [ f_number_parse, 20563, [ " 20563.00 " ] ],
  [ f_number_parse, 20563.12, [ " 20563.12 " ] ],
  [ f_number_parse, null, [ "  " ] ],
  [ f_number_parse, null, [ " -toto " ] ],
  [ f_number_parse, null, [ " titi " ] ],

  [ f_number_round_with_precision, -123, [ -123.45678, 0 ] ],
  [ f_number_round_with_precision, -123.5, [ -123.45678, 1 ] ],
  [ f_number_round_with_precision, -123.46, [ -123.45678, 2 ] ],
  [ f_number_round_with_precision, -123.457, [ -123.45678, 3 ] ],
  [ f_number_round_with_precision, 123, [ 123.45678, 0 ] ],
  [ f_number_round_with_precision, 123.457, [ 123.45678, 3 ] ],
  [ f_number_round_with_precision, 123.46, [ 123.45678, 2 ] ],
  [ f_number_round_with_precision, 123.5, [ 123.45678, 1 ] ],

];



describe("f_number_...", function() {

  ca_test_list.forEach(function (pa_args) {
    const cf_function = pa_args[0];
    const cs_to = pa_args[1];
    const ca_from = pa_args[2];

    const cs_function = cf_function.name;

    describe(`${cs_function}(${f_console_stringify(ca_from)})`, function() {
      it(`should return [${f_console_stringify(cs_to)}]`, function() {
        cm_expect(cf_function(...ca_from)).to.equal(cs_to);
      });
    });
  });

});
