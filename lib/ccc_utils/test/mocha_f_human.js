const cm_expect = require("chai").expect;

const {
  f_human_duration,
  f_human_number,
  f_human_bitrate,
  f_human_datasize
} = require("ccc_utils");



describe("f_human_duration", function() {

  const ca_human_duration_tests = [
    // milliseconds, conversion(long), conversion(short)
    [ 98745782211447, "3131 years", "3131y" ],
    [ 654544651587, "20 years, 275 days", "20y 275d" ],
    [ 39987456721, "1 year, 97 days", "1y 97d" ],
    [ 31536005874, "1 year", "1y" ],
    [ 31535900000, "364 days", "364d" ],
    [ 9987456721, "115 days", "115d" ],
    [ 476548584, "5 days, 12 hours", "5d 12h" ],
    [ 86400000, "1 day", "1d" ],
    [ 35489667, "9 hours, 51 minutes", "9h 51m" ],
    [ 3600000, "1 hour", "1h" ],
    [ 324815, "5 minutes, 24 seconds", "5m 24s" ],
    [ 78956, "1 minute, 18 seconds", "1m 18s" ],
    [ 60000, "1 minute", "1m" ],
    [ 4574, "4 seconds, 574 milliseconds", "4s 574ms" ],
    [ 3873, "3 seconds, 873 milliseconds", "3s 873ms" ],
    [ 3600, "3 seconds, 600 milliseconds", "3s 600ms" ],
    [ 3500, "3 seconds, 500 milliseconds", "3s 500ms" ],
    [ 1234, "1 second, 234 milliseconds", "1s 234ms" ],
    [ 445, "445 milliseconds", "445ms" ],
    [ 1, "1 millisecond", "1ms" ],
    [ 0, "null duration", "null duration" ]
  ];


  ca_human_duration_tests.forEach(function (pa_args) {

    const li_millesconds = pa_args[0];
    const ls_conversion_long = pa_args[1];
    const ls_conversion_short = pa_args[2];

    describe(`f_human_duration(${li_millesconds}) long`, function() {
      it(`should return [${ls_conversion_long}]`, function() {
        cm_expect(f_human_duration(li_millesconds)).to.equal(ls_conversion_long);
      });
    });

    describe(`f_human_duration(${li_millesconds}, true) short`, function() {
      it(`should return [${ls_conversion_short}]`, function() {
        cm_expect(f_human_duration(li_millesconds, true)).to.equal(ls_conversion_short);
      });
    });
  });
});




describe("f_human_number", function() {

  const ca_human_number_tests = [
    // milliseconds, conversion(long), conversion(short)
    [ 98745782211447, "99 Tera" ],
    [ 654544651587, "655 Giga" ],
    [ 39987456721, "40 Giga" ],
    [ 31536005874, "32 Giga" ],
    [ 31535900000, "32 Giga" ],
    [ 9987456721, "10 Giga" ],
    [ 476548584, "477 M" ],
    [ 86400000, "86 M" ],
    [ 35489667, "35 M" ],
    [ 3600000, "3.6 M" ],
    [ 324815, "325 K" ],
    [ 78956, "79 K" ],
    [ 60000, "60 K" ],
    [ 4574, "4.6 K" ],
    [ 3873, "3.9 K" ],
    [ 3600, "3.6 K" ],
    [ 3500, "3.5 K" ],
    [ 1234, "1.2 K" ],
    [ 445, "445" ],
    [ 1, "1" ],
    [ 0, "0" ]
  ];


  ca_human_number_tests.forEach(function (pa_args) {

    const li_number = pa_args[0];
    const ls_conversion = pa_args[1];

    describe(`f_human_number(${li_number})`, function() {
      it(`should return [${ls_conversion}]`, function() {
        cm_expect(f_human_number(li_number)).to.equal(ls_conversion);
      });
    });
  });
})




