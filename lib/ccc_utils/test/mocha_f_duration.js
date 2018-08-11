const cm_expect = require("chai").expect;


const {
  f_console_stringify
} = require("ccc_console");


const {
  f_duration_parse_ms
} = require("ccc_utils");


const ca_test_list = [
  [ f_duration_parse_ms, 27, [ " 27 milliseconds " ] ],
  [ f_duration_parse_ms, 27, [ " 27 millisecond " ] ],
  [ f_duration_parse_ms, 27, [ " 27 millisecs " ] ],
  [ f_duration_parse_ms, 27, [ " 27 millisec " ] ],
  [ f_duration_parse_ms, 27, [ " 27 millis " ] ],
  [ f_duration_parse_ms, 27, [ " 27 milli " ] ],
  [ f_duration_parse_ms, 27, [ " 27 ms " ] ],

  [ f_duration_parse_ms, 27000, [ " 27 seconds " ] ],
  [ f_duration_parse_ms, 27000, [ " 27 second " ] ],
  [ f_duration_parse_ms, 27000, [ " 27 sec " ] ],
  [ f_duration_parse_ms, 27000, [ " 27 s " ] ],

  [ f_duration_parse_ms, 1620000, [ " 27 minutes " ] ],
  [ f_duration_parse_ms, 1620000, [ " 27 minute " ] ],
  [ f_duration_parse_ms, 1620000, [ " 27 min " ] ],
  [ f_duration_parse_ms, 1620000, [ " 27 m " ] ],

  [ f_duration_parse_ms, 97200000, [ " 27 hours " ] ],
  [ f_duration_parse_ms, 97200000, [ " 27 hour " ] ],
  [ f_duration_parse_ms, 97200000, [ " 27 hrs " ] ],
  [ f_duration_parse_ms, 97200000, [ " 27 hr " ] ],
  [ f_duration_parse_ms, 97200000, [ " 27 h " ] ],

  [ f_duration_parse_ms, 2332800000, [ " 27 days " ] ],
  [ f_duration_parse_ms, 2332800000, [ " 27 day " ] ],
  [ f_duration_parse_ms, 2332800000, [ " 27 dy " ] ],
  [ f_duration_parse_ms, 2332800000, [ " 27 d " ] ],

  [ f_duration_parse_ms, 16329600000, [ " 27 weeks " ] ],
  [ f_duration_parse_ms, 16329600000, [ " 27 week " ] ],
  [ f_duration_parse_ms, 16329600000, [ " 27 wks " ] ],
  [ f_duration_parse_ms, 16329600000, [ " 27 wk " ] ],
  [ f_duration_parse_ms, 16329600000, [ " 27 w " ] ],

  [ f_duration_parse_ms, 71003142000, [ " 27 months " ] ],
  [ f_duration_parse_ms, 71003142000, [ " 27 month " ] ],
  [ f_duration_parse_ms, 71003142000, [ " 27 mos " ] ],
  [ f_duration_parse_ms, 71003142000, [ " 27 mo " ] ],
  [ f_duration_parse_ms, 71003142000, [ " 27 mths " ] ],
  [ f_duration_parse_ms, 71003142000, [ " 27 mth " ] ],

  [ f_duration_parse_ms, 852037704000, [ " 27 years " ] ],
  [ f_duration_parse_ms, 852037704000, [ " 27 year " ] ],
  [ f_duration_parse_ms, 852037704000, [ " 27 yrs " ] ],
  [ f_duration_parse_ms, 852037704000, [ " 27 yr " ] ],
  [ f_duration_parse_ms, 852037704000, [ " 27 y " ] ],

  [ f_duration_parse_ms, (315569520000 + 7889238000 + 3456000000 + 198000000 + 1980000 + 27000 + 66), [ " 10 years, and 3 months; 40 days and 55 hours with 33 minutes / 27 seconds plus 66 millis " ] ],
  [ f_duration_parse_ms, (315569520000 + 7889238000 + 3456000000 + 198000000 + 1980000 + 27000 + 66), [ " 10 yrs plus 3mths 40d, 55h 33m; 27s / 66ms " ] ],

];



describe("f_duration_...", function() {

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
