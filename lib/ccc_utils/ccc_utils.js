// http://jslint.com/

/*jslint fudge, white, node */


(function () {
  "use strict";

  const cm_crypto = require("crypto");
  const cm_path = require("path");

  const {
    f_console_error,
    f_console_fatal
  } = require("ccc_console");


  const cs_utils_ext_js = ".js";
  const cs_utils_prog_name = cm_path.basename(process.argv0, cs_utils_ext_js);

  // ********************************************************************
  //  - DEFINED ?
  // ********************************************************************

  // return true when the argument is neither undefined nor null
  function f_is_defined(po_value) {
    return((po_value !== null) &&
           (po_value !== undefined) &&
           (po_value !== NaN));
  }


  // negation of [f_is_defined]
  function f_is_not_defined(po_value) {
    return(! f_is_defined(po_value));
  }


  // return true if the given argument is a real JS array
  function f_is_array(po_value) {
    return(f_is_defined(po_value) && (Array.isArray(po_value)));
  }


  // return true if the given argument is a real JS object
  function f_is_object(po_value) {
    // https://stackoverflow.com/questions/8511281/check-if-a-value-is-an-object-in-javascript
    return(f_is_defined(po_value) && (! f_is_array(po_value)) && (typeof(po_value) === "object"));
  }


  // return true if the given argument is NEITHER an array, NOR an object
  // null | undefined are considered here as scalars:
  // - null | undefined
  // - booleans true | false
  // - strings
  // - numbers
  //
  // a Date is NOT a scalar...
  function f_is_scalar(po_value) {
    return((! f_is_array(po_value)) && (! f_is_object(po_value)));
  }


  // ********************************************************************
  //  - REGEXP
  // ********************************************************************

  // return a stringyfied representation of [po_value] - or null
  function f_stringify(po_value, pb_always_force_string) {
    return(f_is_defined(po_value) ? String(po_value) : (pb_always_force_string ? "" : null));
  }


  // equivalent to Perl quotemeta(...) - escape Regexp operators
  function f_regexp_quotemeta(ps_test) {
    if (f_is_defined(ps_test)) {
      return(ps_test.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&"));
    }

    return(ps_test);
  }


  // a kind of safe replacement for [String.match(...)], with a
  // preliminary check that[ps_str] is really a valid string
  function f_regexp_match(ps_str, pr_regexp) {
    return((f_is_defined(ps_str)) &&
           (typeof(ps_str) === "string") &&
           (ps_str.match(pr_regexp)));
  }


  // always stringify argument [ps_str] before trying to apply the regexp
  // matching
  function f_regexp_string_match(ps_str, pr_regexp) {
    return(f_stringify(ps_str, true).match(pr_regexp));
  }




  // ********************************************************************
  //  - OBJECT
  // ********************************************************************


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //
  //  - return a brand new object made of the successive aggregations of the
  //    ones passed as arguments in [pa_var_args] - one the first-level
  //    attributes are considered
  //
  //    this is a wrapper around [Object.assign(cible, ...sources)]
  //
  //  ARGUMENTS :
  //  - a list of objects (depth: 1)
  //  RETURN VALUE :
  //  - a single brand new object, with a depth of 1
  //  HISTORY :
  //  - Creation          : Mon Jan 29 09:25:17 2018 - Herve Ledoux on LDEV
  //  - Last modification : Mon Jan 29 09:25:17 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_object_extend(...pa_var_args) {
    let lh_result = {};

    pa_var_args.forEach(function (ph_one_obj) {
      if (f_is_defined(ph_one_obj)) {
        Object.assign(lh_result, ph_one_obj);
      }
    });

    return(lh_result);
  }



  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - iterate over the pairs (key => value) of this object
  //  ARGUMENTS :
  //  - ph_obj: the object to iterate through
  //  - pf_iterator: function (ps_key, px_value) { ... }
  //  RETURN VALUE :
  //  - none
  //  HISTORY :
  //  - Creation          : Wed Jul  4 15:49:17 2018 - Herve Ledoux on DDEV
  //  - Last modification : Wed Jul  4 19:02:57 2018 - Herve Ledoux on DDEV
  // ********************************************************************
  function f_object_iterate(ph_obj, pf_iterator) {
    if (f_is_defined(ph_obj) && f_is_defined(pf_iterator)) {
      Object.keys(ph_obj).forEach(function(ps_one_key) {
        pf_iterator(ps_one_key, ph_obj[ps_one_key]);
      });
    }
  }


  // ********************************************************************
  //  - STRINGS
  // ********************************************************************

  // Return true if arg is undef | null | made only of blank characters
  const _cr_string_blank = /^\s*$/;
  function f_string_is_blank(ps_value) {
    // Trivial cases
    if (ps_value === null) {
      return(true);
    }

    if (ps_value === undefined) {
      return(true);
    }

    if (ps_value === NaN) {
      return(true);
    }

    if (ps_value === "") {
      return(true);
    }

    return(_cr_string_blank.test(ps_value));
  }


  // Similar to [f_string_is_blank] - also return true for the special value "null"
  const _cr_string_blank_or_null = /^\s*(?:-|null)\s*$/i;
  function f_string_is_blank_or_null(ps_value) {

    if (f_string_is_blank(ps_value)) {
      return(true);
    }

    return(_cr_string_blank_or_null.test(ps_value));
  }


  // negation of [f_string_is_blank]
  function f_string_is_not_blank(ps_value) {
    return(! f_string_is_blank(ps_value));
  }


  // negation of [f_string_is_blank_or_null]
  function f_string_is_neither_blank_nor_null(ps_value) {
    return(! f_string_is_blank_or_null(ps_value));
  }


  // remove leading / trailing blanks - with proper handling of null | undefined
  function f_string_trim(ps_value) {
    if (f_is_not_defined(ps_value)) {
      return(ps_value);
    }

    return(ps_value.trim());
  }


  // When needed, truncate [ps_long_value] to the given [pi_max_len] max
  // length, and append [ps_pad_with] to mark the truncation
  function f_string_truncate(ps_long_value, pi_max_len, ps_pad_with) {

    if ((ps_long_value) &&
        (pi_max_len)) {
      if (f_is_not_defined(ps_pad_with)) {
        ps_pad_with = "...";
      }

      if (ps_long_value.length > pi_max_len) {
        ps_long_value = (ps_long_value.substr(0, (pi_max_len - ps_pad_with.length)) + ps_pad_with);
      }
    }

    return(ps_long_value);
  }


  function f_string_remove_trailing_slash(ps_value) {
    if (f_string_is_not_blank(ps_value)) {
      return(ps_value.replace(/\/$/, ""));
    }

    return(ps_value);
  }


  function f_string_cmp(ps_a, ps_b) {
    if (f_string_is_blank(ps_a) && f_string_is_blank(ps_b)){
      return(0);
    }

    if (f_string_is_blank(ps_a)) {
      return(-1);
    }

    if (f_string_is_blank(ps_b)) {
      return(1);
    }

    return(ps_a.localeCompare(ps_b));
  }


  function f_string_pad_right(ps_str, ps_chr, pi_len) {
    ps_str = f_stringify(ps_str, true);
    ps_chr = f_stringify(ps_chr, true);

    while (ps_str.length < pi_len) {
      ps_str = ps_str.concat(ps_chr);
    }

    return(ps_str.substr(0, pi_len));
  }


  function f_string_pad_left(ps_str, ps_chr, pi_len) {
    ps_str = f_stringify(ps_str, true);
    ps_chr = f_stringify(ps_chr, true);

    while (ps_str.length < pi_len) {
      ps_str = ps_chr.concat(ps_str);
    }

    return(ps_str.substr(0, pi_len));
  }


  function f_string_is_email_address(ps_str) {
    return(Boolean(f_regexp_match(ps_str, /^(?:[a-zA-Z][\w\-\.]+@[a-zA-Z][\w\-\.]+)$/)));
  }


  function f_string_is_url(ps_str) {
    return(Boolean(f_regexp_match(ps_str, /^(https|http|ftp)\:\/\//)));
  }


  function f_string_is_html_fragment(ps_str) {
    return(Boolean(f_regexp_match(ps_str, /^\s*<\w+(.|\n)*>\s*$/)));
  }


  // ********************************************************************
  //  - BOOLEAN
  // ********************************************************************

  const _cr_is_false = /^\s*(0|off|false|no|non|f|n)\s*$/i;
  function f_is_false(px_value) {
    // Any undefined / null value is considered as false
    if (px_value === null) {
      return(true);
    }

    if (px_value === undefined) {
      return(true);
    }

    if (px_value === NaN) {
      return(true);
    }

    // Some optimizations
    if (px_value === 0) {
      return(true);
    }

    if (px_value === 1) {
      return(false);
    }

    if (px_value === false) {
      return(true);
    }

    if (px_value === true) {
      return(false);
    }

    if (px_value === "") {
      return(true);
    }

    if (typeof(px_value) === "object") {
      return(false);
    }

    // An empty string is considered as false
    if (f_string_is_blank_or_null(px_value)) {
      return(true);
    }

    // The final test
    return(_cr_is_false.test(px_value));
  }


  const _cr_is_true = /^\s*(\d+|on|true|yes|oui|t|y)\s*$/i;
  function f_is_true(px_value) {
    // Any undefined / null value is considered as false
    if (px_value === null) {
      return(false);
    }

    if (px_value === undefined) {
      return(false);
    }

    if (px_value === NaN) {
      return(false);
    }

    // Some optimizations
    if (px_value === 0) {
      return(false);
    }

    if (px_value === 1) {
      return(true);
    }

    if (px_value === false) {
      return(false);
    }

    if (px_value === true) {
      return(true);
    }

    if (px_value === "") {
      return(false);
    }

    if ((typeof(px_value) === "number") && ((px_value > 0) || (px_value < 0))) {
      return(true);
    }

    if (typeof(px_value) === "object") {
      return(true);
    }

    // The final test
    return((! f_is_false(px_value)) && (_cr_is_true.test(px_value)));
  }


  // ********************************************************************
  //  - GET FIRST...
  // ********************************************************************

  // Return the first argument which is not null / undefined
  function f_get_first_def(...pa_vals) {
    let ls_next_val;

    while (pa_vals.length) {
      ls_next_val = pa_vals.shift();

      if (f_is_defined(ls_next_val)) {
        return(ls_next_val);
      }
    }

    // By default, return the last value
    return(ls_next_val);
  }


  // Return the first argument with a non-empty value
  function f_get_first_val(...pa_vals) {
    let ls_next_val;

    while (pa_vals.length) {
      ls_next_val = pa_vals.shift();

      if (f_string_is_not_blank(ls_next_val)) {
        return(ls_next_val);
      }
    }

    // By default, return the last value
    return(ls_next_val);
  }


  function _f_joiner(ps_sep, pf_filter_each_value, pa_vals) {
    let ls_result = "";
    let li_joined = 0;

    function lf_join_one_scalar(ps_val) {
      if (pf_filter_each_value(ps_val)) {
        ls_result += (((li_joined > 0) ? ps_sep : "") + ps_val);
        li_joined += 1;
      }
    }

    function lf_join_iterator(px_val) {
      if (f_is_array(px_val)) {
        px_val.forEach(lf_join_iterator);
      }

      else if (f_is_scalar(px_val)) {
        lf_join_one_scalar(px_val);
      }
    }

    pa_vals.forEach(lf_join_iterator);

    return(ls_result);
  }


  // powerful alternative to [ ... ].join(...)
  function f_join(ps_sep, ...pa_vals) {
    return(_f_joiner(ps_sep, function() { return(true); }, pa_vals));
  }


  // join only the values that are [f_is_defined(...)] - arguments can
  // be a series of scalars or arrays
  function f_join_defined_vals(ps_sep, ...pa_vals) {
    return(_f_joiner(ps_sep, f_is_defined, pa_vals));
  }


  // join only the values that are [f_string_is_not_blank(...)] - arguments can
  // be a series of scalars or arrays
  function f_join_non_blank_vals(ps_sep, ...pa_vals) {
    return(_f_joiner(ps_sep, f_string_is_not_blank, pa_vals));
  }


  // ********************************************************************
  //  - NUMBERS
  // ********************************************************************


  // Utilities [f_number_cmp] that can be used within the context of a call to
  // [Array.sort(...)]
  function f_number_cmp(pn_a, pn_b) {

    // undefined === undefined
    if (f_is_not_defined(pn_a) && f_is_not_defined(pn_b)) {
      return(0);
    }

    // undefined < anything
    if (f_is_not_defined(pn_a)) {
      return(-1);
    }

    // anything > undefined
    if (f_is_not_defined(pn_b)) {
      return(1);
    }

    return((pn_a < pn_b) ? -1 : ((pn_a > pn_b) ? 1 : 0));
  }

  const _cr_number_is_valid = /^(?:[\-+]\s*)?\d+(\.\d+)?$/;
  function f_number_is_valid(ps_text) {

    // trivial cases
    if (f_string_is_blank(ps_text)) {
      return(false);
    }

    return(_cr_number_is_valid.test(ps_text));
  }


  function f_number_max(...pa_args) {
    let li_result = null;
    pa_args.forEach(function (pn_val) {

      // ignore in the list of values the ones that are undefined / invalid
      if (! f_number_is_valid(pn_val)) {
        return;
      }

      // first element of the list
      if (f_is_not_defined(li_result)) {
        li_result = pn_val;
        return;
      }

      // when thi selement of the list is greater than the current max, it becomes the new max
      if (pn_val > li_result) {
        li_result = pn_val;
        return;
      }
    });

    return(li_result);
  }


  function f_number_min(...pa_args) {
    let li_result = null;
    pa_args.forEach(function (pn_val) {

      // ignore in the list of values the ones that are undefined / invalid
      if (! f_number_is_valid(pn_val)) {
        return;
      }

      // first element of the list
      if (f_is_not_defined(li_result)) {
        li_result = pn_val;
        return;
      }

      // when thi selement of the list is greater than the current min, it becomes the new min
      if (pn_val < li_result) {
        li_result = pn_val;
        return;
      }
    });

    return(li_result);
  }



  // attempt to parser [ps_raw_value] into a valid number
  // return null otherwise
  function f_number_parse(ps_raw_value) {
    if (f_string_is_blank(ps_raw_value)) {
      return(null);
    }

    const ln_result = Number.parseFloat(ps_raw_value.replace(/\s+/g, ""));
    if (Number.isNaN(ln_result)) {
      return(null);
    }

    return(ln_result);
  }



  // round [pn_val] to [pi_prec] decimal digits
  function f_number_round_with_precision(pn_val, pi_prec) {
    let li_factor = Math.pow(10, pi_prec);
    return(Math.round(pn_val * li_factor) / li_factor);
  }



  // ********************************************************************
  //  - DATE
  // ********************************************************************

  function _f_date_get_default(pd_date) {

    // Default date ==> now
    if (! pd_date) {
      pd_date = new Date();
    }

    return(pd_date);
  }


  function f_date_now_ms() {
    return(Date.now());
  }


  function f_date_format_YYYYMMDD(pd_date, ps_sep_date) {
    pd_date = _f_date_get_default(pd_date);
    return(pd_date.getUTCFullYear() + ps_sep_date +
           f_string_pad_left(pd_date.getUTCMonth() + 1, "0", 2) + ps_sep_date +
           f_string_pad_left(pd_date.getUTCDate(), "0", 2));
  }


  function f_date_format_YYYYMMDDhhmmss(pd_date, ps_sep_date, ps_sep_time, ps_sep_parts) {
    pd_date = _f_date_get_default(pd_date);
    return(pd_date.getUTCFullYear() + ps_sep_date +
           f_string_pad_left(pd_date.getUTCMonth() + 1, "0", 2) + ps_sep_date +
           f_string_pad_left(pd_date.getUTCDate(), "0", 2) + ps_sep_parts +
           f_string_pad_left(pd_date.getUTCHours(), "0", 2) + ps_sep_time +
           f_string_pad_left(pd_date.getUTCMinutes(), "0", 2) + ps_sep_time +
           f_string_pad_left(pd_date.getUTCSeconds(), "0", 2));
  }


  function f_date_format_YYYYMMDDhhmmssms(pd_date, ps_sep_date, ps_sep_time, ps_sep_parts) {
    pd_date = _f_date_get_default(pd_date);
    return(pd_date.getUTCFullYear() + ps_sep_date +
           f_string_pad_left(pd_date.getUTCMonth() + 1, "0", 2) + ps_sep_date +
           f_string_pad_left(pd_date.getUTCDate(), "0", 2) + ps_sep_parts +
           f_string_pad_left(pd_date.getUTCHours(), "0", 2) + ps_sep_time +
           f_string_pad_left(pd_date.getUTCMinutes(), "0", 2) + ps_sep_time +
           f_string_pad_left(pd_date.getUTCSeconds(), "0", 2) + ps_sep_time +
           f_string_pad_left(pd_date.getUTCMilliseconds(), "0", 3));
  }


  // Return a timestamp in format
  // - [YYYY-MM-DDThh:mm:ss] when pb_compress is null | false
  // - [YYYYMMDDhhmmss] when pb_compress is true
  function f_date_format_iso(pd_date, pb_compress) {
    pb_compress = f_is_true(pb_compress);
    return(f_date_format_YYYYMMDDhhmmss(pd_date,
                                        (pb_compress ? "" : "-"), // ps_sep_date
                                        (pb_compress ? "" : ":"), // ps_sep_time
                                        (pb_compress ? "" : "T")));
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - Parse a duration in natural language, an return the equivalent in milliseconds
  //  ARGUMENTS :
  //  -
  //  RETURN VALUE :
  //  - null when not able to parse - otherwise the duration expressed in milliseconds
  //  HISTORY :
  //  - Creation          : Fri Aug 10 08:32:13 2018 - Herve Ledoux on DDEV
  //  - Last modification : Fri Aug 10 08:32:13 2018 - Herve Ledoux on DDEV
  // ********************************************************************
  function f_duration_parse_ms(ps_raw_text) {
    if (f_string_is_blank(ps_raw_text)) {
      return(null);
    }

    const cs_replace_token = " ";

    let ls_duration_text = (

      // work in lower case
      f_case_lower(ps_raw_text)

      // replace / remove well-known keywords
        .replace(/\s+(?:and|plus|with)\s+/g, cs_replace_token)

      // replace / remove well-known punctuation
        .replace(/\s*[,;\/]\s*/g, cs_replace_token));

    let li_result = 0;

    // for convertions, refer to:
    // https://www.calculateme.com/time/days/to-milliseconds/

    // milliseconds
    ls_duration_text = ls_duration_text.replace(/(\d+)\s*(?:milliseconds|millisecond|millis|milli|millisecs|millisec|ms)\b/g, function (ps_match, ps_grp1) {
      li_result += (1 * f_number_parse(ps_grp1));
      return(cs_replace_token);
    });

    // seconds
    ls_duration_text = ls_duration_text.replace(/(\d+)\s*(?:seconds|second|sec|s)\b/g, function (ps_match, ps_grp1) {
      li_result += (1000 * f_number_parse(ps_grp1));
      return(cs_replace_token);
    });

    // minutes
    ls_duration_text = ls_duration_text.replace(/(\d+)\s*(?:minutes|minute|min|m)\b/g, function (ps_match, ps_grp1) {
      li_result += (60000 * f_number_parse(ps_grp1));
      return(cs_replace_token);
    });

    // hours
    ls_duration_text = ls_duration_text.replace(/(\d+)\s*(?:hours|hour|hrs|hr|h)\b/g, function (ps_match, ps_grp1) {
      li_result += (3600000 * f_number_parse(ps_grp1));
      return(cs_replace_token);
    });

    // days
    ls_duration_text = ls_duration_text.replace(/(\d+)\s*(?:days|day|dy|d)\b/g, function (ps_match, ps_grp1) {
      li_result += (86400000 * f_number_parse(ps_grp1));
      return(cs_replace_token);
    });

    // weeks
    ls_duration_text = ls_duration_text.replace(/(\d+)\s*(?:weeks|week|wks|wk|w)\b/g, function (ps_match, ps_grp1) {
      li_result += (604800000 * f_number_parse(ps_grp1));
      return(cs_replace_token);
    });

    // months
    ls_duration_text = ls_duration_text.replace(/(\d+)\s*(?:months|month|mon|mos|mo|mths|mth)\b/g, function (ps_match, ps_grp1) {
      li_result += (2629746000 * f_number_parse(ps_grp1));
      return(cs_replace_token);
    });

    // years
    ls_duration_text = ls_duration_text.replace(/(\d+)\s*(?:years|year|yrs|yr|y)\b/g, function (ps_match, ps_grp1) {
      li_result += (31556952000 * f_number_parse(ps_grp1));
      return(cs_replace_token);
    });

    // normally, at the end of this parsing, everything should have been
    // extracted...
    ls_duration_text = f_string_trim(ls_duration_text);
    if (f_string_is_not_blank(ls_duration_text)) {
      throw `f_duration_parse_ms - unable to parse [${ls_duration_text}] in duration expression [${ps_raw_text}]`;
    }

    return(li_result);
  }



  // ********************************************************************
  //  - CONVERT
  // ********************************************************************

  // Parse a value like [15px], and return 15
  function f_convert_px_to_int(ps_px_value) {
    if (! f_string_is_blank(ps_px_value)) {
      let la_re_parts = ps_px_value.match(/^\s*(\d+)\s*px\s*/);
      if (la_re_parts) {
        return(parseInt(la_re_parts[0]));
      }
    }

    return(null);
  }


  // ********************************************************************
  //  - PROCESS
  // ********************************************************************



  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - return the name of the current program - the one found in the copmmand
  //    line, as extracted from process.argv0
  //  ARGUMENTS :
  //  - none
  //  RETURN VALUE :
  //  - process.argv0, after removing extension [.js] if present
  //  HISTORY :
  //  - Creation          : Thu Feb  1 11:55:39 2018 - Herve Ledoux on LDEV
  //  - Last modification : Thu Feb  1 11:55:39 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_get_prog_name() {
    return(cs_utils_prog_name);
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - delete the given environment variable [ps_var_name]
  //  ARGUMENTS :
  //  - ps_var_name
  //  RETURN VALUE :
  //  - null
  //  HISTORY :
  //  - Creation          : Tue Jan 23 08:57:03 2018 - Herve Ledoux on LDEV
  //  - Last modification : Tue Jan 23 08:57:03 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_env_del(ps_var_name) {
    if (f_string_is_blank(ps_var_name)) {
      f_console_fatal("f_env_del - empty argument [ps_var_name]");
    }

    delete(process.env[ps_var_name]);

    return(null);
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - fetch value of environment variable [ps_var_name]
  //  ARGUMENTS :
  //  - ps_var_name
  //  - ps_error_if_not_set (opt): when the given variable is not set / not defined, raise the given error
  //  RETURN VALUE :
  //  - the content of environment variable [ps_var_name]
  //  HISTORY :
  //  - Creation          : Tue Jan 23 08:47:51 2018 - Herve Ledoux on LDEV
  //  - Last modification : Tue Jan 23 08:47:51 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_env_get(ps_var_name, ps_error_if_not_set) {
    if (f_string_is_blank(ps_var_name)) {
      f_console_fatal("f_env_get - empty argument [ps_var_name]");
    }

    let ls_result = process.env[ps_var_name];

    if (f_is_defined(ps_error_if_not_set) &&
        f_string_is_blank(ls_result)) {
      f_console_error(`missing environment variable [${ps_var_name}] - ${ps_error_if_not_set}`);
    }

    return(ls_result);
  }



  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - define value of environment variable [ps_var_name]
  //  ARGUMENTS :
  //  - ps_var_name
  //  - ps_var_value
  //  RETURN VALUE :
  //  - ps_var_value
  //  HISTORY :
  //  - Creation          : Tue Jan 23 08:55:32 2018 - Herve Ledoux on LDEV
  //  - Last modification : Tue Jan 23 08:55:32 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_env_set(ps_var_name, ps_var_value) {
    if (f_string_is_blank(ps_var_name)) {
      f_console_fatal("f_env_set - empty argument [ps_var_name]");
    }

    // when [ps_var_name] is empty, this is equivalent to [f_env_del(...)]
    if (f_string_is_blank(ps_var_value)) {
      return(f_env_del(ps_var_name));
    }

    process.env[ps_var_name] = ps_var_value;

    return(ps_var_value);
  }




  // ********************************************************************
  //  - CHRONO
  // ********************************************************************


  // internal accessor to the table of chronometers
  let _gh_chronos = null;
  function _f_chrono_get(ps_chrono_name) {
    if (! _gh_chronos) {
      _gh_chronos = new Map();
    }

    let lh_result = _gh_chronos.get(ps_chrono_name);
    if (! lh_result) {
      lh_result = {
        ab_chrono_running: false,
        ai_chrono_register: 0,
        ai_chrono_start: null,
        as_chrono_name: ps_chrono_name
      };

      _gh_chronos.set(ps_chrono_name, lh_result);
    }

    return(lh_result);
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - start a chronometer
  //  ARGUMENTS :
  //  - ps_chrono_name: symbolic name
  //  - pb_reset (opt) : when true, clear any cumulative time
  //  RETURN VALUE :
  //  - current time (ms)
  //  HISTORY :
  //  - Creation          : Mon Jan 29 08:24:13 2018 - Herve Ledoux on LDEV
  //  - Last modification : Mon Jan 29 08:24:13 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_chrono_start(ps_chrono_name, pb_reset) {
    const lh_chrono = _f_chrono_get(ps_chrono_name);

    if (pb_reset) {
      lh_chrono.ab_chrono_running = false;
      lh_chrono.ai_chrono_register = 0;
    }

    if (! lh_chrono.ab_chrono_running) {
      lh_chrono.ab_chrono_running = true;
      lh_chrono.ai_chrono_start = f_date_now_ms();
    }

    return(lh_chrono.ai_chrono_start);
  }



  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - query the given chronometer
  //  ARGUMENTS :
  //  - ps_chrono_name
  //  - pb_destroy_chrono (opt) : after use, dispose / destroy this chronometer
  //  RETURN VALUE :
  //  - the total time (in ms) measured by the chronometer
  //  HISTORY :
  //  - Creation          : Mon Jan 29 08:25:33 2018 - Herve Ledoux on LDEV
  //  - Last modification : Mon Jan 29 08:25:33 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_chrono_elapsed_ms(ps_chrono_name, pb_destroy_chrono) {
    const lh_chrono = _f_chrono_get(ps_chrono_name);

    // remove the chronometer from the global table
    if (pb_destroy_chrono) {
      _gh_chronos.delete(ps_chrono_name);
    }

    return(lh_chrono.ai_chrono_register + ((lh_chrono.ab_chrono_running) ? (f_date_now_ms() - lh_chrono.ai_chrono_start) : 0));
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - stop the given chronometer - can be re-started later on, keeping
  //    cumulative time
  //  ARGUMENTS :
  //  - ps_chrono_name: symbolic name
  //  RETURN VALUE :
  //  - total elapsed time
  //  HISTORY :
  //  - Creation          : Tue Feb 20 13:55:17 2018 - Herve Ledoux on LDEV
  //  - Last modification : Tue Feb 20 13:55:17 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_chrono_stop(ps_chrono_name) {
    const lh_chrono = _f_chrono_get(ps_chrono_name);

    // still running ? cumulate the elapsed time, and stop it
    if (lh_chrono.ab_chrono_running) {
      lh_chrono.ab_chrono_running = false;
      lh_chrono.ai_chrono_register += (f_date_now_ms() - lh_chrono.ai_chrono_start);
      lh_chrono.ai_chrono_start = null;
    }

    return(f_chrono_elapsed_ms(ps_chrono_name));
  }




  // ********************************************************************
  //  - DIGESTS
  // ********************************************************************


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - a series of digests functions
  //  ARGUMENTS :
  //
  //  - pa_args: a variable list of elements to be hashed - can be a scalar, an
  //    array of scalars, an object, an array of objects
  //
  //  RETURN VALUE :
  //  - HASH(ps_value_to_hash)
  //  HISTORY :
  //  - Creation          : Mon Jan 29 09:11:00 2018 - Herve Ledoux on LDEV
  //  - Last modification : Mon Jan 29 09:11:00 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function _f_digest_method_format(ps_method, ps_format, pa_var_args) {
    let lo_hash = cm_crypto.createHash(ps_method);

    let lf_hash_one_arg;
    lf_hash_one_arg = function (px_arg) {

      // skip null / undefined
      if (px_arg === null) {
        return;
      }

      if (px_arg === undefined) {
        return;
      }

      if (px_arg === NaN) {
        return;
      }

      // native string
      if (typeof(px_arg) === "string") {
        lo_hash.update(px_arg);
        return;
      }

      // array
      if (f_is_array(px_arg)) {
        px_arg.forEach(lf_hash_one_arg);
        return;
      }

      // object
      if (typeof(px_arg) === "object") {
        Object.keys(px_arg).forEach(function(ps_one_key) {
          lf_hash_one_arg(ps_one_key);
          lf_hash_one_arg(px_arg[ps_one_key]);
        });
        return;
      }

      // ultimate catch-all
      lf_hash_one_arg(f_stringify(px_arg, true));
    };

    lf_hash_one_arg(pa_var_args);
    return(lo_hash.digest(ps_format));
  }

  function f_digest_md5_hex(...pa_var_args) {
    return(_f_digest_method_format("md5", "hex", pa_var_args));
  }

  function f_digest_sha1_hex(...pa_var_args) {
    return(_f_digest_method_format("sha1", "hex", pa_var_args));
  }

  function f_digest_sha256_hex(...pa_var_args) {
    return(_f_digest_method_format("sha256", "hex", pa_var_args));
  }




  // ********************************************************************
  //  - CASE: canel, snake,
  // ********************************************************************


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - upper / lower / capital that support null / undefined arguments
  //  ARGUMENTS :
  //  -
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Thu Feb  1 08:29:44 2018 - Herve Ledoux on LDEV
  //  - Last modification : Thu Feb  1 08:29:44 2018 - Herve Ledoux on LDEV
  // ********************************************************************

  // ==> UPPER
  function f_case_upper(ps_str) {
    return(f_string_is_blank(ps_str) ? ps_str : ps_str.toUpperCase());
  }

  // == lower
  function f_case_lower(ps_str) {
    return(f_string_is_blank(ps_str) ? ps_str : ps_str.toLowerCase());
  }

  // capitalize | CAPITALIZE ==> Capitalize
  function f_case_capitalize(ps_str) {
    if (f_string_is_not_blank(ps_str)) {
      return(ps_str
             .toLowerCase()
             .replace(/^([a-z])/, function(ignore, ps_1) {
               return(ps_1.toUpperCase());
             }));
    }

    return(ps_str);
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - a series of conversions between case conventions: snake_case, camelCase, kebab-case
  //  ARGUMENTS :
  //  - ps_str
  //  RETURN VALUE :
  //  - ps_str, after conversion to the requested case converntion
  //  HISTORY :
  //  - Creation          : Thu Feb  1 08:19:11 2018 - Herve Ledoux on LDEV
  //  - Last modification : Thu Feb  1 08:19:11 2018 - Herve Ledoux on LDEV
  // ********************************************************************

  function _f_case_to_format_case(ps_between_words, pf_each_word, pa_words) {
    if (f_is_not_defined(pa_words)) {
      return(pa_words);
    }

    return(f_join_non_blank_vals(ps_between_words, pa_words.map(pf_each_word)));
  }


  function _f_case_to_split_words(ps_str) {
    if (f_is_not_defined(ps_str)) {
      return(ps_str);
    }

    let la_words = [];

    ps_str
    // in case of fromPascalCase / fromCamelCase, introduce separation before
    // capital letters
      .replace(/([A-Z][a-z0-9]+)/g, " $1")


    // then extract the words, one by one
      .replace(/([A-Za-z][A-Za-z0-9]*)/g, function(ignore, ps_1) {
        la_words.push(ps_1);
        return(" ");
      });

    return(la_words);
  }

  const cs_case_sep_camel = "";
  const cs_case_sep_kebab = "-";
  const cs_case_sep_pascal = "";
  const cs_case_sep_snake = "_";
  const cs_case_sep_space = " ";


  // ==> Convert_To_Camel_Snake_Case
  function f_case_to_Camel_Snake_Case(ps_str) {
    return(_f_case_to_format_case(cs_case_sep_snake, f_case_capitalize, _f_case_to_split_words(ps_str)));
  }

  // ==> Convert-To-Http-Header-Case
  function f_case_to_Http_Header_Case(ps_str) {
    return(_f_case_to_format_case(cs_case_sep_kebab, f_case_capitalize, _f_case_to_split_words(ps_str)));
  }

  // ==> convert_to_snake_case
  function f_case_to_snake_case(ps_str) {
    return(_f_case_to_format_case(cs_case_sep_snake, f_case_lower, _f_case_to_split_words(ps_str)));
  }

  // ==> CONVERT_TO_SNAKE_CASE
  function f_case_to_SNAKE_CASE(ps_str) {
    return(_f_case_to_format_case(cs_case_sep_snake, f_case_upper, _f_case_to_split_words(ps_str)));
  }

  // ==> convert-to-kebab-case
  function f_case_to_kebab_case(ps_str) {
    return(_f_case_to_format_case(cs_case_sep_kebab, f_case_lower, _f_case_to_split_words(ps_str)));
  }

  // ==> CONVERT-TO-KEBAB-CASE
  function f_case_to_KEBAB_CASE(ps_str) {
    return(_f_case_to_format_case(cs_case_sep_kebab, f_case_upper, _f_case_to_split_words(ps_str)));
  }

  // ==> convertToCamelCase
  function f_case_to_camelCase(ps_str) {
    let li_word_count = 0;
    return(_f_case_to_format_case(cs_case_sep_camel, function(ps_value) {
      li_word_count += 1;
      if (li_word_count === 1) {
        return(f_case_lower(ps_value));
      }

      return(f_case_capitalize(ps_value));
    }, _f_case_to_split_words(ps_str)));
  }

  // ==> ConvertToPascalCase
  function f_case_to_PascalCase(ps_str) {
    return(_f_case_to_format_case(cs_case_sep_pascal, f_case_capitalize, _f_case_to_split_words(ps_str)));
  }

  // ==> convert to space case
  function f_case_to_space_case(ps_str) {
    return(_f_case_to_format_case(cs_case_sep_space, f_case_lower, _f_case_to_split_words(ps_str)));
  }

  // ==> CONVERT TO SPACE CASE
  function f_case_to_SPACE_CASE(ps_str) {
    return(_f_case_to_format_case(cs_case_sep_space, f_case_upper, _f_case_to_split_words(ps_str)));
  }



  // ********************************************************************
  //  - make readable for human
  // ********************************************************************

  const cs_duration_zero = "null duration";

  const _ch_time_part_names = {
    year_1: [ "y", "year" ],
    year_s: [ "y", "years" ],
    day_1: ["d", "day" ],
    day_s: [ "d", "days" ],
    hour_1: [ "h", "hour" ],
    hour_s: [ "h", "hours" ],
    minute_1: [ "m", "minute" ],
    minute_s: [ "m", "minutes" ],
    second_1: [ "s", "second" ],
    second_s: [ "s", "seconds" ],
    milli_1: [ "ms", "millisecond" ],
    milli_s: [ "ms", "milliseconds" ]
  };


  function f_human_duration(pi_millisec, pb_compact_form) {
    const li_time_part_name_index = (pb_compact_form ? 0 : 1); // 0=short, 1=long
    const ls_sep_between_date_parts = (pb_compact_form ? " " : ", ");
    const ls_sep_between_part_and_unit = (pb_compact_form ? "" : " ");

    let la_date_parts = [];

    // build the correct rendering for each time slice
    function lf_push_date_part(ps_part_key, pi_part_val) {
      if (f_is_not_defined(pi_part_val)) {
        return;
      }

      if (pi_part_val === 0) {
        return;
      }

      // one or many ? singular or plural ?
      const ls_part_ref = f_join("_", ps_part_key, (pi_part_val > 1 ? "s" : "1"));
      la_date_parts.push(f_join(ls_sep_between_part_and_unit,
                                pi_part_val,
                                _ch_time_part_names[ls_part_ref][li_time_part_name_index]));
    }


    // Do not render date parts that represent less than one 50th of the total
    const li_threshold_ms = Math.round(pi_millisec / 50);

    // remaining to render
    let li_ms_left = pi_millisec;

    // eject part corresponding to the given unit / part, and return the rest
    function lf_extract_time_slice(ps_part_key, pi_factor) {
      const li_extracted = Math.floor(li_ms_left / pi_factor);
      li_ms_left -= (li_extracted * pi_factor);
      lf_push_date_part(ps_part_key, li_extracted);
      return(li_ms_left);
    }


    // exit with [break]
    do {
      if (lf_extract_time_slice("year", 31536000000) < li_threshold_ms) {
        break;
      }
      if (lf_extract_time_slice("day", 86400000) < li_threshold_ms) {
        break;
      }
      if (lf_extract_time_slice("hour", 3600000) < li_threshold_ms) {
        break;
      }
      if (lf_extract_time_slice("minute", 60000) < li_threshold_ms) {
        break;
      }
      if (lf_extract_time_slice("second", 1000) < li_threshold_ms) {
        break;
      }
      if (lf_extract_time_slice("milli", 1) < li_threshold_ms) {
        break;
      }
    } while (false); // do this pseudo-loop only once !


    return(f_get_first_val(la_date_parts.join(ls_sep_between_date_parts), cs_duration_zero));
  }


  // Conversion of big numbers into a notation with a metric prefix - for instance:
  // 1000 => 1K, 1000000 => 1M, etc.
  //
  // Handling / conversion of bitrates
  // https://en.wikipedia.org/wiki/Metric_prefix
  //
  // Handling / conversion of data size
  // https://en.wikipedia.org/wiki/Metric_prefix

  const ci_metric_number_max_value = 1000;
  const ci_metric_number_1_000 = 1000;
  const ci_metric_number_1_024 = 1024;
  const ci_metric_number_1_024_half = (ci_metric_number_1_024 / 2);
  const cs_metrix_suffix_1 = "1";


  const _ch_metric_ranges = {

    "1": { // cs_metrix_suffix_1
      ai_max_value: ci_metric_number_max_value,
      as_bitrate_range_label: "bits per second",
      as_bitrate_unit: "bps",
      as_datasize_range_label: "bytes",
      as_datasize_unit: "Bytes",
      as_number_range_label: "",
      as_number_unit: "",
      as_range_lower: null,
      as_range_upper: "K"
    },

    K: {
      ai_max_value: ci_metric_number_max_value,
      as_bitrate_range_label: "kilobits per second",
      as_bitrate_unit: "Kbps",
      as_datasize_range_label: "kilobytes",
      as_datasize_unit: "KBytes",
      as_number_range_label: "",
      as_number_unit: "K",
      as_range_lower: 1,
      as_range_upper: "M"
    },

    M: {
      ai_max_value: ci_metric_number_max_value,
      as_bitrate_range_label: "megabits per second",
      as_bitrate_unit: "Mbps",
      as_datasize_range_label: "megabytes",
      as_datasize_unit: "MBytes",
      as_number_range_label: "",
      as_number_unit: "M",
      as_range_lower: "K",
      as_range_upper: "G"
    },

    G: {
      ai_max_value: ci_metric_number_max_value,
      as_bitrate_range_label: "gigabits per second",
      as_bitrate_unit: "Gbps",
      as_datasize_range_label: "gigabytes",
      as_datasize_unit: "GBytes",
      as_number_range_label: "(e9)",
      as_number_unit: "Giga",
      as_range_lower: "M",
      as_range_upper: "T"
    },

    T: {
      ai_max_value: ci_metric_number_max_value,
      as_bitrate_range_label: "terabits per second",
      as_bitrate_unit: "Tbps",
      as_datasize_range_label: "terabytes",
      as_datasize_unit: "TBytes",
      as_number_range_label: "(e12)",
      as_number_unit: "Tera",
      as_range_lower: "G",
      as_range_upper: "P"
    },

    P: {
      ai_max_value: ci_metric_number_max_value,
      as_bitrate_range_label: "petabits per second",
      as_bitrate_unit: "Pbps",
      as_datasize_range_label: "petabytes",
      as_datasize_unit: "PBytes",
      as_number_range_label: "(e15)",
      as_number_unit: "Peta",
      as_range_lower: "T",
      as_range_upper: "E"
    },

    E: {
      ai_max_value: ci_metric_number_max_value,
      as_bitrate_range_label: "exabits per second",
      as_bitrate_unit: "Ebps",
      as_datasize_range_label: "exabytes",
      as_datasize_unit: "EBytes",
      as_number_range_label: "(e18)",
      as_number_unit: "Exa",
      as_range_lower: "P",
      as_range_upper: "Z"
    },

    Z: {
      ai_max_value: ci_metric_number_max_value,
      as_bitrate_range_label: "zettabits per second",
      as_bitrate_unit: "Zbps",
      as_datasize_range_label: "zettabytes",
      as_datasize_unit: "ZBytes",
      as_number_range_label: "(e21)",
      as_number_unit: "Zetta",
      as_range_lower: "E",
      as_range_upper: "Y"
    },

    Y: {
      as_bitrate_range_label: "yottabits per second",
      as_bitrate_unit: "Ybps",
      as_datasize_range_label: "yottabytes",
      as_datasize_unit: "YBytes",
      as_number_range_label: "(e24)",
      as_number_unit: "Yotta",
      as_range_lower: "Z",
      as_range_upper: null
    }
  };


  // return the element of [_ch_metric_ranges] corresponding to the given metric
  // suffix
  function _f_human_metrix_range_get_def(ps_metric_suffix) {
    const lh_result = _ch_metric_ranges[ps_metric_suffix];

    if (! lh_result) {
      throw f_console_error(`found no metric range corresponding to suffix [${ps_metric_suffix}]`);
    }

    return(lh_result);
  }


  // try to parse a metric suffix beginning with [KMGTPEZY]
  function _f_human_parse_metric_range(ps_raw_suffix) {
    if (f_is_defined(ps_raw_suffix)) {
      const la_matches = ps_raw_suffix.match(/^\s*([kmgtpezy])/i);
      if (la_matches) {
        return(f_case_upper(la_matches[1]));
      }
    }

    // no such suffix
    return(null);
  }





  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //
  //  - make huge number easily readable for a human eye !
  //
  //  ARGUMENTS :
  //  - ps_value: can be
  //    o any valid number in standard notation (pure numeric)
  //    o a value with a metric suffix like K/M/G/T/P/E/Z
  //
  //    example: 10000, 20k, 21.3m
  //
  //  - pi_decimals (opt)
  //
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Thu Feb 15 17:37:34 2018 - Herve Ledoux on LDEV
  //  - Last modification : Fri Feb 16 10:13:53 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_human_number(ps_value, pi_decimals) {

    let ls_result;

    try {

      // eliminate trivial cases
      if (f_is_not_defined(ps_value)) {
        return(ps_value);
      }

      const la_matches = f_regexp_string_match(ps_value, /^\s*(\d+(?:\.\d+)?)(?:\s*(k|kilo|m|mega|g|gig|giga|t|tera|p|peta|e|exa|z|zetta|y|yotta)[s]?)?\s*$/i);
      if (! la_matches) {
        return(ps_value);
      }

      let li_num_val = Number(la_matches[1]); // force conversion to numeric
      const ls_raw_unit = la_matches[2];

      // extract the metric suffix provided by the value
      let lh_metric_range_def = _f_human_metrix_range_get_def(f_get_first_val(_f_human_parse_metric_range(ls_raw_unit), cs_metrix_suffix_1));

      // Try to reduce the numerical value, up to something a human being can
      // reasonably read
      let li_loop_count_down = 100; // avoid infinite loops...
      REDUCE_DIVIDE: while (li_loop_count_down) {
        li_loop_count_down -= 1;

        // When the numerical value is too high compare to the limit of the current
        // unit prefix ==> change scale
        const li_max_value = lh_metric_range_def.ai_max_value;

        // no more ceiling ? stop
        if (f_is_not_defined(li_max_value)) {
          break REDUCE_DIVIDE;
        }

        // under the max ? stop
        if (li_num_val < li_max_value) {
          break REDUCE_DIVIDE;
        }

        // next metric range to try
        lh_metric_range_def = _f_human_metrix_range_get_def(lh_metric_range_def.as_range_upper);

        // Round the value before going further
        li_num_val = Math.round(li_num_val);

        // divide again
        li_num_val = (1.0 * li_num_val / ci_metric_number_1_000);

      } // REDUCE_DIVIDE


      // Final formatting
      const ls_num_expr = f_number_round_with_precision(li_num_val, f_get_first_val(pi_decimals, ((li_num_val < 10) ? 1 : 0)));
      ls_result = f_join_non_blank_vals(" ", ls_num_expr, lh_metric_range_def.as_number_unit, lh_metric_range_def.as_range_label);
    }

    catch (po_err) {
      // normally, the error was already notified by f_console_error(...)
      if (f_string_is_blank(po_err.as_severity)) {
        f_console_error(`caught unexpected error [${po_err}]`);
      }
    }

    return(ls_result);
  }




  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //
  //  - Make those huge numerical speed values (bits per second), with plenty of
  //  zeros, become readable for a normal human being !
  //
  //  ARGUMENTS :
  //
  //  - ps_value: a bitrate value, possibly embedding or not a unit:
  //   * bps (bits per second) or multiple: bps, pbs (typo!), Kbps, Mbps, Gbps, Tbps, K, M, G, T
  //   * cps (ATM cells per second) or multiple: cps,
  //
  //  Examples of legal values:
  //   [1.3 P/s]
  //   [1.3 T/second]
  //   [1.3 Tb/s]
  //   [1.3 Tbit / s]
  //   [1.3 Tbps]
  //   [1.34 E/s]
  //   [1.5 Gb]
  //   [1000000] (no unit)
  //   [1536 Kbps]
  //   [1984 Mbit]
  //   [1984 Mbits]
  //   [1984Mbit / s]
  //   [1984Mbit/s]
  //   [2.4Gbp/s]
  //   [2.4Gbp]
  //   [200 Z/s]
  //   [200000 b/s]
  //   [200000 bp / s]
  //   [200000 bp]
  //   [200000 bps]
  //   [23.7 Ybps]
  //
  //  Refer to the uniit tests
  //
  //  - ps_base_unit (opt): optionnaly, the unit of [ps_value], when not embedded -
  //  The default is [bps]
  //
  //  - pi_decimals (opt): force the number of decimals
  //
  //  By the way, this routine recognizes (and fixes) the common typo error: [pbs]
  //  i/o [bps]
  //
  //  -
  //  RETURN VALUE :
  //  - A string made of a human-readable bitrate, embedded the corresponding unit (xbps)
  //  HISTORY :
  //  - Creation          : Thu Feb 15 17:38:25 2018 - Herve Ledoux on LDEV
  //  - Last modification : Thu Feb 15 17:38:25 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  const _cs_birate_unit_default = "bps";
  function f_human_bitrate(ps_value, ps_default_unit, pi_decimals) {
    let ls_result;

    try {
      ps_default_unit = f_get_first_val(ps_default_unit, _cs_birate_unit_default);

      // eliminate trivial cases
      if (f_is_not_defined(ps_value)) {
        return(ps_value);
      }

      const la_matches = f_regexp_string_match(ps_value, /^\s*(\d+(?:\.\d+)?)(?:\s*([KMGTPEZY]?(?:(bit|bp|pb|b|cp|c)?(?:(?:\s*\/)?\s*(?:s|sec|second|seconds))?)?))?\s*$/i);
      if (! la_matches) {
        return(ps_value);
      }

      let li_num_val = Number(la_matches[1]); // force conversion to numeric
      const ls_raw_unit = f_get_first_val(la_matches[2], ps_default_unit);
      const ls_bps_or_cps = f_get_first_val(la_matches[3], ps_default_unit);

      // extract the metric suffix provided by the value / unit
      let lh_metric_range_def = _f_human_metrix_range_get_def(f_get_first_val(_f_human_parse_metric_range(ls_raw_unit), cs_metrix_suffix_1));


      // Case of ATM speed, expressed in cells per second (cps | c/s): multiply by
      // (48*8)=384 to revert back to bits per second
      if (ls_bps_or_cps.match(/^(c)/i)) {
        li_num_val *= 384;
      }


      // Try to reduce the numerical value, up to something a human being can
      // reasonably read
      let li_loop_count_down = 100; // avoid infinite loops...
      REDUCE_DIVIDE: while (li_loop_count_down) {
        li_loop_count_down -= 1;

        // When the numerical value is too high compare to the limit of the current
        // unit prefix ==> change scale
        const li_max_value = lh_metric_range_def.ai_max_value;

        // no more ceiling ? stop
        if (f_is_not_defined(li_max_value)) {
          break REDUCE_DIVIDE;
        }

        // under the max ? stop
        if (li_num_val < li_max_value) {
          break REDUCE_DIVIDE;
        }

        // next metric range to try
        lh_metric_range_def = _f_human_metrix_range_get_def(lh_metric_range_def.as_range_upper);

        // Round the value before going further
        li_num_val = Math.round(li_num_val);

        // Try to guess the most suitable divisor: 1024 or 1000
        const li_divisor = (

          // trivial value multiple of 1000 ==> no hesitation ==>
          // divide by 1000
          ((li_num_val % ci_metric_number_1_000) === 0) ? ci_metric_number_1_000 :

          (
            // not divisible by 1000, yet multiple of 512 ==> divide by 1024
            ((li_num_val % ci_metric_number_1_024_half) === 0) ? ci_metric_number_1_024 :


            // Ultimate default divisor
            ci_metric_number_1_000));

        // divide again
        li_num_val = (1.0 * li_num_val / li_divisor);

      } // REDUCE_DIVIDE


      // Final formatting
      const ls_num_expr = f_number_round_with_precision(li_num_val, f_get_first_val(pi_decimals, ((li_num_val < 10) ? 1 : 0)));
      ls_result = f_join_non_blank_vals(" ", ls_num_expr, lh_metric_range_def.as_bitrate_unit);
    }

    catch (po_err) {
      // normally, the error was already notified by f_console_error(...)
      if (f_string_is_blank(po_err.as_severity)) {
        f_console_error(po_err);
      }
    }


    return(ls_result);
  }




  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //
  //  - Very similar to [f_human_bitrate(...)], but for data sizes, expressed in
  //    bytes
  //
  //  ARGUMENTS :
  //
  //  - ps_value: a data size value, possibly embedding or not a unit:
  //   * B (bytes) or multiple: KB, MB, GB, TB, PB, EB
  //
  //  - ps_base_unit (opt): optionnaly, the unit of [ps_value], when not embedded -
  //  The default is [B] (bytes)
  //
  //  - pi_decimals (opt): force the number of decimals
  //
  //  RETURN VALUE :
  //  - A string made of a human-readable bitrate, embedding the corresponding unit (xB)
  //  HISTORY :
  //  - Creation          : Thu Feb 15 17:39:26 2018 - Herve Ledoux on LDEV
  //  - Last modification : Thu Feb 15 17:39:26 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  const _cs_datasize_unit_default = "Bytes";
  function f_human_datasize(ps_value, ps_default_unit, pi_decimals) {
    let ls_result;

    try {
      ps_default_unit = f_get_first_val(ps_default_unit, _cs_datasize_unit_default);

      // eliminate trivial cases
      if (f_is_not_defined(ps_value)) {
        return(ps_value);
      }

      const la_matches = f_regexp_string_match(ps_value, /^\s*(\d+(?:\.\d+)?)(?:\s*([KMGTPEZY]?(Bytes|Byte|B)?))?\s*$/i);
      if (! la_matches) {
        return(ps_value);
      }

      let li_num_val = Number(la_matches[1]); // force conversion to numeric

      // a very very special case - when the numeric value is null, back to bytes
      const ls_raw_unit = ((li_num_val === 0) ? _cs_datasize_unit_default : f_get_first_val(la_matches[2], ps_default_unit));

      // extract the metric suffix provided by the value / unit
      let lh_metric_range_def = _f_human_metrix_range_get_def(f_get_first_val(_f_human_parse_metric_range(ls_raw_unit), cs_metrix_suffix_1));

      // Try to reduce the numerical value, up to something a human being can
      // reasonably read
      let li_loop_count_down = 100; // avoid infinite loops...
      REDUCE_DIVIDE: while (li_loop_count_down) {
        li_loop_count_down -= 1;

        // When the numerical value is too high compare to the limit of the current
        // unit prefix ==> change scale
        const li_max_value = lh_metric_range_def.ai_max_value;

        // no more ceiling ? stop
        if (f_is_not_defined(li_max_value)) {
          break REDUCE_DIVIDE;
        }

        // under the max ? stop
        if (li_num_val < li_max_value) {
          break REDUCE_DIVIDE;
        }

        // next metric range to try
        lh_metric_range_def = _f_human_metrix_range_get_def(lh_metric_range_def.as_range_upper);

        // Round the value before going further
        li_num_val = Math.round(li_num_val);

        // Try to guess the most suitable divisor: 1024 or 1000
        const li_divisor = (

          // trivial value multiple of 1000 ==> no hesitation ==>
          // divide by 1000
          ((li_num_val % ci_metric_number_1_000) === 0) ? ci_metric_number_1_000 :

          (
            // not divisible by 1000, yet multiple of 512 ==> divide by 1024
            ((li_num_val % ci_metric_number_1_024_half) === 0) ? ci_metric_number_1_024 :


            // Ultimate default divisor
            ci_metric_number_1_000));

        // divide again
        li_num_val = (1.0 * li_num_val / li_divisor);

      } // REDUCE_DIVIDE


      // Final formatting
      const ls_num_expr = f_number_round_with_precision(li_num_val, f_get_first_val(pi_decimals, ((li_num_val < 10) ? 1 : 0)));
      ls_result = f_join_non_blank_vals(" ", ls_num_expr, lh_metric_range_def.as_datasize_unit);
    }

    catch (po_err) {
      // normally, the error was already notified by f_console_error(...)
      if (f_string_is_blank(po_err.as_severity)) {
        f_console_error(po_err);
      }
    }

    return(ls_result);
  }





  // ********************************************************************
  //  - EXPORTS
  // ********************************************************************
  module.exports.f_is_defined = f_is_defined;
  module.exports.f_is_not_defined = f_is_not_defined;
  module.exports.f_is_array = f_is_array;
  module.exports.f_is_object = f_is_object;
  module.exports.f_is_scalar = f_is_scalar;

  module.exports.f_object_extend = f_object_extend;
  module.exports.f_object_iterate = f_object_iterate;
  module.exports.f_extend = f_object_extend; // ##ALIAS##

  module.exports.f_regexp_quotemeta = f_regexp_quotemeta;
  module.exports.f_regexp_match = f_regexp_match;
  module.exports.f_regexp_string_match = f_regexp_string_match;

  module.exports.f_string_is_blank = f_string_is_blank;
  module.exports.f_string_is_blank_or_null = f_string_is_blank_or_null;
  module.exports.f_string_is_not_blank = f_string_is_not_blank;
  module.exports.f_string_is_neither_blank_nor_null = f_string_is_neither_blank_nor_null;
  module.exports.f_stringify = f_stringify;
  module.exports.f_string_trim = f_string_trim;
  module.exports.f_string_truncate = f_string_truncate;
  module.exports.f_string_remove_trailing_slash = f_string_remove_trailing_slash;
  module.exports.f_string_cmp = f_string_cmp;
  module.exports.f_string_pad_right = f_string_pad_right;
  module.exports.f_string_pad_left = f_string_pad_left;
  module.exports.f_string_is_email_address = f_string_is_email_address;
  module.exports.f_string_is_url = f_string_is_url;
  module.exports.f_string_is_html_fragment = f_string_is_html_fragment;

  module.exports.f_is_false = f_is_false;
  module.exports.f_is_true = f_is_true;

  module.exports.f_get_first_def = f_get_first_def;
  module.exports.f_get_first_val = f_get_first_val;

  module.exports.f_join = f_join;
  module.exports.f_join_defined_vals = f_join_defined_vals;
  module.exports.f_join_non_blank_vals = f_join_non_blank_vals;

  module.exports.f_number_cmp = f_number_cmp;
  module.exports.f_number_is_valid = f_number_is_valid;
  module.exports.f_number_max = f_number_max;
  module.exports.f_number_min = f_number_min;
  module.exports.f_number_parse = f_number_parse;
  module.exports.f_number_round_with_precision = f_number_round_with_precision;

  module.exports.f_date_now_ms = f_date_now_ms;
  module.exports.f_date_format_YYYYMMDD = f_date_format_YYYYMMDD;
  module.exports.f_date_format_YYYYMMDDhhmmss = f_date_format_YYYYMMDDhhmmss;
  module.exports.f_date_format_YYYYMMDDhhmmssms = f_date_format_YYYYMMDDhhmmssms;
  module.exports.f_date_format_iso = f_date_format_iso;

  module.exports.f_duration_parse_ms = f_duration_parse_ms;

  module.exports.f_convert_px_to_int = f_convert_px_to_int;

  module.exports.f_get_prog_name = f_get_prog_name;
  module.exports.f_env_del = f_env_del;
  module.exports.f_env_get = f_env_get;
  module.exports.f_env_set = f_env_set;

  module.exports.f_chrono_start = f_chrono_start;
  module.exports.f_chrono_stop = f_chrono_stop;
  module.exports.f_chrono_elapsed_ms = f_chrono_elapsed_ms;

  module.exports.f_digest_md5_hex = f_digest_md5_hex;
  module.exports.f_digest_sha1_hex = f_digest_sha1_hex;
  module.exports.f_digest_sha256_hex = f_digest_sha256_hex;

  module.exports.f_case_upper = f_case_upper;
  module.exports.f_case_lower = f_case_lower;
  module.exports.f_case_capitalize = f_case_capitalize;

  module.exports.f_case_to_Camel_Snake_Case = f_case_to_Camel_Snake_Case; // Convert_To_Camel_Snake_Case
  module.exports.f_case_to_Http_Header_Case = f_case_to_Http_Header_Case; // Convert-To-Http-Header-Case
  module.exports.f_case_to_snake_case = f_case_to_snake_case; // convert_to_snake_case
  module.exports.f_case_to_SNAKE_CASE = f_case_to_SNAKE_CASE; // CONVERT_TO_SNAKE_CASE
  module.exports.f_case_to_kebab_case = f_case_to_kebab_case; // convert-to-kebab-case
  module.exports.f_case_to_KEBAB_CASE = f_case_to_KEBAB_CASE; // CONVERT-TO-KEBAB-CASE
  module.exports.f_case_to_camelCase = f_case_to_camelCase; // convertToCamelCase
  module.exports.f_case_to_PascalCase = f_case_to_PascalCase; // ConvertToPascalCase
  module.exports.f_case_to_space_case = f_case_to_space_case; // convert to space case
  module.exports.f_case_to_SPACE_CASE = f_case_to_SPACE_CASE; // CONVERT TO SPACE CASE

  module.exports.f_human_bitrate = f_human_bitrate;
  module.exports.f_human_datasize = f_human_datasize;
  module.exports.f_human_duration = f_human_duration;
  module.exports.f_human_number = f_human_number;

}());