describe("f_human_bitrate", function() {

  const ca_human_bitrate_tests = [
    [ 98745782211447, "99 Tbps" ],
    [ 654544651587, "655 Gbps" ],
    [ 39987456721, "40 Gbps" ],
    [ 31536005874, "32 Gbps" ],
    [ 31535900000, "32 Gbps" ],
    [ 9987456721, "10 Gbps" ],
    [ 7387456721, "7.4 Gbps" ],
    [ 476548584, "477 Mbps" ],
    [ 86400000, "86 Mbps" ],
    [ 35489667, "35 Mbps" ],
    [ 3600000, "3.6 Mbps" ],
    [ 324815, "325 Kbps" ],
    [ 78956, "79 Kbps" ],
    [ 60000, "60 Kbps" ],
    [ 4574, "4.6 Kbps" ],
    [ 3873, "3.9 Kbps" ],
    [ 3600, "3.6 Kbps" ],
    [ 3500, "3.5 Kbps" ],
    [ 1234, "1.2 Kbps" ],
    [ 445, "445 bps" ],
    [ 1, "1 bps" ],
    [ 0, "0 bps" ],


    [ "1.3 P/s", "1.3 Pbps" ],
    [ "1.3 T/s", "1.3 Tbps" ],
    [ "1.3 T/second", "1.3 Tbps" ],
    [ "1.3 Tb/s", "1.3 Tbps" ],
    [ "1.3 Tbit / s", "1.3 Tbps" ],
    [ "1.3 Tbps", "1.3 Tbps" ],
    [ "1.34 E/s", "1.3 Ebps" ],
    [ "1.5 Gb", "1.5 Gbps" ],
    [ "1000000", "1 Mbps" ],
    [ "1024000 k", "1 Gbps" ],
    [ "1024000", "1 Mbps" ],
    [ "1025000 k", "1 Gbps" ],
    [ "1286.4789t", "1.3 Pbps" ],
    [ "1536 Kbps", "1.5 Mbps" ],
    [ "15487 z", "15 Ybps" ],
    [ "1789.254 eb/s", "1.8 Zbps" ],
    [ "1984 Mbit", "2 Gbps" ],
    [ "1984 Mbits", "2 Gbps" ],
    [ "1984Mbit / s", "2 Gbps" ],
    [ "1984Mbit/s", "2 Gbps" ],
    [ "2.4Gbp", "2.4 Gbps" ],
    [ "2.4Gbp/s", "2.4 Gbps" ],
    [ "200000 b/s", "200 Kbps" ],
    [ "200000 bp / s", "200 Kbps" ],
    [ "200000 bp", "200 Kbps" ],
    [ "200000 bps", "200 Kbps" ],
    [ "23456 k/s", "23 Mbps" ],
    [ "384 cp / sec", "144 Kbps" ],
    [ "384 cp / second", "144 Kbps" ],
    [ "384 cps", "144 Kbps" ],
    [ "384 cps", "144 Kbps" ],
    [ "384c", "144 Kbps" ],
    [ "384c/s", "144 Kbps" ],
    [ "384c/seconds", "144 Kbps" ],
    [ "5897 mbit / sec", "5.9 Gbps" ],
    [ "5897 ybps", "5897 Ybps" ],
    [ "58975 m", "59 Gbps" ],
    [ "64214621 kb / sec", "64 Gbps" ],
    [ "789547652134387434", "790 Pbps" ],
  ];


  ca_human_bitrate_tests.forEach(function (pa_args) {

    const li_bitrate = pa_args[0];
    const ls_conversion = pa_args[1];

    describe(`f_human_bitrate(${li_bitrate})`, function() {
      it(`should return [${ls_conversion}]`, function() {
        cm_expect(f_human_bitrate(li_bitrate)).to.equal(ls_conversion);
      });
    });
  });
});




describe("f_human_datasize", function() {

  const ca_human_datasize_tests = [
    [ 98745782211447, "99 TBytes" ],
    [ 654544651587, "655 GBytes" ],
    [ 39987456721, "40 GBytes" ],
    [ 31536005874, "32 GBytes" ],
    [ 31535900000, "32 GBytes" ],
    [ 9987456721, "10 GBytes" ],
    [ 7387456721, "7.4 GBytes" ],
    [ 476548584, "477 MBytes" ],
    [ 86400000, "86 MBytes" ],
    [ 35489667, "35 MBytes" ],
    [ 3600000, "3.6 MBytes" ],
    [ 324815, "325 KBytes" ],
    [ 78956, "79 KBytes" ],
    [ 60000, "60 KBytes" ],
    [ 4574, "4.6 KBytes" ],
    [ 3873, "3.9 KBytes" ],
    [ 3600, "3.6 KBytes" ],
    [ 3500, "3.5 KBytes" ],
    [ 1234, "1.2 KBytes" ],
    [ 445, "445 Bytes" ],
    [ 1, "1 Bytes" ],
    [ 0, "0 Bytes" ],


    [ "1.3 P", "1.3 PBytes" ],
    [ "1.3 T", "1.3 TBytes" ],
    [ "1.3 T", "1.3 TBytes" ],
    [ "1.3 Tb", "1.3 TBytes" ],
    [ "1.3 Tbyte", "1.3 TBytes" ],
    [ "1.34 E", "1.3 EBytes" ],
    [ "1.5 Gb", "1.5 GBytes" ],
    [ "1000000", "1 MBytes" ],
    [ "1024000 k", "1 GBytes" ],
    [ "1024000", "1 MBytes" ],
    [ "1025000 k", "1 GBytes" ],
    [ "1286.4789t", "1.3 PBytes" ],
    [ "1536 Kbyte", "1.5 MBytes" ],
    [ "15487 z", "15 YBytes" ],
    [ "1789.254 eb", "1.8 ZBytes" ],
    [ "1984 Mb", "2 GBytes" ],
    [ "1984 Mb", "2 GBytes" ],
    [ "1984Mb ", "2 GBytes" ],
    [ "1984Mb", "2 GBytes" ],
    [ "2.4Gb", "2.4 GBytes" ],
    [ "200000 b", "200 KBytes" ],
    [ "200000 b ", "200 KBytes" ],
    [ "200000 byte", "200 KBytes" ],
    [ "23456 k", "23 MBytes" ],
    [ "5897 m ", "5.9 GBytes" ],
    [ "5897 ybyte", "5897 YBytes" ],
    [ "58975 m", "59 GBytes" ],
    [ "64214621 kb ", "64 GBytes" ],
    [ "789547652134387434", "790 PBytes" ],
  ];


  ca_human_datasize_tests.forEach(function (pa_args) {

    const li_datasize = pa_args[0];
    const ls_conversion = pa_args[1];

    describe(`f_human_datasize(${li_datasize})`, function() {
      it(`should return [${ls_conversion}]`, function() {
        cm_expect(f_human_datasize(li_datasize)).to.equal(ls_conversion);
      });
    });
  });
})
