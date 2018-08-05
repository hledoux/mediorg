

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
    f_chrono_elapsed_ms,
    f_chrono_start,
    f_env_get,
    f_get_first_val,
    f_human_duration,
    f_is_array,
    f_is_defined,
    f_is_object,
    f_string_is_not_blank,
  } = require("ccc_utils");


  const cm_commander = require("commander");
  const cm_fs = require('fs');


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

    _m_parse_cmd_line() {
      const lo_this = this;

      let li_verbosity = 0;
      function lf_opt_increase_verbosity() {
        li_verbosity ++;
        f_console_verbosity_set(li_verbosity);
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
          lo_this._m_scan_command(ps_dir);
        });

      // Create a digest from a file
      // https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm_options


      // Node EXIF
      // https://github.com/gomfunkel/node-exif



      // parse the command line
      cm_commander.parse(process.argv);

      // extract command-line arguments
      // ##TODO##
      // lo_this._ai_cisco_api_max_rate_cps = cm_commander.ciscoApiRateCps;
    }


    _m_scan_command(ps_dir) {
      const lo_this = this;

      try {
        f_chrono_start("_m_scan_command");

        function lf_when_finished(pi_dir_count, pi_file_count) {
          f_console_verbose(1, `examined a total of [${pi_file_count}] files in [${pi_dir_count}] directories in [${f_human_duration(f_chrono_elapsed_ms("_m_scan_command"), true)}]`);
        }

        lo_this._m_scan_dir(ps_dir, lf_when_finished);
      }

      catch (po_err) {
        f_console_catch(po_err);
      }
    }



    _m_scan_dir(ps_dir, pf_when_finished) {
      const lo_this = this;

      try {
        f_console_verbose(1, `scanning directory [${ps_dir}]`);

        // ##TODO##
        cm_fs.readdir(ps_dir, {
          encoding: 'utf8'
        }, function (po_err, pa_all_dir_entries) {

          if (po_err) {
            return(f_console_catch(po_err));
          }

          const ci_entries_to_process = pa_all_dir_entries.length;
          if (ci_entries_to_process === 0) {
            pf_when_finished(1, 0);
          }

          let li_total_file_count = 0;
          let li_total_dir_count = 0;

          let li_count_down = ci_entries_to_process;

          pa_all_dir_entries.forEach(function (ps_one_dir_entry) {
            lo_this._m_scan_dir_entry(ps_dir, ps_one_dir_entry, function (pi_dir_count, pi_file_count) {
              li_total_dir_count += pi_dir_count;
              li_total_file_count += pi_file_count;

              li_count_down --;

              if (li_count_down === 0) {
                pf_when_finished(li_total_dir_count + 1, li_total_file_count);
              }
            });
          });
        });
      }

      catch (po_err) {
        f_console_catch(po_err);
      }
    }


    _m_scan_dir_entry(ps_parent_dir, ps_dir_entry, pf_when_finished) {
      const lo_this = this;

      try {
        const ls_dir_entry_full_path = `${ps_parent_dir}/${ps_dir_entry}`;

        f_console_verbose(2, `found [${ls_dir_entry_full_path}]`);

        cm_fs.stat(ls_dir_entry_full_path, function (po_err, po_dir_entry_stats) {
          if (po_err) {
            return(f_console_catch(po_err));
          }

          if (po_dir_entry_stats.isDirectory()) {
            return(lo_this._m_scan_dir(ls_dir_entry_full_path, pf_when_finished));
          }

          pf_when_finished(0, 1);
        });
      }

      catch (po_err) {
        f_console_catch(po_err);
      }
    }
  }

  module.exports.TC_mediorg = TC_mediorg;

} ());
