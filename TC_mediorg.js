

// ********************************************************************
//  the main class of the Media Organizer
//
// ********************************************************************


(function () {
  "use strict";

  const {
    f_console_stringify,
    f_console_catch,
    f_console_error,
    f_console_verbose,
    f_console_verbosity_set,
    f_console_warning,
  } = require("ccc_console");


  const {
    f_env_get,
    f_get_first_val,
    f_is_array,
    f_is_defined,
    f_is_object,
    f_string_is_not_blank,
  } = require("ccc_utils");


  const cm_commander = require("commander");


  // this is a pure functional class - a single instance
  class TC_mediorg {

    // ********************************************************************
    //  - PUBLIC METHODS
    // ********************************************************************



    // the main entry-point of this class - just run it
    m_run() {
      const lo_this = this;

      try {
        lo_this._m_parse_cmd_line();

        // ##TODO##
      }

      catch (po_err) {
        f_console_catch(po_err);
      }
    }



    // ********************************************************************
    //  - PRIVATE METHODS
    // ********************************************************************

    _m_get_caption() {
      const lo_this = this;
      return(lo_this.constructor.name);
    }


    _m_check_assert(pb_condition, ps_otherwise_error) {
      const lo_this = this;

      if (! pb_condition) {
        throw f_console_error(`[${lo_this._m_get_caption()}] ${ps_otherwise_error}`);
      }
    }


    _m_parse_cmd_line() {
      const lo_this = this;

      function lf_opt_increase_verbosity(pi_set_to, pi_total) {
        return(pi_total + 1);
      }


      // supported command line options - try --help
      cm_commander
        .option("-v, --verbose", "increase verbosity (try: -v -v -v)", lf_opt_increase_verbosity, 0);


      // Commander
      // https://github.com/tj/commander.js/
      // http://tj.github.io/commander.js/

      cm_commander
        .command('scan <dir>')
        .description('scan the given <dir> and look for media files')
        .action(function(ps_dir) {
          lo_this._m_scan_dir(ps_dir);
        });



      // Create a digest from a file
      // https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm_options


      // Node EXIF
      // https://github.com/gomfunkel/node-exif



      // parse the command line
      cm_commander.parse(process.argv);

      // extract command-line arguments
      lo_this._ai_cisco_api_max_rate_cps = cm_commander.ciscoApiRateCps;
      lo_this._ai_cisco_api_stop_after_calls = cm_commander.ciscoApiStopAfterCalls;
      lo_this._ai_gini_can_cnt = cm_commander.giniCanCnt;
      lo_this._as_gini_end_point = cm_commander.giniEndPoint;

      f_console_verbosity_set(f_get_first_val(cm_commander.verbose, 0));
    }
  }

  module.exports.TC_mediorg = TC_mediorg;

} ());
