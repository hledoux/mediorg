Two types of modules here:


1- the external modules (usually from npmjs.org / github.com) that we decided to
   embed in the common toolkit

  install them with a command like
    npm install --save <module>

  example:
    npm install --save yargs


  this will update those files (to be committed):
    M package-lock.json
    M package.json

  NEVER add / commit node_modules to CVS or git.


  external NPM modules currently embedded in Xccc:
    - async
    - chai
    - commander
    - mocha
    - request




2- our own specific home-made modules

  exactly one sub-dir per module:
    ccc_console
    ccc_utils

  with a structure like: (find ccc* | grep -v CVS)
    ccc_console
    ccc_console/package.json
    ccc_console/ccc_console.js
    ccc_utils
    ccc_utils/package.json
    ccc_utils/ccc_utils.js
