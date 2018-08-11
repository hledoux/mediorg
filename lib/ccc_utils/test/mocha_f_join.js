const cm_expect = require("chai").expect;

const {
  f_join,
  f_join_defined_vals,
  f_join_non_blank_vals
} = require("ccc_utils");


describe("f_join...", function() {

  const cs_sep = "-"

  const ca_list_0 = [ ];
  const ca_list_1 = [ "a", "b", "c", "d", "e" ];
  const ca_list_2 = [ "a", null, "b", undefined, "c", "", "d", "e" ];

  describe(`f_join`, function() {
    it("concatenates any sequence of arguments with the given separator", function() {
      cm_expect(f_join(cs_sep)).to.equal("");
      cm_expect(f_join(cs_sep, "a", "b", "c", "d", "e")).to.equal("a-b-c-d-e");
      cm_expect(f_join(cs_sep, "a", null, "b", undefined, "c", "", "d", "e")).to.equal("a-null-b-undefined-c--d-e");

      cm_expect(f_join(cs_sep, ca_list_0)).to.equal("");
      cm_expect(f_join(cs_sep, ca_list_1)).to.equal("a-b-c-d-e");
      cm_expect(f_join(cs_sep, ca_list_2)).to.equal("a-null-b-undefined-c--d-e");

      cm_expect(f_join(cs_sep, "a", null, "b", undefined, "c", "", "d", "e", ca_list_2)).to.equal("a-null-b-undefined-c--d-e-a-null-b-undefined-c--d-e");
    });
  });

  describe(`f_join_defined_vals`, function() {
    it("special version of f_join(..) that retain only the values that are f_is_defined(...)", function() {
      cm_expect(f_join_defined_vals(cs_sep)).to.equal("");
      cm_expect(f_join_defined_vals(cs_sep, "a", "b", "c", "d", "e")).to.equal("a-b-c-d-e");
      cm_expect(f_join_defined_vals(cs_sep, "a", null, "b", undefined, "c", "", "d", "e")).to.equal("a-b-c--d-e");

      cm_expect(f_join_defined_vals(cs_sep, ca_list_0)).to.equal("");
      cm_expect(f_join_defined_vals(cs_sep, ca_list_1)).to.equal("a-b-c-d-e");
      cm_expect(f_join_defined_vals(cs_sep, ca_list_2)).to.equal("a-b-c--d-e");

      cm_expect(f_join_defined_vals(cs_sep, "a", null, "b", undefined, "c", "", "d", "e", ca_list_2)).to.equal("a-b-c--d-e-a-b-c--d-e");
    });
  });

  describe(`f_join_non_blank_vals`, function() {
    it("special version of f_join(..) that retain only the values that are f_string_is_not_blank(...)", function() {
      cm_expect(f_join_non_blank_vals(cs_sep)).to.equal("");
      cm_expect(f_join_non_blank_vals(cs_sep, "a", "b", "c", "d", "e")).to.equal("a-b-c-d-e");
      cm_expect(f_join_non_blank_vals(cs_sep, "a", null, "b", undefined, "c", "", "d", "e")).to.equal("a-b-c-d-e");

      cm_expect(f_join_non_blank_vals(cs_sep, ca_list_0)).to.equal("");
      cm_expect(f_join_non_blank_vals(cs_sep, ca_list_1)).to.equal("a-b-c-d-e");
      cm_expect(f_join_non_blank_vals(cs_sep, ca_list_2)).to.equal("a-b-c-d-e");

      cm_expect(f_join_non_blank_vals(cs_sep, "a", null, "b", undefined, "c", "", "d", "e", ca_list_2)).to.equal("a-b-c-d-e-a-b-c-d-e");
    });
  });
});
