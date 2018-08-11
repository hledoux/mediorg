

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
    f_case_lower,
    f_case_capitalize,
    f_chrono_elapsed_ms,
    f_chrono_start,
    f_env_get,
    f_get_first_val,
    f_human_duration,
    f_is_array,
    f_is_defined,
    f_is_not_defined,
    f_is_object,
    f_join_non_blank_vals,
    f_string_is_blank,
    f_string_is_not_blank,
    f_string_remove_trailing_slash,
  } = require("ccc_utils");


  // standard Node modules
  const cm_fs = require("fs");
  const cm_path = require("path");

  // local dependencies
  const cm_commander = require("commander");
  const cm_exif = require("exif");



  // ********************************************************************
  //  FUNCTION DESCRIPTION :
  //  - file handler for a JPEG picture
  //  ARGUMENTS :
  //  - ps_file_full_path
  //  - pf_callback (ps_error, ph_file_policy)
  //  RETURN VALUE :
  //  -
  //  HISTORY :
  //  - Creation          : Sat Aug 11 18:57:23 2018 - LEDOUX Herve
  //  - Last modification : Sat Aug 11 18:57:23 2018 - LEDOUX Herve
  // ********************************************************************
  function _f_type_handler_jpg(ps_file_full_path, pf_callback) {

    try {
      const lo_exit_img = new cm_exif({
        image : ps_file_full_path
      }, function (ps_error, po_exif_data) {
        if (ps_error) {
          return(pf_callback(ps_error));
        }

        // f_console_verbose(2, po_exif_data);

        const lh_exif_image = po_exif_data.image;
        const lh_exif_exif = po_exif_data.exif;

        const ls_exif_DateTimeOriginal = f_get_first_val(lh_exif_exif.DateTimeOriginal,
                                                         lh_exif_exif.CreateDate,
                                                         lh_exif_image.ModifyDate);

        const ls_exif_Make = f_case_capitalize(lh_exif_image.Make);
        const ls_exif_Model = lh_exif_image.Model;

        // [2017:10:29 15:57:41]
        const ls_exif_year = ls_exif_DateTimeOriginal.slice(0, 4);
        const ls_exif_month = ls_exif_DateTimeOriginal.slice(5, 7);
        const ls_exif_day = ls_exif_DateTimeOriginal.slice(8, 10);

        const ls_policy_date = f_join_non_blank_vals("-", ls_exif_year, ls_exif_month, ls_exif_day);

        const ls_policy_sub_dir = f_join_non_blank_vals("/",
                                                        ls_exif_year,
                                                        f_join_non_blank_vals("-", ls_exif_year, ls_exif_month),
                                                        f_join_non_blank_vals("-", ls_exif_year, ls_exif_month, ls_exif_day));

        // Date + Make + Model
        const ls_policy_name = f_join_non_blank_vals("_",
                                                     ls_policy_date,
                                                     ls_exif_Make,
                                                     ls_exif_Model)
          .replace(/[^-\w]+/g, "_");

        const lh_file_policy = {
          as_ext: "jpg",
          as_base_name: ls_policy_name,
          as_sub_dir: ls_policy_sub_dir,
        };

        pf_callback(null, lh_file_policy);
      });
    }

    catch (po_err) {
      f_console_catch(po_err);
    }
  }



  // the map of file type handlers
  const _co_type_handler = new Map([
    [ ".jpg", _f_type_handler_jpg ],
  ]);


  function _f_get_type_handler(ps_ext) {

    if (f_string_is_blank(ps_ext)) {
      return(null);
    }

    ps_ext = f_case_lower(ps_ext);

    // insert a null entry for this extension, so that the error triggers only once
    if (! _co_type_handler.has(ps_ext)) {
      _co_type_handler.set(ps_ext, null);
      f_console_warning(`no handler for extension [${ps_ext}]`);
    }

    return(_co_type_handler.get(ps_ext));
  }


  // this is a pure functional class - a single instance
  class TC_mediorg {

    // ********************************************************************
    //  - PUBLIC METHODS
    // ********************************************************************
    constructor() {
      const lo_this = this;
    }



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
        .command("scan <dir>")
        .description("scan the given <dir> and look for media files")
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

        ps_dir = f_string_remove_trailing_slash(ps_dir);

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
          encoding: "utf8"
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

          // case of a sub-folder - iterate
          if (po_dir_entry_stats.isDirectory()) {
            return(lo_this._m_scan_dir(ls_dir_entry_full_path, pf_when_finished));
          }

          // when this is a plain file
          if (po_dir_entry_stats.isFile()) {

            // parse / split the file path
            const lh_dir_entry_struct = cm_path.parse(ls_dir_entry_full_path);

            // which is the right hendler for this type of file ?
            const lf_type_handler = _f_get_type_handler(lh_dir_entry_struct.ext);

            // no processing / no handler
            if (f_is_not_defined(lf_type_handler)) {
              return(pf_when_finished(0, 1));
            }

            lf_type_handler(ls_dir_entry_full_path, function(ps_error, ph_file_policy) {
              if (ps_error) {
                throw ps_error;
              }

              // ##TODO##
              f_console_verbose(1, ph_file_policy);
              pf_when_finished(0, 1);
            });
          }
        });
      }

      catch (po_err) {
        f_console_catch(po_err);
      }
    }
  }

  module.exports.TC_mediorg = TC_mediorg;

} ());
