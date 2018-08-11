const cm_expect = require("chai").expect;


const {
  f_console_stringify
} = require("ccc_console");


const {
  f_is_array,
  f_is_defined,
  f_is_false,
  f_is_object,
  f_is_scalar,
  f_is_true
} = require("ccc_utils");


const ca_test_list = [
  [ f_is_array, false, "" ],
  [ f_is_array, false, 3 ],
  [ f_is_array, false, null ],
  [ f_is_array, false, undefined ],
  [ f_is_array, false, {} ],
  [ f_is_array, true, [ 1, 2, 3, "4" ] ],
  [ f_is_array, true, [ [ 1, 2, 3], { a:"4" } ] ],
  [ f_is_array, true, [ ] ],
  [ f_is_defined, false, null ],
  [ f_is_defined, false, undefined ],
  [ f_is_defined, true, "   " ],
  [ f_is_defined, true, "  Non  " ],
  [ f_is_defined, true, " Y " ],
  [ f_is_defined, true, " Yes   " ],
  [ f_is_defined, true, " n  " ],
  [ f_is_defined, true, "" ],
  [ f_is_defined, true, "NO" ],
  [ f_is_defined, true, "Oui" ],
  [ f_is_defined, true, "YES" ],
  [ f_is_defined, true, "\t\r\n " ],
  [ f_is_defined, true, "no" ],
  [ f_is_defined, true, "non" ],
  [ f_is_defined, true, "yes" ],
  [ f_is_defined, true, [] ],
  [ f_is_defined, true, {} ],
  [ f_is_false, false, "   Oui" ],
  [ f_is_false, false, "   Yes" ],
  [ f_is_false, false, "   yes" ],
  [ f_is_false, false, "  1 " ],
  [ f_is_false, false, "  on " ],
  [ f_is_false, false, " T " ],
  [ f_is_false, false, " True   " ],
  [ f_is_false, false, " Y " ],
  [ f_is_false, false, " Yes   " ],
  [ f_is_false, false, " true" ],
  [ f_is_false, false, "1" ],
  [ f_is_false, false, "ON" ],
  [ f_is_false, false, "TRUE   " ],
  [ f_is_false, false, "YES" ],
  [ f_is_false, false, "t" ],
  [ f_is_false, false, -1 ],
  [ f_is_false, false, -2 ],
  [ f_is_false, false, 1 ],
  [ f_is_false, false, 2 ],
  [ f_is_false, false, [] ],
  [ f_is_false, false, {} ],
  [ f_is_false, true, "   " ],
  [ f_is_false, true, "  0   " ], // zero
  [ f_is_false, true, "  False " ],
  [ f_is_false, true, "  Non  " ],
  [ f_is_false, true, "  f  " ],
  [ f_is_false, true, "  false " ],
  [ f_is_false, true, " F  " ],
  [ f_is_false, true, " FALSE    " ],
  [ f_is_false, true, " NO   " ],
  [ f_is_false, true, " f  " ],
  [ f_is_false, true, " n  " ],
  [ f_is_false, true, " no " ],
  [ f_is_false, true, " non   " ],
  [ f_is_false, true, " off  " ],
  [ f_is_false, true, "" ],
  [ f_is_false, true, "0" ], // zero
  [ f_is_false, true, "\t\r\n " ],
  [ f_is_false, true, "f" ],
  [ f_is_false, true, null ],
  [ f_is_false, true, undefined ],
  [ f_is_object, false, "" ],
  [ f_is_object, false, 3 ],
  [ f_is_object, false, [] ],
  [ f_is_object, false, null ],
  [ f_is_object, false, undefined ],
  [ f_is_object, true, {} ],
  [ f_is_scalar, false, [] ],
  [ f_is_scalar, false, {} ],
  [ f_is_scalar, true, "" ],
  [ f_is_scalar, true, "toto" ],
  [ f_is_scalar, true, 3 ],
  [ f_is_scalar, true, null ],
  [ f_is_scalar, true, undefined ],
  [ f_is_true, false, "   " ],
  [ f_is_true, false, "  0   " ], // zero
  [ f_is_true, false, "  Non  " ],
  [ f_is_true, false, "  false " ],
  [ f_is_true, false, " F  " ],
  [ f_is_true, false, " FALSE    " ],
  [ f_is_true, false, " NO   " ],
  [ f_is_true, false, " NO   " ],
  [ f_is_true, false, " f  " ],
  [ f_is_true, false, " n  " ],
  [ f_is_true, false, " no " ],
  [ f_is_true, false, " non   " ],
  [ f_is_true, false, " off  " ],
  [ f_is_true, false, "" ],
  [ f_is_true, false, "0" ], // zero
  [ f_is_true, false, "\t\r\n " ],
  [ f_is_true, false, "f" ],
  [ f_is_true, false, null ],
  [ f_is_true, false, undefined ],
  [ f_is_true, true, "   Oui" ],
  [ f_is_true, true, "   yes" ],
  [ f_is_true, true, "  1 " ],
  [ f_is_true, true, "  on " ],
  [ f_is_true, true, " T " ],
  [ f_is_true, true, " True   " ],
  [ f_is_true, true, " Y " ],
  [ f_is_true, true, " Yes   " ],
  [ f_is_true, true, " true" ],
  [ f_is_true, false, "" ],
  [ f_is_true, true, "1" ],
  [ f_is_true, true, "TRUE   " ],
  [ f_is_true, true, "YES" ],
  [ f_is_true, true, "t" ],
  [ f_is_true, true, -1 ],
  [ f_is_true, true, -2 ],
  [ f_is_true, true, 1 ],
  [ f_is_true, true, 2 ],
  [ f_is_true, true, [] ],
  [ f_is_true, true, {} ]
];



describe("f_is_...", function() {

  ca_test_list.forEach(function (pa_args) {
    const cf_function = pa_args[0];
    const cs_to = pa_args[1];
    const cx_from = pa_args[2];

    const cs_function = cf_function.name;

    describe(`${cs_function}(${f_console_stringify(cx_from)})`, function() {
      it(`should return [${f_console_stringify(cs_to)}]`, function() {
        cm_expect(cf_function(cx_from)).to.equal(cs_to);
      });
    });
  });

});
