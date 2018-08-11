const cm_expect = require("chai").expect;

const {
  f_string_is_blank,
  f_string_is_not_blank,
  f_string_is_blank_or_null,
  f_string_is_neither_blank_nor_null,
  f_stringify,
  f_string_trim,
  f_string_truncate,
  f_string_remove_trailing_slash,
  f_string_cmp,
  f_string_pad_right,
  f_string_pad_left,
  f_string_is_email_address,
  f_string_is_url,
  f_string_is_html_fragment
} = require("ccc_utils");



describe("f_string_...", function() {

  describe("f_string_is_blank", function() {
    it("detects empty content (undefined, null, only blanks)", function() {
      cm_expect(f_string_is_blank("   ")).to.equal(true);
      cm_expect(f_string_is_blank("")).to.equal(true);
      cm_expect(f_string_is_blank("\t\r\n ")).to.equal(true);
      cm_expect(f_string_is_blank("not empty")).to.equal(false);
      cm_expect(f_string_is_blank(null)).to.equal(true);
      cm_expect(f_string_is_blank(undefined)).to.equal(true);
    });
  });


  describe("f_string_is_not_blank", function() {
    it("the exact opposite of f_string_is_blank(...)", function() {
      cm_expect(f_string_is_not_blank("   ")).to.equal(false);
      cm_expect(f_string_is_not_blank("")).to.equal(false);
      cm_expect(f_string_is_not_blank("\t\r\n ")).to.equal(false);
      cm_expect(f_string_is_not_blank("not empty")).to.equal(true);
      cm_expect(f_string_is_not_blank(null)).to.equal(false);
      cm_expect(f_string_is_not_blank(undefined)).to.equal(false);
    });
  });


  describe("f_string_is_blank_or_null", function() {
    it("a variant of f_string_is_blank(...) that also includes special markers [null] and [-]", function() {
      cm_expect(f_string_is_blank_or_null("   ")).to.equal(true);
      cm_expect(f_string_is_blank_or_null("")).to.equal(true);
      cm_expect(f_string_is_blank_or_null("-")).to.equal(true);
      cm_expect(f_string_is_blank_or_null("NULL")).to.equal(true);
      cm_expect(f_string_is_blank_or_null("Null")).to.equal(true);
      cm_expect(f_string_is_blank_or_null("\t\r\n ")).to.equal(true);
      cm_expect(f_string_is_blank_or_null("not empty")).to.equal(false);
      cm_expect(f_string_is_blank_or_null("null")).to.equal(true);
      cm_expect(f_string_is_blank_or_null(null)).to.equal(true);
      cm_expect(f_string_is_blank_or_null(undefined)).to.equal(true);
    });
  });


  describe("f_string_is_neither_blank_nor_null", function() {
    it("the exact opposite of f_string_is_blank_or_null(...)", function() {
      cm_expect(f_string_is_neither_blank_nor_null("   ")).to.equal(false);
      cm_expect(f_string_is_neither_blank_nor_null("")).to.equal(false);
      cm_expect(f_string_is_neither_blank_nor_null("-")).to.equal(false);
      cm_expect(f_string_is_neither_blank_nor_null("NULL")).to.equal(false);
      cm_expect(f_string_is_neither_blank_nor_null("Null")).to.equal(false);
      cm_expect(f_string_is_neither_blank_nor_null("\t\r\n ")).to.equal(false);
      cm_expect(f_string_is_neither_blank_nor_null("not empty")).to.equal(true);
      cm_expect(f_string_is_neither_blank_nor_null("null")).to.equal(false);
      cm_expect(f_string_is_neither_blank_nor_null(null)).to.equal(false);
      cm_expect(f_string_is_neither_blank_nor_null(undefined)).to.equal(false);
    });
  });


  describe("f_stringify", function() {
    it("convert into a true string - do nothing on null / undefined, except when forced", function() {
      cm_expect(f_stringify("toto")).to.equal("toto");
      cm_expect(f_stringify(26)).to.equal("26");
      cm_expect(f_stringify(null)).to.equal(null);
      cm_expect(f_stringify(null, true)).to.equal("");
      cm_expect(f_stringify(undefined)).to.equal(null);
      cm_expect(f_stringify(undefined, true)).to.equal("");
    });
  });


  describe("f_string_trim", function() {
    it("remove leading / trailing blanks - do nothing on null / undefined", function() {
      cm_expect(f_string_trim("  \r\n\ttoto  \r\t\n  ")).to.equal("toto");
      cm_expect(f_string_trim(null)).to.equal(null);
      cm_expect(f_string_trim(undefined)).to.equal(undefined);
    });
  });


  describe("f_string_truncate", function() {
    it("returns the argument, truncated to the given length - do nothing on null / undefined", function() {
      cm_expect(f_string_truncate("I'm a poor lonesome cowbow, and I've a long long way from home", 28, ' !')).to.equal("I'm a poor lonesome cowbow !");
      cm_expect(f_string_truncate("I'm a poor lonesome cowbow, and I've a long long way from home", 29)).to.equal("I'm a poor lonesome cowbow...");
      cm_expect(f_string_truncate(null)).to.equal(null);
      cm_expect(f_string_truncate(undefined)).to.equal(undefined);
    });
  });


  describe("f_string_remove_trailing_slash", function() {
    it("returns the argument, after removeing the trailing slash is any - do nothing on null / undefined", function() {
      cm_expect(f_string_remove_trailing_slash("https://gini.equant.com")).to.equal("https://gini.equant.com");
      cm_expect(f_string_remove_trailing_slash("https://gini.equant.com/")).to.equal("https://gini.equant.com");
      cm_expect(f_string_remove_trailing_slash(null)).to.equal(null);
      cm_expect(f_string_remove_trailing_slash(undefined)).to.equal(undefined);
    });
  });


  describe("f_string_cmp", function() {
    it("the JS version of C function strcmp(...)", function() {
      cm_expect(f_string_cmp("", null)).to.equal(0);
      cm_expect(f_string_cmp("a", "b")).to.equal(-1);
      cm_expect(f_string_cmp("a", null)).to.equal(+1);
      cm_expect(f_string_cmp("b", "a")).to.equal(+1);
      cm_expect(f_string_cmp(null, "")).to.equal(0);
      cm_expect(f_string_cmp(null, "a")).to.equal(-1);
      cm_expect(f_string_cmp(null, null)).to.equal(0);
      cm_expect(f_string_cmp(null, undefined)).to.equal(0);
      cm_expect(f_string_cmp(undefined, null)).to.equal(0);
    });
  });


  describe("f_string_pad_right", function() {
    it("right-pad with the extension until the expected length", function() {
      cm_expect(f_string_pad_right("toto", "x", 5)).to.equal("totox");
      cm_expect(f_string_pad_right(32, "x", 5)).to.equal("32xxx");
      cm_expect(f_string_pad_right(null, "x", 5)).to.equal("xxxxx");
      cm_expect(f_string_pad_right(undefined, "x", 5)).to.equal("xxxxx");
    });
  });


  describe("f_string_pad_left", function() {
    it("left-pad with the extension until the expected length", function() {
      cm_expect(f_string_pad_left(32, "x", 5)).to.equal("xxx32");
      cm_expect(f_string_pad_left(null, "x", 5)).to.equal("xxxxx");
      cm_expect(f_string_pad_left(undefined, "x", 5)).to.equal("xxxxx");
    });
  });


  describe("f_string_is_email_address", function() {
    it("the argument looks like a valid e-mail address", function() {
      cm_expect(f_string_is_email_address(" herve.ledoux@orange.com")).to.equal(false);
      cm_expect(f_string_is_email_address("")).to.equal(false);
      cm_expect(f_string_is_email_address("burp")).to.equal(false);
      cm_expect(f_string_is_email_address("gini.ecs@orange.com")).to.equal(true);
      cm_expect(f_string_is_email_address("gini@orange.com")).to.equal(true);
      cm_expect(f_string_is_email_address("herve.ledoux")).to.equal(false);
      cm_expect(f_string_is_email_address("herve.ledoux@orange.com ")).to.equal(false);
      cm_expect(f_string_is_email_address("herve.ledoux@orange.com")).to.equal(true);
      cm_expect(f_string_is_email_address("jean-marie.thuot@orange.com")).to.equal(true);
      cm_expect(f_string_is_email_address("serge1.girardin@orange.com")).to.equal(true);
      cm_expect(f_string_is_email_address("x@orange.com")).to.equal(false);
      cm_expect(f_string_is_email_address(null)).to.equal(false);
      cm_expect(f_string_is_email_address(undefined)).to.equal(false);
    });
  });


  describe("f_string_is_url", function() {
    it("the argument looks like a valid URL (http://... etc.)", function() {
      cm_expect(f_string_is_url("   ")).to.equal(false);
      cm_expect(f_string_is_url("ftp://some.host.net/this/is/the/path")).to.equal(true);
      cm_expect(f_string_is_url("http://gini.equant.com")).to.equal(true);
      cm_expect(f_string_is_url("https://gini.equant.com/path/to?blablabla")).to.equal(true);
      cm_expect(f_string_is_url(null)).to.equal(false);
      cm_expect(f_string_is_url(undefined)).to.equal(false);
    });
  });


  describe("f_string_is_html_fragment", function() {
    it("the argument looks like a fragment enclosed between two HTML tags", function() {
      cm_expect(f_string_is_html_fragment("  ")).to.equal(false);
      cm_expect(f_string_is_html_fragment(" \t\r\n <div> this is a text </div>  \t\r\n ")).to.equal(true);
      cm_expect(f_string_is_html_fragment("http://gini.equant.com")).to.equal(false);
      cm_expect(f_string_is_html_fragment(null)).to.equal(false);
      cm_expect(f_string_is_html_fragment(undefined)).to.equal(false);
    });
  });

});
