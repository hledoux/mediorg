const cm_expect = require("chai").expect;


const {
  f_console_stringify
} = require("ccc_console");


const {
  f_digest_md5_hex,
  f_digest_sha1_hex,
  f_digest_sha256_hex
} = require("ccc_utils");


const ca_test_list = [
  [ f_digest_md5_hex, "d41d8cd98f00b204e9800998ecf8427e", "" ],
  [ f_digest_md5_hex, f_digest_md5_hex(""), null ],
  [ f_digest_md5_hex, f_digest_md5_hex(""), undefined ],
  [ f_digest_md5_hex, "eefde70a4a3c5afdde3f2deac5a4954a", "herve" ],
  [ f_digest_md5_hex, f_digest_md5_hex("abcd"), "a", "b", "c", "d" ],
  [ f_digest_md5_hex, f_digest_md5_hex("abcd"), [ "a", "b", "c", "d" ] ],

  [ f_digest_sha1_hex, "da39a3ee5e6b4b0d3255bfef95601890afd80709", "" ],
  [ f_digest_sha1_hex, f_digest_sha1_hex(""), null ],
  [ f_digest_sha1_hex, f_digest_sha1_hex(""), undefined ],
  [ f_digest_sha1_hex, "8fee7024c1c229f92f581b7a3ac583298f1aad8b", "herve" ],
  [ f_digest_sha1_hex, f_digest_sha1_hex("abcd"), "a", "b", "c", "d" ],
  [ f_digest_sha1_hex, f_digest_sha1_hex("abcd"), [ "a", "b", "c", "d" ] ],

  [ f_digest_sha256_hex, "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "" ],
  [ f_digest_sha256_hex, f_digest_sha256_hex(""), null ],
  [ f_digest_sha256_hex, f_digest_sha256_hex(""), undefined ],
  [ f_digest_sha256_hex, "4bdecf0b75b228fe6b9182c3f54c85c4169cfacc13496ce5c0e21af20199c9a0", "herve" ],
  [ f_digest_sha256_hex, f_digest_sha256_hex("abcd"), "a", "b", "c", "d" ],
  [ f_digest_sha256_hex, f_digest_sha256_hex("abcd"), [ "a", "b", "c", "d" ] ],
];


describe("f_digest_...", function() {

  ca_test_list.forEach(function (pa_args) {
    const cf_function = pa_args[0];
    const cs_to = pa_args[1];
    const ca_from = pa_args.slice(2);

    const cs_function = cf_function.name;

    describe(`${cs_function}(${f_console_stringify(ca_from)})`, function() {
      it(`should return [${f_console_stringify(cs_to)}]`, function() {
        cm_expect(cf_function.apply(cf_function, ca_from)).to.equal(cs_to);
      });
    });
  });

});
