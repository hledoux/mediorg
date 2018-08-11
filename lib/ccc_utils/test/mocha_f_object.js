const cm_expect = require("chai").expect;

const {
  f_object_extend
} = require("ccc_utils");



describe("f_object...", function() {

  const ch_a = {
    attr_1: "attr_1_a",
    attr_2: "attr_2_a",
    attr_3: "attr_3_a", // <==
    attr_4: "attr_4_a"
  };

  const ch_b = {
    attr_1: "attr_1_b", // <==
    attr_2: null,
    attr_3: undefined,
    attr_4: "attr_4_b"
  };

  const ch_c = {
    attr_1: undefined,
    attr_2: "attr_2_c", // <==
    attr_3: null,
    attr_4: "" // <==
  };


  describe("Object.assign", function() {
    it("reference implementation: Object.assign(...)", function() {
      cm_expect(Object.assign(ch_a, ch_b, ch_c)).to.have.own.property("attr_1", undefined);
      cm_expect(Object.assign(ch_a, ch_b, ch_c)).to.have.own.property("attr_2", "attr_2_c");
      cm_expect(Object.assign(ch_a, ch_b, ch_c)).to.have.own.property("attr_3", null);
      cm_expect(Object.assign(ch_a, ch_b, ch_c)).to.have.own.property("attr_4", "");
    });
  });

  describe("f_object_extend", function() {
    it("our own implementation of Object.assign(): f_object_extend(...)", function() {
      cm_expect(f_object_extend(ch_a, ch_b, ch_c)).to.have.own.property("attr_1", undefined);
      cm_expect(f_object_extend(ch_a, ch_b, ch_c)).to.have.own.property("attr_2", "attr_2_c");
      cm_expect(f_object_extend(ch_a, ch_b, ch_c)).to.have.own.property("attr_3", null);
      cm_expect(f_object_extend(ch_a, ch_b, ch_c)).to.have.own.property("attr_4", "");
    });
  });

});
