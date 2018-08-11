
// ********************************************************************
//  - this is the class [TC_ccc_wbs_queue] representing a generic connector to
//    a Web-service provider
//
//    based on NPM component: https://caolan.github.io/async/docs.html#queue
// ********************************************************************



(function () {
  "use strict";


  const {
    f_console_OUTGOING_CNX,
    f_console_alert,
    f_console_catch,
    f_console_error,
    f_console_fatal,
    f_console_stringify,
    f_console_verbose,
  } = require("ccc_console");



  const {
    f_chrono_elapsed_ms,
    f_chrono_start,
    f_chrono_stop,
    f_date_format_iso,
    f_date_now_ms,
    f_digest_md5_hex,
    f_human_duration,
    f_is_defined,
    f_is_not_defined,
    f_is_true,
    f_join_non_blank_vals,
    f_number_max,
    f_number_min,
    f_number_round_with_precision,
    f_object_extend,
    f_object_iterate,
    f_string_is_blank,
    f_string_is_not_blank,
    f_string_remove_trailing_slash
  } = require("ccc_utils");


  const cm_request = require("request");
  const cm_async = require("async");


  class TC_ccc_wbs_queue {

    // ********************************************************************
    //  - PUBLIC METHODS
    // ********************************************************************



    // ********************************************************************
    //  FUNCTION DESCRIPTION :
    //  - Create a brand new Wbs queue
    //  ARGUMENTS :
    //  - pf_json_callback
    //  - pf_queue_drain
    //  - pf_queue_empty
    //  - pi_concurrency
    //  - pi_max_calls
    //  - pi_max_rate_cps
    //  - pi_timeout_ms
    //  - ps_connector_name
    //  - ps_http_pass
    //  - ps_http_user
    //  - ps_method
    //  - ps_url_end_point
    //  - ps_url_path
    //  RETURN VALUE :
    //  -
    //  HISTORY :
    //  - Creation          : Wed Jul 11 12:57:52 2018 - Herve Ledoux on DDEV
    //  - Last modification : Wed Jul 11 12:57:52 2018 - Herve Ledoux on DDEV
    // ********************************************************************

    constructor(ph_args) {

      const lo_this = this;

      lo_this._ab_call_limit_reached = false;
      lo_this._ab_first_call = true;
      lo_this._ai_call_count_exec_total = 0; // total number of calls actually executed
      lo_this._ai_call_count_pushed_total = 0; // total number of calls pushed into the queue
      lo_this._ai_call_duration_max_ms = null;
      lo_this._ai_call_duration_min_ms = null;
      lo_this._ai_call_duration_total_ms = 0;
      lo_this._ai_latest_call_started_at_ms = 0; // time of latest call
      lo_this._ai_parallel_current = 0; // current number of parallel requests
      lo_this._ai_parallel_max = 0; // max number of requests observed in parallel
      lo_this._ai_queue_len_max = 0; // max observed length of queue ##TODO##
      lo_this._as_connector_name = "anon-connector";


      // the map of default options
      lo_this._ah_default_options = { };

      lo_this._as_connector_name = lo_this.m_pick_option(ph_args, "ps_connector_name");

      // base default values
      lo_this._m_set_default_options({
        pi_concurrency: 10, // max number of parallel workers
        pi_max_calls: null, // a null value means [no limit]
        pi_max_rate_cps: 3, // max calls per seconds
        pi_timeout_ms: 60000,
        ps_method: "get",
      });

      // any extra argument is considered as a default value for the future
      lo_this._m_set_default_options(ph_args);

      // compute an internal name for the chronometer associated to this
      // connector / queue
      lo_this._as_queue_chrono_name = f_digest_md5_hex(f_join_non_blank_vals('~', lo_this._m_get_connector_name(), f_date_format_iso()));
    }



    // ********************************************************************
    //  FUNCTION DESCRIPTION :
    //  - return the total number of calls pushed into the queue
    //  ARGUMENTS :
    //  - none
    //  RETURN VALUE :
    //  -
    //  HISTORY :
    //  - Creation          : Wed Jul 11 13:38:34 2018 - Herve Ledoux on DDEV
    //  - Last modification : Wed Jul 11 13:38:34 2018 - Herve Ledoux on DDEV
    // ********************************************************************
    m_get_call_count_pushed() {
      const lo_this = this;
      return(lo_this._ai_call_count_pushed_total);
    }



    m_get_context(...pa_args) {
      const lo_this = this;
      pa_args.unshift(lo_this._m_get_connector_name());
      return(f_join_non_blank_vals(" - ", pa_args));
    }



    // method to pick an option, or the corresponding default value when
    // relevant
    m_pick_option(ph_args, ps_opt_name, pb_optional) {
      const lo_this = this;

      try {
        if (f_string_is_blank(ps_opt_name)) {
          throw f_console_fatal("${lo_this.m_get_context()} - missing option [ps_opt_name]");
        }

        if (f_is_defined(ph_args)) {
          // a value was explicitely passed - great - this is the one
          const lx_opt_val = ph_args[ps_opt_name];
          if (f_is_defined(lx_opt_val)) {
            f_console_verbose(2, `${lo_this.m_get_context()} - deduced option [${ps_opt_name}]=[${lx_opt_val}] from current context`);
            return(lx_opt_val);
          }
        }

        // otherwise, try to find a default value
        const lx_opt_def_val = lo_this._m_pick_default_option(ps_opt_name);
        if (f_string_is_not_blank(lx_opt_def_val)) {
          f_console_verbose(2, `${lo_this.m_get_context()} - deduced option [${ps_opt_name}]=[${lx_opt_def_val}] from default settings`);
          return(lx_opt_def_val);
        }

        if (! pb_optional) {
          throw f_console_fatal(`${lo_this.m_get_context()} - no default value for mandatory arg [${ps_opt_name}]`);
        }
      }

      catch (po_err) {
        f_console_catch(po_err);
      }

      // no value at all
      return(null);
    }




    // ********************************************************************
    //  FUNCTION DESCRIPTION :
    //  - push a request into the connector queue. This request will be asycnrhonously processed.
    //  ARGUMENTS (hash): refer to [_m_exec_http_request.ph_args]
    //  - pb_high_priority: when true, the query is added at the head of the queue - instead of the tail normally
    //  - pf_json_callback
    //  - pi_timeout_ms
    //  - ps_call_context
    //  - ps_http_pass
    //  - ps_http_user
    //  - ps_method
    //  - ps_url_end_point
    //  - ps_url_path
    //  RETURN VALUE :
    //  -
    //  HISTORY :
    //  - Creation          : Mon Jul  2 16:17:23 2018 - Herve Ledoux on DDEV
    //  - Last modification : Thu Aug  9 09:34:30 2018 - Herve Ledoux on DDEV
    // ********************************************************************
    m_submit_http_request(ph_args) {
      const lo_this = this;

      try {

        // call limit already reached ? - silently exit
        if (lo_this._ab_call_limit_reached) {
          return;
        }

        const pi_max_calls = lo_this.m_pick_option(ph_args, "pi_max_calls", true);
        const li_call_count = lo_this.m_get_call_count_pushed();

        // when we reached the max number of calls to this server, just stop now
        if (f_is_defined(pi_max_calls) && (li_call_count >= pi_max_calls)) {
          lo_this._ab_call_limit_reached = true;
          throw f_console_alert(`${lo_this.m_get_context()} - total of [${li_call_count}] calls, reached the limit pi_max_calls=[${pi_max_calls}] - stopping`);
        }


        // on-the-fly create a new async queue object, when required
        if (! lo_this._ao_query_queue) {
          const pi_concurrency = lo_this.m_pick_option(ph_args, "pi_concurrency");
          const pi_max_rate_cps = lo_this.m_pick_option(ph_args, "pi_max_rate_cps");

          f_console_verbose(1, `${lo_this.m_get_context()} - initializing async WBS queue with concurrency=[${pi_concurrency}] and rate-limit=[${pi_max_rate_cps} cps]`);

          // https://caolan.github.io/async/docs.html#QueueObject
          const lo_new_queue = cm_async.queue(function (ph_args, pf_process_next_in_queue) {
            lo_this._m_queue_worker(ph_args, pf_process_next_in_queue);
          }, pi_concurrency);


          // branch events
          lo_new_queue.drain = function () {
            lo_this._m_queue_drain();
          };

          lo_new_queue.empty = function () {
            lo_this._m_queue_empty();
          };

          lo_this._ao_query_queue = lo_new_queue;
        }

        const ps_call_context = lo_this.m_pick_option(ph_args, "ps_call_context");
        if (f_string_is_blank(ps_call_context)) {
          throw f_console_fatal(`${lo_this.m_get_context()} - missing option [ps_call_context]`);
        }

        f_console_verbose(2, `${lo_this.m_get_context(ps_call_context)} - pushing arguments:`, ph_args);

        const pb_high_priority = f_is_true(lo_this.m_pick_option(ph_args, "pb_high_priority", true));
        if (pb_high_priority) {
          f_console_verbose(1, `${lo_this.m_get_context(ps_call_context)} - scheduling query in high priority`);
          lo_this._ao_query_queue.unshift(ph_args);
        }

        else {
          lo_this._ao_query_queue.push(ph_args);
        }

        lo_this._ai_call_count_pushed_total ++;
        lo_this._ai_queue_len_max = f_number_max(lo_this._ai_queue_len_max, lo_this._ao_query_queue.length());
      }

      catch (po_err) {
        f_console_catch(po_err);
      }
    }




    // ********************************************************************
    //  - PRIVATE METHODS
    // ********************************************************************
    _m_get_connector_name() {
      const lo_this = this;
      return(lo_this._as_connector_name);
    }



    // define / overload some default values
    // ph_args is a hash of pairs [option ==> default value]
    _m_set_default_options(ph_args) {
      const lo_this = this;

      f_object_iterate(ph_args, function (ps_opt_name, px_opt_value) {
        f_console_verbose(2, `${lo_this.m_get_context()} - set default option [${ps_opt_name}]=[${px_opt_value}]`);
        lo_this._ah_default_options[ps_opt_name] = px_opt_value;
      });
    }



    // return the default value for a given option
    _m_pick_default_option(ps_opt_name) {
      const lo_this = this;
      return(lo_this._ah_default_options[ps_opt_name]);
    }




    // ********************************************************************
    //  FUNCTION DESCRIPTION :
    //  - worker to extract and execute a request from the queue
    //  ARGUMENTS :
    //  -
    //  RETURN VALUE :
    //  -
    //  HISTORY :
    //  - Creation          : Fri Jul  6 11:51:24 2018 - Herve Ledoux on DDEV
    //  - Last modification : Fri Aug 10 14:08:08 2018 - Herve Ledoux on DDEV
    // ********************************************************************
    _m_queue_worker(ph_args, pf_process_next_in_queue) {
      const lo_this = this;

      // min time between two successive calls to the server
      const pi_max_rate_cps = lo_this.m_pick_option(ph_args, "pi_max_rate_cps");
      const li_min_between_two_calls_ms = f_number_round_with_precision((1000 / pi_max_rate_cps), 0);

      // current time
      const li_now_ms = f_date_now_ms();

      // how long since the previous call
      const li_elapsed_since_previous_call_ms = (li_now_ms - lo_this._ai_latest_call_started_at_ms);

      // time to wait before issuing a new call
      const li_timeout_before_next_call_ms = ((li_elapsed_since_previous_call_ms > li_min_between_two_calls_ms) ? 0 : (li_min_between_two_calls_ms - li_elapsed_since_previous_call_ms));

      f_console_verbose(2, `${lo_this.m_get_context()} - next call in [${f_human_duration(li_timeout_before_next_call_ms, true)}]`);
      lo_this._ai_latest_call_started_at_ms = (li_now_ms + li_timeout_before_next_call_ms);

      // differ the execution of this next call
      setTimeout(function () {
        lo_this._m_exec_http_request(ph_args, pf_process_next_in_queue);
      }, li_timeout_before_next_call_ms);
    }




    // ********************************************************************
    //  FUNCTION DESCRIPTION :
    //  - submit an HTTP request to the end-point
    //  ARGUMENTS (hash):
    //  - pf_json_callback
    //  - ps_call_context
    //  - ps_url_end_point (opt)
    //  - ps_url_path: the path part of of the URL to call
    //  - pi_timeout_ms:
    //
    //  - ph_query_opts: extra options directly passed to request(options, callback)
    //    https://github.com/request/request#requestoptions-callback
    //
    //  RETURN VALUE :
    //  -
    //  HISTORY :
    //  - Creation          : Mon Jul  2 13:02:28 2018 - Herve Ledoux on DDEV
    //  - Last modification : Thu Jul  5 16:12:45 2018 - Herve Ledoux on DDEV
    // ********************************************************************
    _m_exec_http_request(ph_args, pf_process_next_in_queue) {
      const lo_this = this;

      const ph_query_opts = ph_args.ph_query_opts;

      const pf_json_callback = lo_this.m_pick_option(ph_args, "pf_json_callback");
      const pi_timeout_ms = lo_this.m_pick_option(ph_args, "pi_timeout_ms");
      const ps_call_context = lo_this.m_pick_option(ph_args, "ps_call_context");
      const ps_method = lo_this.m_pick_option(ph_args, "ps_method");
      const ps_url_end_point = lo_this.m_pick_option(ph_args, "ps_url_end_point");
      const ps_url_path = lo_this.m_pick_option(ph_args, "ps_url_path");

      const ls_url_full = f_join_non_blank_vals('',  f_string_remove_trailing_slash(ps_url_end_point), ps_url_path);


      // credentials to call our own services
      const ps_http_pass = lo_this.m_pick_option(ph_args, "ps_http_pass", true);
      const ps_http_user = lo_this.m_pick_option(ph_args, "ps_http_user", true);

      /* eslint multiline-ternary:0, no-ternary:0 */
      const lh_auth = (f_string_is_blank(ps_http_pass) ? null : {
        user: ps_http_user,
        pass: ps_http_pass,
        sendImmediately: true
      });


      // one more call
      lo_this._ai_call_count_exec_total ++;
      f_chrono_start(lo_this._as_queue_chrono_name);

      // at first call
      if (lo_this._ab_first_call) {
        lo_this._ab_first_call = false;
        f_console_OUTGOING_CNX(`target=[${ls_url_full}] login=[${ps_http_user}] way=[push] comment=[connection ${lo_this.m_get_context(ps_call_context)}]`);
      }

      const ls_full_call_context = lo_this.m_get_context(`[#${lo_this._ai_call_count_exec_total}]`, ps_call_context);

      f_console_verbose(1, `${ls_full_call_context} - init`);

      // https://github.com/request/request#requestoptions-callback
      const lh_query_opts = f_object_extend({
        method: ps_method,
        url: ls_url_full,

        agent: false,
        auth: lh_auth,
        encoding: "utf8",
        json: true,
        rejectUnauthorized: false,
        requestCert: false,
        timeout: pi_timeout_ms,
      }, ph_query_opts);

      const ls_call_chrono_name = f_digest_md5_hex(f_join_non_blank_vals('~', lo_this._as_queue_chrono_name, lo_this._ai_call_count_exec_total, f_date_format_iso()));
      f_chrono_start(ls_call_chrono_name);


      // one more pending request in parallel...
      lo_this._ai_parallel_current ++;
      lo_this._ai_parallel_max = f_number_max(lo_this._ai_parallel_max, lo_this._ai_parallel_current);

      cm_request(lh_query_opts, function(ps_error, po_response, po_json_response) {

        // one less pending request in parallel...
        lo_this._ai_parallel_current --;

        const li_call_duration_ms = f_chrono_elapsed_ms(ls_call_chrono_name);
        f_console_verbose(2, `${ls_full_call_context} - call took [${f_human_duration(li_call_duration_ms, true)}]`);

        // collect stats
        lo_this._ai_call_duration_total_ms += li_call_duration_ms;
        lo_this._ai_call_duration_max_ms = f_number_max(lo_this._ai_call_duration_max_ms, li_call_duration_ms);
        lo_this._ai_call_duration_min_ms = f_number_min(lo_this._ai_call_duration_min_ms, li_call_duration_ms);

        try {

          // error ?
          if (f_string_is_not_blank(ps_error)) {
            throw f_console_error(`${ls_full_call_context} - ${ps_error}`);
          }

          const li_statusCode = po_response.statusCode;
          if (li_statusCode !== 200) {
            throw f_console_error(`${ls_full_call_context} - call returned statusCode=[${li_statusCode} / ${po_response.statusMessage}] on URL=[${ls_url_full}] - reponse=[${f_console_stringify(po_json_response)}]`);
          }

          if (f_is_not_defined(po_json_response)) {
            throw f_console_error(`${ls_full_call_context} - returned an empty body`);
          }

          f_console_verbose(3, `${ls_full_call_context} - returned statusCode=[${li_statusCode}] with raw response:`, {
            po_json_response: po_json_response
          });

          if (f_is_defined(po_json_response.errors)) {
            throw f_console_error(`${ls_full_call_context} - errors=[${f_console_stringify(po_json_response.errors)}]`);
          }

          if (f_is_defined(po_json_response.error)) {
            throw f_console_error(`${ls_full_call_context} - error=[${f_console_stringify(po_json_response.error)}]`);
          }

          // give a context to the reply
          po_json_response.as_call_context = ls_full_call_context;

          // positive feed-back through the call-back
          pf_json_callback(null, po_json_response);
        }

        catch (po_err) {
          f_console_catch(po_err);
        }

        // handle the next pending element in the queue
        f_console_verbose(2, `${lo_this.m_get_context()} - next in queue...`);
        pf_process_next_in_queue();
      });
    }


    // ********************************************************************
    //  FUNCTION DESCRIPTION :
    //  - method called on 'empty' event - when the last item from the queue is given to a worker
    //  ARGUMENTS :
    //  - none
    //  RETURN VALUE :
    //  -
    //  HISTORY :
    //  - Creation          : Mon Jul  2 17:48:43 2018 - Herve Ledoux on DDEV
    //  - Last modification : Fri Aug 10 18:08:46 2018 - Herve Ledoux on DDEV
    // ********************************************************************
    _m_queue_empty() {
      const lo_this = this;

      if (lo_this._ai_call_count_pushed_total) {
        f_console_verbose(1, `${lo_this.m_get_context("empty")} - total of [${lo_this._ai_call_count_pushed_total}] calls submitted to the queue`);
      }

      // is there a call-back associated to the event [queue_empty] ?
      const pf_queue_empty = lo_this.m_pick_option(null, "pf_queue_empty", true);
      if (pf_queue_empty) {
        pf_queue_empty();
      }
    }



    // ********************************************************************
    //  FUNCTION DESCRIPTION :
    //  - method called on 'drain' event - when the last item from the queue has
    //    returned from the worker
    //  ARGUMENTS :
    //  - none
    //  RETURN VALUE :
    //  -
    //  HISTORY :
    //  - Creation          : Mon Jul  2 17:48:43 2018 - Herve Ledoux on DDEV
    //  - Last modification : Fri Aug 10 18:05:11 2018 - Herve Ledoux on DDEV
    // ********************************************************************
    _m_queue_drain() {
      const lo_this = this;

      const li_duration_global_ms = f_chrono_stop(lo_this._as_queue_chrono_name);
      const li_call_per_sec = f_number_round_with_precision((1000 * lo_this._ai_call_count_exec_total / li_duration_global_ms), 1);

      if (lo_this._ai_call_count_exec_total) {
        f_console_verbose(1, `${lo_this.m_get_context("drain")} - performed a total of [${lo_this._ai_call_count_exec_total}] calls in [${f_human_duration(li_duration_global_ms, true)}] at cps=[${li_call_per_sec}], max-parallel=[${lo_this._ai_parallel_max}], max-length=[${lo_this._ai_queue_len_max}], dur-avg=[${f_human_duration((lo_this._ai_call_duration_total_ms / lo_this._ai_call_count_exec_total), true)}], dur-min=[${f_human_duration(lo_this._ai_call_duration_min_ms, true)}], dur-max=[${f_human_duration(lo_this._ai_call_duration_max_ms, true)}]`);
      }

      // is there a call-back associated to the event [queue_drain] ?
      const pf_queue_drain = lo_this.m_pick_option(null, "pf_queue_drain", true);
      if (pf_queue_drain) {
        pf_queue_drain();
      }
    }
  }


  module.exports.TC_ccc_wbs_queue = TC_ccc_wbs_queue;

} ());
