// http://jslint.com/

/*jslint fudge, white, node */


(function () {
  "use strict";

  const cm_path = require("path");
  const cm_util = require("util");

  const ci_console_severity_info = 0;
  const ci_console_severity_warning = 1;
  const ci_console_severity_alert = 2;
  const ci_console_severity_error = 3;
  const ci_console_severity_fatal = 4;

  const cs_console_severity_info = "info";
  const cs_console_severity_warning = "warning";
  const cs_console_severity_alert = "alert";
  const cs_console_severity_error = "error";
  const cs_console_severity_fatal = "fatal";

  const cs_console_prefix_info = "";
  const cs_console_prefix_warning = "!!! WARNING !!! ";
  const cs_console_prefix_alert = "!!! ALERT !!! ";
  const cs_console_prefix_error = "!!! ERROR !!! ";
  const cs_console_prefix_fatal = "!!! FATAL !!! ";

  const ci_console_infinite_loop = 100;

  const cs_console_indent_step = "  ";
  const cs_console_separator_long = "========================================================";
  const cs_console_separator_short = "======";

  const cs_console_ext_js = ".js";
  const cs_console_progname = cm_path.basename(process.argv0, cs_console_ext_js);

  const cs_console_newline = "\n";
  const cs_console_empty_string = "";
  const cs_console_join_args_sep = "";


  // global console - initialized on-the-fly, at first call
  let _go_console = null;


  // the global hash of packages to trace in debug mode, deduced from
  // [XCCC_CONSOLE_DEBUG_PKG]
  let _gh_debug_pkg = null;


  let _gi_current_pid = process.pid;



  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  -
  //  ARGUMENTS :
  //  - none
  //  RETURN VALUE :
  //  - the time-stamp at the beginning of each trace
  //  HISTORY :
  //  - Creation          : Mon Jan 22 16:02:51 2018 - Herve Ledoux on LDEV
  //  - Last modification : Mon Jan 22 16:02:51 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function _f_get_trace_timestamp() {
    let ls_stamp = new Date().toISOString();
    return(ls_stamp);
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - extract the core base name of the given module - usually [__filename]
  //  ARGUMENTS :
  //  - ps_module: for instance [/some/dir/plus/module-name.js]
  //  RETURN VALUE :
  //  - [module-name]
  //  HISTORY :
  //  - Creation          : Thu Jan 25 13:21:45 2018 - Herve Ledoux on LDEV
  //  - Last modification : Thu Jan 25 13:21:45 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function _f_extract_pkg_name(ps_module) {
    let ls_result = ps_module;
    if (ps_module) {
      ls_result = cm_path.basename(ps_module, cs_console_ext_js);
    }

    return(ls_result);
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  -
  //  ARGUMENTS :
  //  -
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Mon Jan 22 15:56:54 2018 - Herve Ledoux on LDEV
  //  - Last modification : Mon Jan 22 15:56:54 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function _f_trace_out(pb_with_newline_after, ps_msg) {
    process.stderr.write(ps_msg + (pb_with_newline_after ? cs_console_newline : cs_console_empty_string));
  }



  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - capture fatal internal exceptions
  //  ARGUMENTS :
  //  -
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Fri Jan 26 12:06:19 2018 - Herve Ledoux on LDEV
  //  - Last modification : Fri Jan 26 12:06:19 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function _f_console_fatal(ps_context, po_err) {
    _f_trace_out(true, `${cs_console_prefix_fatal}${ps_context} - ${po_err.stack}`);
    process.exit(2);
  }



  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  -
  //  ARGUMENTS :
  //  -
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Mon Jan 22 15:54:45 2018 - Herve Ledoux on LDEV
  //  - Last modification : Mon Jan 22 15:54:45 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function _f_init_debug_pkg() {

    let ls_XCCC_CONSOLE_DEBUG_PKG = process.env.XCCC_CONSOLE_DEBUG_PKG;
    if (ls_XCCC_CONSOLE_DEBUG_PKG) {

      // Prepare a hash of modules
      _gh_debug_pkg = new Map();

      // We assume the content of [XCCC_CONSOLE_DEBUG_PKG] is a concatenation of
      // module names

      let la_raw_module_names = ls_XCCC_CONSOLE_DEBUG_PKG.split(/[\s,;]+/);
      la_raw_module_names.forEach(function (ps_one_raw_module) {
        let ls_module_name = _f_extract_pkg_name(ps_one_raw_module);
        if (ls_module_name) {
          _gh_debug_pkg.set(ls_module_name, true);
        }
      });
    }
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - install some global handlers, for instance to capture events like
  //    [uncaughtexception] - refer to
  //    https://nodejs.org/api/process.html#process_event_uncaughtexception
  //  ARGUMENTS :
  //  -
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Fri Jan 26 10:02:05 2018 - Herve Ledoux on LDEV
  //  - Last modification : Fri Jan 26 10:02:05 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function _f_init_handlers() {
    process.on("uncaughtException", function (po_err) {
      _f_console_fatal("uncaughtException", po_err);
    });
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  -
  //  ARGUMENTS :
  //  -
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Sun Jan 21 18:06:39 2018 - LEDOUX Herve
  //  - Last modification : Sun Jan 21 18:06:39 2018 - LEDOUX Herve
  // ********************************************************************
  function _f_get_console() {
    if (! _go_console) {
      _go_console = {
        ab_already_in_handler: false,
        ab_dump_stack_on_error: false,
        ab_inhibit_handler: false,
        ab_silent: false,
        ab_timestamp: true,

        af_msg_handler: null,
        af_shorten_filenames: null,

        ai_count_alerts: 0,
        ai_count_errors: 0,
        ai_count_warnings: 0,
        ai_handler_calls: 0,
        ai_verbosity_level: 0,

        ai_indent_level: 0,

        as_indent_base: (process.env.XCCC_CONSOLE_INDENT || cs_console_empty_string),
        as_indent_prefix: cs_console_empty_string, // always resync with [ai_indent_level]
        as_trace_context: cs_console_empty_string,

        // Detect repetition of the last message - automatic detection of infinite
        // loops...
        ai_last_msg_count: 0,
        as_last_msg_value: null
      };

      _f_init_handlers();
      _f_init_debug_pkg();
    }

    return(_go_console);
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  -
  //  ARGUMENTS :
  //  - pb_with_timestamp
  //  - pb_with_indent
  //  - pb_with_newline_after
  //  - pb_pass_to_msg_handler
  //  - pb_show_context
  //  - pi_severity
  //  - ps_msg
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Mon Jan 22 15:50:56 2018 - Herve Ledoux on LDEV
  //  - Last modification : Mon Jan 22 15:50:56 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function _f_trace_out_with_date(
    pb_with_timestamp,
    pb_with_indent,
    pb_with_newline_after,
    pb_pass_to_msg_handler,
    pb_show_context,
    pi_severity,
    ps_msg) {

    let lo_console = _f_get_console();
    let ls_timestamp = _f_get_trace_timestamp();
    let ls_timestamp_prefix = ((lo_console.ab_timestamp) ? `(${_gi_current_pid}) ${ls_timestamp} ` : cs_console_empty_string);
    let lb_really_show_it = true;


    // Some filtering on the message before generating the output ?
    let lf_shorten_filenames = lo_console.af_shorten_filenames;
    if (lf_shorten_filenames) {
      ps_msg = lf_shorten_filenames(ps_msg);
    }

    // Try to avoid some infinite loops by detecting that exactly the same message
    // is raised more than a certain amount of times
    if (pi_severity > ci_console_severity_info) {

      // Detection of a repeated warning / alert / error
      if ((ps_msg) &&
          (lo_console.as_last_msg_value) &&
          (ps_msg === lo_console.as_last_msg_value))
      {
        lo_console.ai_last_msg_count += 1;

        // Show only the first occurrence of the error...
        lb_really_show_it = false;

        if (lo_console.ai_last_msg_count > ci_console_infinite_loop) {
          _f_console_fatal(`same message raised [${lo_console.ai_last_msg_count}] times`, new Error("Suspecting infinite loop"));
        }
      }

      // Brand new message
      else
      {
        // Show that the previous message was repeated
        if ((lo_console.ai_last_msg_count) &&
            (lo_console.ai_last_msg_count > 1))
        {
          _f_trace_out(pb_with_newline_after, `${ls_timestamp_prefix}(previous message repeated [${lo_console.ai_last_msg_count}] times)`);
        }

        lo_console.ai_last_msg_count = 1;
        lo_console.as_last_msg_value = ps_msg;
      }
    }


    // severity zero
    else {
      if (lo_console.ab_silent) {
        lb_really_show_it = false;
      }
    }


    if (lb_really_show_it) {
      let ls_trace_context = lo_console.as_trace_context;
      _f_trace_out(pb_with_newline_after, [ (pb_with_timestamp ? ls_timestamp_prefix : cs_console_empty_string), (pb_with_indent ? lo_console.as_indent_prefix : cs_console_empty_string), (pb_show_context ? ls_trace_context : cs_console_empty_string), ps_msg ].join(cs_console_join_args_sep));
    }


    // Send msg to call-back
    let lf_msg_handler = lo_console.af_msg_handler;

    if ((lf_msg_handler) &&
        (pb_pass_to_msg_handler) &&
        (pi_severity > ci_console_severity_info) && // to not pass info to handler
        (! lo_console.ab_inhibit_handler) &&
        (! lo_console.ab_already_in_handler)) {

      // avoid deep recursion...
      lo_console.ab_already_in_handler = true;
      lf_msg_handler(ls_timestamp, pi_severity, ps_msg);
      lo_console.ab_already_in_handler = false;
      lo_console.ai_handler_calls += 1;
    }
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  -
  //  ARGUMENTS :
  //  -
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Thu Jan 25 13:14:45 2018 - Herve Ledoux on LDEV
  //  - Last modification : Thu Jan 25 13:14:45 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function _f_dump_call_stack(pb_force_dump, pb_exit) {

    if ((pb_force_dump) ||
        ((_go_console) &&
         (_go_console.ab_dump_stack_on_error))) {
      _f_trace_out_with_date(
        true, // pb_with_timestamp
        false, // pb_with_indent
        true, // pb_with_newline_after
        false, // pb_pass_to_msg_handler
        false, // pb_show_context
        ci_console_severity_info,
        `dumping call-stack:${cs_console_newline}${new Error().stack}`);

      if (pb_exit) {
        _f_trace_out(true, "immediate termination");
        process.exit(2);
      }
    }
  }



  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  -
  //  ARGUMENTS (hash):
  //  - pb_dump_stack_on_error (or env NODE_DUMP_STACK_ON_ERROR)
  //  - pb_silent
  //  - pb_timestamp
  //  - pf_msg_handler
  //  - ps_shorten_filenames_with_prefix
  //  - ps_trace_context
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Sun Jan 21 17:47:20 2018 - LEDOUX Herve
  //  - Last modification : Sun Jan 21 17:47:20 2018 - LEDOUX Herve
  // ********************************************************************
  function _f_config_compile(ph_opts) {

    let lo_console = _f_get_console();

    // [pb_dump_stack_on_error]
    lo_console.ab_dump_stack_on_error = (Boolean(ph_opts.pb_dump_stack_on_error) || Boolean(process.env.NODE_DUMP_STACK_ON_ERROR));

    // [pb_silent] - hide info level
    lo_console.ab_silent = Boolean(ph_opts.pb_silent);


    // [pb_timestamp]
    lo_console.ab_timestamp = Boolean(ph_opts.pb_timestamp);


    // branch [af_msg_handler] => [pf_msg_handler]
    lo_console.af_msg_handler = ph_opts.pf_msg_handler;


    // ps_trace_context
    lo_console.as_trace_context = (Boolean(ph_opts.ps_trace_context) ? ph_opts.ps_trace_context : cs_console_empty_string);


    // [ps_shorten_filenames_with_prefix] Special processing of long filenames embedded in traces ?
    let ls_shorten_filenames_with_prefix = ph_opts.ps_shorten_filenames_with_prefix;

    // define a new filter
    if (ls_shorten_filenames_with_prefix) {

      // be sure the prefix ends with a trailing slash /
      if (! ls_shorten_filenames_with_prefix.match(/\/$/)) {
        ls_shorten_filenames_with_prefix += "/";
      }

      lo_console.af_shorten_filenames = function(ps_trace) {
        return(ps_trace.replace(ls_shorten_filenames_with_prefix, cs_console_empty_string));
      };
    }
  }




  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  -
  //  ARGUMENTS (hash):
  //  - pb_silent: shut-up !
  //  - pb_timestamp: prefix each trace with a time-stamp
  //  - pf_msg_handler: sub / call-back to call for each trace
  //  - ps_shorten_filenames_with_prefix: reduce in the traces the long files names beginning like
  //  - ps_trace_context: systematically prefix any trace ejected by the console with the given value
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Sun Jan 21 17:37:05 2018 - LEDOUX Herve
  //  - Last modification : Sun Jan 21 17:37:05 2018 - LEDOUX Herve
  // ********************************************************************
  function f_console_configure(ph_opts) {
    _f_config_compile(ph_opts);
  }




  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - produce a string representation of the given argument
  //  ARGUMENTS :
  //  - px_arg
  //  RETURN VALUE :
  //  - display string
  //  HISTORY :
  //  - Creation          : Thu Jan 25 14:54:23 2018 - Herve Ledoux on LDEV
  //  - Last modification : Wed Jul  4 18:32:18 2018 - Herve Ledoux on DDEV
  // ********************************************************************
  function f_console_stringify(px_arg) {
    if (px_arg === null) {
      return("-null-");
    }

    if (px_arg === undefined) {
      return("-undefined-");
    }

    if (typeof(px_arg) === "object") {
      return(cm_util.inspect(px_arg, {
        depth: 10
      }));
    }

    // default case
    return(px_arg.toString());
  }




  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - assemble all the elements passed in [pa_var_args] into a single string
  //  ARGUMENTS :
  //  - ps_join_sep: the separator to join the elements of [pa_var_args]
  //  - pa_var_args: the array / list of elements to assemble
  //  - pf_tranform_each_arg (opt): a transformation function to apply to each element
  //  RETURN VALUE :
  //  - the assembly
  //  HISTORY :
  //  - Creation          : Tue Jan 23 10:16:55 2018 - Herve Ledoux on LDEV
  //  - Last modification : Tue Jan 23 10:16:55 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function _f_concat_var_args(ps_join_sep, pa_var_args, pf_tranform_each_arg) {
    return(pa_var_args.map(function(px_one_arg) {
      return((pf_tranform_each_arg) ? pf_tranform_each_arg(f_console_stringify(px_one_arg)) : f_console_stringify(px_one_arg));
    }).join(ps_join_sep));
  }



  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - a variant of [_f_concat_var_args], with extra censoring of any sensitive
  //    information embedded in the trace: password, etc.
  //  ARGUMENTS :
  //  - ps_join_sep
  //  - pa_var_args
  //  - pf_tranform_each_arg (opt)
  //  RETURN VALUE :
  //  - the assembly
  //  HISTORY :
  //  - Creation          : Mon Jan 22 15:55:37 2018 - Herve Ledoux on LDEV
  //  - Last modification : Mon Jan 22 15:55:37 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function _f_censor_and_concat_var_args(ps_join_sep, pa_var_args, pf_tranform_each_arg) {
    return(_f_concat_var_args(ps_join_sep, pa_var_args, function(px_one_arg) {
      let ls_str_arg_value = f_console_stringify(px_one_arg);
      ls_str_arg_value = ls_str_arg_value.replace(/((?:password|passwd|pass|pwd)\s*[:=]\s*)\S+/gi, "$1-REMOVED-");
      return(pf_tranform_each_arg ? pf_tranform_each_arg(ls_str_arg_value) : ls_str_arg_value);
    }));
  }



  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - This very special routine creates a context that temporarily inhibits any
  //    call to the handler defined with [f_console_configure(...)]. Main use
  //    case: prevent some internal errors from being propagated up to the
  //    client, for instance the ones related to ##SECURITY##
  //  -
  //  ARGUMENTS :
  //  -
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Tue Jan 23 11:50:12 2018 - Herve Ledoux on LDEV
  //  - Last modification : Tue Jan 23 11:50:12 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_console_inhibit_handler(pf_sub_to_exec) {

    let lo_console = _f_get_console();

    // save the satet of [ab_inhibit_handler]
    let lb_save_inhibit_handler = lo_console.ab_inhibit_handler;

    // inhibit the handler
    lo_console.ab_inhibit_handler = true;
    let lx_result = pf_sub_to_exec();

    // restore the previous state
    lo_console.ab_inhibit_handler = lb_save_inhibit_handler;

    return(lx_result);
  }




  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  -
  //  ARGUMENTS :
  //  -
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Mon Sep 24 06:31:19 2007 - Herve LEDOUX on carbone14
  //  - Last modification : Fri Jan 24 11:48:27 2014 - Herve Ledoux (carbone20)
  // ********************************************************************
  function f_console_info(...pa_var_args) {
    const ls_msg = _f_concat_var_args(cs_console_join_args_sep, pa_var_args);

    _f_trace_out_with_date(
      true, // pb_with_timestamp
      true, // pb_with_indent
      true, // pb_with_newline_after
      true, // pb_pass_to_msg_handler
      true, // pb_show_context
      ci_console_severity_info,
      `${cs_console_prefix_info}${ls_msg}`);
  }




  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - A special version of [f_console_info(...)], able to process any type of data
  //  ARGUMENTS :
  //  -
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Tue Jan 23 12:24:06 2018 - Herve Ledoux on LDEV
  //  - Last modification : Tue Jan 23 12:24:06 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_console_inspect(...pa_var_args) {
    return(f_console_info(_f_concat_var_args(" ", pa_var_args, f_console_stringify)));
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - create and return a new standard Error object, yet specialized with those
  //    attributes:
  //  ARGUMENTS :
  //  - ai_severity
  //  - as_severity
  //  - as_message (the base message used to create the Error)
  //  RETURN VALUE :
  //  - a new Error object, that can be captured by a [catch (...)] statement
  //  HISTORY :
  //  - Creation          : Wed Feb  7 10:09:56 2018 - Herve Ledoux on LDEV
  //  - Last modification : Wed Feb  7 10:09:56 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function _f_console_new_error(ph_args) {
    let lo_error = new Error(ph_args.as_message);

    lo_error.ai_severity = ph_args.ai_severity;
    lo_error.as_severity = ph_args.ai_severity;
    lo_error.as_message = ph_args.as_message;

    return(lo_error);
  }


  // !!! WARNING !!!
  function f_console_warning(...pa_var_args) {
    let lo_console = _f_get_console();
    lo_console.ai_count_warnings += 1;

    const ls_msg = _f_censor_and_concat_var_args(cs_console_join_args_sep, pa_var_args);

    _f_trace_out_with_date(
      true, // pb_with_timestamp
      false, // pb_with_indent
      true, // pb_with_newline_after
      true, // pb_pass_to_msg_handler,
      true, // pb_show_context
      ci_console_severity_warning,
      `${cs_console_prefix_warning}[#${lo_console.ai_count_warnings}] ${ls_msg}`);

    return(_f_console_new_error({
      ai_severity: ci_console_severity_warning,
      as_severity: cs_console_severity_warning,
      as_message: ls_msg}));
  }


  // !!! ALERT !!!
  function f_console_alert(...pa_var_args) {
    let lo_console = _f_get_console();
    lo_console.ai_count_alerts += 1;

    const ls_msg = _f_censor_and_concat_var_args(cs_console_join_args_sep, pa_var_args);

    _f_trace_out_with_date(
      true, // pb_with_timestamp
      false, // pb_with_indent
      true, // pb_with_newline_after
      true, // pb_pass_to_msg_handler,
      true, // pb_show_context
      ci_console_severity_alert,
      `${cs_console_prefix_alert}[#${lo_console.ai_count_alerts}] ${ls_msg}`);

    return(_f_console_new_error({
      ai_severity: ci_console_severity_alert,
      as_severity: cs_console_severity_alert,
      as_message: ls_msg}));
  }


  // !!! ERROR !!!
  function f_console_error(...pa_var_args) {
    let lo_console = _f_get_console();
    lo_console.ai_count_errors += 1;

    const ls_msg = _f_censor_and_concat_var_args(cs_console_join_args_sep, pa_var_args);

    _f_trace_out_with_date(
      true, // pb_with_timestamp
      false, // pb_with_indent
      true, // pb_with_newline_after
      true, // pb_pass_to_msg_handler,
      true, // pb_show_context
      ci_console_severity_error,
      `${cs_console_prefix_error}[#${lo_console.ai_count_errors}] ${ls_msg}`);

    _f_dump_call_stack();

    return(_f_console_new_error({
      ai_severity: ci_console_severity_error,
      as_severity: cs_console_severity_error,
      as_message: ls_msg}));
  }


  // !!! FATAL !!!
  let _gb_already_in_fatal = false;
  function f_console_fatal(...pa_var_args) {

    const ls_msg = _f_censor_and_concat_var_args(cs_console_join_args_sep, pa_var_args);

    // avoid infinite recursion...
    if (! _gb_already_in_fatal) {
      _gb_already_in_fatal = true;

      _f_trace_out_with_date(
        true, // pb_with_timestamp
        false, // pb_with_indent
        true, // pb_with_newline_after
        true, // pb_pass_to_msg_handler,
        true, // pb_show_context
        ci_console_severity_fatal,
        `${cs_console_prefix_fatal}${ls_msg}`);

      _f_dump_call_stack(true, true);
      _gb_already_in_fatal = false;
    }

    return(_f_console_new_error({
      ai_severity: ci_console_severity_fatal,
      as_severity: cs_console_severity_fatal,
      as_message: ls_msg}));
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - special version of [f_console_warning(...)], meant to trace the outgoing
  //    connection to external systems
  //  ARGUMENTS :
  //  -
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Tue Jan 23 13:49:26 2018 - Herve Ledoux on LDEV
  //  - Last modification : Tue Jan 23 13:49:26 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_console_OUTGOING_CNX(...pa_var_args) {
    return(f_console_warning.apply(f_console_warning, [ "OUTGOING-CNX: " ].concat(pa_var_args)));
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - a synonym of [f_console_error(...)], yet to report problems that are
  //    related to potential security issues - such error messages are NOT
  //    propagated up to the client
  //  ARGUMENTS :
  //  -
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Tue Jan 23 11:48:44 2018 - Herve Ledoux on LDEV
  //  - Last modification : Tue Jan 23 11:48:44 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_console_security_issue(...pa_var_args) {
    let lo_result;

    f_console_inhibit_handler(function() {
      lo_result = f_console_alert.apply(f_console_alert, [ "##SECURITY## " ].concat(pa_var_args));
    });

    return(lo_result);
  }



  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - raise an error ONLY if the first argument is NOT TRUE
  //  ARGUMENTS :
  //  - pb_check_condition: condition expected to be true
  //  - extra arguiments are simply passed to [f_console_error(...)]
  //  RETURN VALUE :
  //  - pb_check_condition
  //  HISTORY :
  //  - Creation          : Tue Jan 23 11:46:44 2018 - Herve Ledoux on LDEV
  //  - Last modification : Tue Jan 23 11:46:44 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_console_assert(pb_check_condition, ...pa_var_args) {
    if (! pb_check_condition) {
      f_console_error.apply(f_console_error, [ "assertion FAILED " ].concat(pa_var_args));
    }

    return(pb_check_condition);
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  -
  //  ARGUMENTS :
  //  -
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Tue Jan 23 16:47:32 2018 - Herve Ledoux on LDEV
  //  - Last modification : Tue Jan 23 16:47:32 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function _f_resync_indent_prefix() {
    let lo_console = _f_get_console();
    lo_console.as_indent_prefix = (lo_console.as_indent_base + cs_console_indent_step.repeat(lo_console.ai_indent_level));
    return(lo_console.as_indent_prefix);
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - similar to [f_console_info(...)] - yet increase the indentation
  //  ARGUMENTS :
  //  - a list of values to be traced
  //  RETURN VALUE :
  //  - none
  //  HISTORY :
  //  - Creation          : Tue Jan 23 13:45:53 2018 - Herve Ledoux on LDEV
  //  - Last modification : Tue Jan 23 13:45:53 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_console_indent(...pa_var_args) {
    let lo_console = _f_get_console();

    let ls_msg = _f_concat_var_args(cs_console_join_args_sep, pa_var_args);
    if (ls_msg) {
      _f_trace_out_with_date(
        true, // pb_with_timestamp
        true, // pb_with_indent
        true, // pb_with_newline_after
        true, // pb_pass_to_msg_handler
        true, // pb_show_context
        ci_console_severity_info,
        ls_msg);
    }

    lo_console.ai_indent_level += 1;

    // Make child processes inherit from the current log indentation
    process.env.XCCC_CONSOLE_INDENT = _f_resync_indent_prefix();
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - exact symmetry of [f_console_indent(...)] - should be perfectly paired
  //  ARGUMENTS :
  //  - a list of values to be traced
  //  RETURN VALUE :
  //  - none
  //  HISTORY :
  //  - Creation          : Tue Jan 23 13:46:01 2018 - Herve Ledoux on LDEV
  //  - Last modification : Tue Jan 23 13:46:01 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_console_unindent(...pa_var_args) {
    let lo_console = _f_get_console();

    if (lo_console.ai_indent_level < 1) {
      _f_console_fatal("inconsistent indent level", new Error("tried to call [f_console_unindent()] while no corresponding [f_console_indent()]"));
    }

    lo_console.ai_indent_level -= 1;

    // Make child processes inherit from the current log indentation
    process.env.XCCC_CONSOLE_INDENT = _f_resync_indent_prefix();

    let ls_msg = _f_concat_var_args(cs_console_join_args_sep, pa_var_args);
    if (ls_msg) {
      _f_trace_out_with_date(
        true, // pb_with_timestamp
        true, // pb_with_indent
        true, // pb_with_newline_after
        true, // pb_pass_to_msg_handler
        true, // pb_show_context
        ci_console_severity_info,
        ls_msg);
    }
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - f_console_block is a handy short-cut for:
  //
  //  f_console_indent(...);
  //  {
  //    ...
  //  }
  // f_console_unindent();
  //  ARGUMENTS :
  //  - ps_msg: a message passed to f_console_info(...)
  //  - pf_sub_to_exec: a function to be excuted within the indented block
  //  RETURN VALUE :
  //  - the value returned by [pf_sub_to_exec]
  //  HISTORY :
  //  - Creation          : Tue Jan 23 12:01:40 2018 - Herve Ledoux on LDEV
  //  - Last modification : Tue Jan 23 12:01:40 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_console_block(ps_msg, pf_sub_to_exec) {

    // the sub-function materializing the block can return a value - we just pass it back to the caller
    let lx_result;

    try {

      // sanity Check [ps_msg] must be a string, and [pf_sub_to_exec] a sub
      if (typeof(ps_msg) !== "string") {
        throw f_console_error("f_console_block expects its first argument to be a scalar or undef");
      }

      if (typeof(pf_sub_to_exec) !== "function") {
        throw f_console_error("f_console_block expects its second argument to be a function");
      }

      f_console_indent(ps_msg);
      lx_result = pf_sub_to_exec();
      f_console_unindent();
    }

    catch (ps_error) {
      // ...
    }

    return(lx_result);
  }


  function f_console_start(...pa_var_args) {
    return(f_console_indent(`${cs_console_separator_short} {cs_console_progname} - `, ((pa_var_args.length) ? _f_concat_var_args(cs_console_join_args_sep, pa_var_args) : "start")));
  }


  function f_console_stop(...pa_var_args) {
    return(f_console_unindent(`${cs_console_separator_short} ${cs_console_progname} - `, ((pa_var_args.length) ? _f_concat_var_args(cs_console_join_args_sep, pa_var_args) : "end")));
  }


  function f_console_separator(...pa_var_args) {
    return((pa_var_args.length) ?
           f_console_info(cs_console_separator_short, " ", _f_concat_var_args(cs_console_join_args_sep, pa_var_args)) :
           f_console_info(cs_console_separator_long));
  }




  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - function meant to be typically called within a block:
  //
  //    catch (po_err) {
  //      f_console_catch(po_err);
  //    }
  //
  //  ARGUMENTS :
  //  - po_err: the unexpected error to handle
  //  - pf_console_xxx (opt): the function used to report this unexpected error - by default, f_console_fatal
  //  RETURN VALUE :
  //  - none
  //  HISTORY :
  //  - Creation          : Fri Jul  6 06:41:44 2018 - Herve Ledoux on DDEV
  //  - Last modification : Fri Jul  6 06:46:50 2018 - Herve Ledoux on DDEV
  // ********************************************************************
  function f_console_catch(po_err, pf_console_xxx) {

    if (! po_err) {
      return;
    }

    // when [po_err] is an object returned by [f_console_...],
    // then no need to report this same error again
    if ((typeof(po_err) === "object") && (po_err.as_message)) {
      return;
    }

    // at this point, report the unexpected error
    if (! pf_console_xxx) {
      pf_console_xxx = f_console_fatal;
    }

    pf_console_xxx(`caught unexpected error [${po_err}]`);
  }



  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - set / get global verbosity level
  //  ARGUMENTS :
  //  -
  //  RETURN VALUE :
  //  - the current verbosity level
  //  HISTORY :
  //  - Creation          : Tue Jan 23 12:18:34 2018 - Herve Ledoux on LDEV
  //  - Last modification : Tue Jan 23 12:18:34 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_console_verbosity_set(pi_verbosity_level) {
    let lo_console = _f_get_console();

    try {

      if ((typeof(pi_verbosity_level) !== "number") ||
          (pi_verbosity_level < 0)) {
        throw f_console_error(`f_console_verbosity_set(...) expects an integer, zero or positive - not [${pi_verbosity_level}]`);
      }

      lo_console.ai_verbosity_level = pi_verbosity_level;
    }

    catch (ps_error) {
      // ...
    }

    return(lo_console.ai_verbosity_level);
  }


  function f_console_verbosity_get() {
    let lo_console = _f_get_console();
    return(lo_console.ai_verbosity_level);
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - A special version of f_console_info(...) that trace only when
  //    pi_verbosity_level >= the current verbosity level
  //  ARGUMENTS :
  //  -
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Tue Jan 23 12:18:03 2018 - Herve Ledoux on LDEV
  //  - Last modification : Tue Jan 23 12:18:03 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_console_verbose(pi_verbosity_level, ...pa_var_args) {
    let lo_result;

    let lo_console = _f_get_console();
    if (pi_verbosity_level <= lo_console.ai_verbosity_level) {
      lo_result = f_console_inspect.apply(f_console_inspect, pa_var_args);
    }

    return(lo_result);
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - A special version of [f_console_info] that does NOT append a new-line at
  //    the end of the output - those messages are NOT passed to the callback
  //  ARGUMENTS :
  //  - pb_with_timestamp: print a prefix or not
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Tue Jan 23 12:09:12 2018 - Herve Ledoux on LDEV
  //  - Last modification : Tue Jan 23 12:09:12 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_console_progress(pb_with_timestamp, ...pa_var_args) {

    const ls_msg = _f_concat_var_args(cs_console_join_args_sep, pa_var_args);

    _f_trace_out_with_date(
      pb_with_timestamp, // pb_with_timestamp
      false, // pb_with_indent
      false, // pb_with_newline_after
      false, // pb_pass_to_msg_handler
      false, // pb_show_context
      ci_console_severity_info,
      ls_msg);

    return(null);
  }


  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  -
  //  ARGUMENTS :
  //  -
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Tue Jan 23 13:46:44 2018 - Herve Ledoux on LDEV
  //  - Last modification : Tue Jan 23 13:46:44 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_console_get_count_errors() {
    let lo_console = _f_get_console();
    return(lo_console.ai_count_errors);
  }

  function f_console_get_count_warnings() {
    let lo_console = _f_get_console();
    return(lo_console.ai_count_warnings);
  }

  function f_console_get_count_alerts() {
    let lo_console = _f_get_console();
    return(lo_console.ai_count_alerts);
  }



  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  -
  //  ARGUMENTS :
  //  -
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Tue Jan 23 13:48:37 2018 - Herve Ledoux on LDEV
  //  - Last modification : Tue Jan 23 13:48:37 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_console_dump_stats() {
    let lo_console = _f_get_console();
    f_console_warning(`console captured a total of [${lo_console.ai_count_warnings}] warnings, [${lo_console.ai_count_alerts}] alerts, [${lo_console.ai_count_errors}] errors - callback invoked [${lo_console.ai_callback_calls}] times`);
  }



  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - Execute a sequence [pf_sub] only when the given [ps_pkg] is active in
  //    [XCCC_CONSOLE_DEBUG_PKG]
  //  ARGUMENTS :
  //
  //  - ps_pkg: the symbolic name of the current package / module - usually the
  //    constant [__filename]
  //
  //  - pf_sub: the code to conditionally execute according to the settings
  //    related to [ps_pkg] in variable [XCCC_CONSOLE_DEBUG_PKG]
  //
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Tue Jan 23 13:48:47 2018 - Herve Ledoux on LDEV
  //  - Last modification : Tue Jan 23 13:48:47 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_console_debug_pkg(ps_pkg, pf_sub) {
    let lx_result;

    if ((_gh_debug_pkg) &&
        (ps_pkg) &&
        (pf_sub) &&
        (_gh_debug_pkg.get(_f_extract_pkg_name(ps_pkg)))) {
      lx_result = pf_sub();
    }

    return(lx_result);
  }




  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  -
  //  ARGUMENTS :
  //  - ps_pkg: usually [__filename]
  //  - ps_name: symbolic name associated to the chronometer
  //  - pf_sub_to_exec: the code to execute
  //  RETURN VALUE :
  //  - the result returned by [pf_sub_to_exec(...)]
  //  HISTORY :
  //  - Creation          : Tue Jan 23 13:48:54 2018 - Herve Ledoux on LDEV
  //  - Last modification : Tue Jan 23 13:48:54 2018 - Herve Ledoux on LDEV
  // ********************************************************************
  function f_console_debug_chrono(ps_pkg, ps_name, pf_sub_to_exec) {
    let lx_result;

    // in debug / trace mode
    if ((_gh_debug_pkg) &&
        (_gh_debug_pkg.get(ps_pkg))) {
      f_console_indent(`f_console_debug_chrono[${ps_name}] - begin`);

      let li_start = Date.now();
      lx_result = pf_sub_to_exec();
      let li_elapsed_ms = Math.round(Date.now() - li_start);

      f_console_unindent(`f_console_debug_chrono[${ps_name}] - end - spent [${li_elapsed_ms} ms]`);
    }

    // not in debug / trace mode
    else {
      lx_result = pf_sub_to_exec();
    }

    return(lx_result);
  }



  // ##UNIT-TEST## Unitary self-testing of the library - This code
  // should move to an external script of unitary tests - NodeJS ?
  function f_console_lib_self_test() {

    let lo_complex_object = {
      a: "this",
      b: "is",
      c: "a",
      d: "complex",
      e: ["object", "to", "inspect" ]
    };

    f_console_inspect("f_console_inspect=", lo_complex_object, "- DONE");
    f_console_assert(true, "f_console_assert:", " this", " is", " an", " assert", " ok", " - DONE");
    f_console_assert(false, "f_console_assert:", " this", " is", " an", " assert", " FAILED", " - DONE");

    f_console_info("f_console_info:", " this", " is", " an", " info", " - DONE");
    f_console_warning("f_console_warning:", " this", " is", " a", " warning", " - DONE");
    f_console_alert("f_console_alert:", " this", " is", " an", " alert", " - DONE");
    f_console_error("f_console_error:", " this", " is", " an", " error", " - DONE");
    f_console_fatal("f_console_fatal:", " this", " is", " a", " fatal error", " - DONE");
  }



  // exports
  module.exports.ci_console_severity_info = ci_console_severity_info;
  module.exports.ci_console_severity_warning = ci_console_severity_warning;
  module.exports.ci_console_severity_alert = ci_console_severity_alert;
  module.exports.ci_console_severity_error = ci_console_severity_error;
  module.exports.ci_console_severity_fatal = ci_console_severity_fatal;

  module.exports.cs_console_severity_info = cs_console_severity_info;
  module.exports.cs_console_severity_warning = cs_console_severity_warning;
  module.exports.cs_console_severity_alert = cs_console_severity_alert;
  module.exports.cs_console_severity_error = cs_console_severity_error;
  module.exports.cs_console_severity_fatal = cs_console_severity_fatal;

  module.exports.f_console_OUTGOING_CNX = f_console_OUTGOING_CNX;
  module.exports.f_console_alert = f_console_alert;
  module.exports.f_console_assert = f_console_assert;
  module.exports.f_console_block = f_console_block;
  module.exports.f_console_catch = f_console_catch;
  module.exports.f_console_configure = f_console_configure;
  module.exports.f_console_debug_chrono = f_console_debug_chrono;
  module.exports.f_console_debug_pkg = f_console_debug_pkg;
  module.exports.f_console_dump_stats = f_console_dump_stats;
  module.exports.f_console_error = f_console_error;
  module.exports.f_console_fatal = f_console_fatal;
  module.exports.f_console_get_count_alerts = f_console_get_count_alerts;
  module.exports.f_console_get_count_errors = f_console_get_count_errors;
  module.exports.f_console_get_count_warnings = f_console_get_count_warnings;
  module.exports.f_console_indent = f_console_indent;
  module.exports.f_console_info = f_console_info;
  module.exports.f_console_inspect = f_console_inspect;
  module.exports.f_console_lib_self_test = f_console_lib_self_test;
  module.exports.f_console_progress = f_console_progress;
  module.exports.f_console_security_issue = f_console_security_issue;
  module.exports.f_console_separator = f_console_separator;
  module.exports.f_console_start = f_console_start;
  module.exports.f_console_stop = f_console_stop;
  module.exports.f_console_stringify = f_console_stringify;
  module.exports.f_console_unindent = f_console_unindent;
  module.exports.f_console_verbose = f_console_verbose;
  module.exports.f_console_verbosity_get = f_console_verbosity_get;
  module.exports.f_console_verbosity_set = f_console_verbosity_set;
  module.exports.f_console_warning = f_console_warning;


}());
