const cm_expect = require("chai").expect;


const {
  f_console_stringify
} = require("ccc_console");


const {
  f_case_to_Camel_Snake_Case,
  f_case_to_Http_Header_Case,
  f_case_to_snake_case,
  f_case_to_SNAKE_CASE,
  f_case_to_kebab_case,
  f_case_to_KEBAB_CASE,
  f_case_to_camelCase,
  f_case_to_PascalCase,
  f_case_to_space_case,
  f_case_to_SPACE_CASE
} = require("ccc_utils");



describe("f_case_to...", function() {

  const cs_from_Camel_Snake_Case = "From_Camel_Snake_Case";
  const cs_from_Http_Header_Case = "From-Http-Header-Case";
  const cs_from_snake_case = "from_snake_case";
  const cs_from_SNAKE_CASE = "FROM_SNAKE_CASE";
  const cs_from_kebab_case = "from-kebab-case";
  const cs_from_KEBAB_CASE = "FROM-KEBAB-CASE";
  const cs_from_camelCase = "fromCamelCase";
  const cs_from_PascalCase = "FromPascalCase";
  const cs_from_space_case = "from  space  case";

  const ca_test_list = [
    [ f_case_to_Camel_Snake_Case, null, null ],
    [ f_case_to_Camel_Snake_Case, undefined, undefined ],
    [ f_case_to_Camel_Snake_Case, "", "" ],
    [ f_case_to_Camel_Snake_Case, cs_from_Camel_Snake_Case, "From_Camel_Snake_Case" ],
    [ f_case_to_Camel_Snake_Case, cs_from_Http_Header_Case, "From_Http_Header_Case" ],
    [ f_case_to_Camel_Snake_Case, cs_from_snake_case, "From_Snake_Case" ],
    [ f_case_to_Camel_Snake_Case, cs_from_SNAKE_CASE, "From_Snake_Case" ],
    [ f_case_to_Camel_Snake_Case, cs_from_kebab_case, "From_Kebab_Case" ],
    [ f_case_to_Camel_Snake_Case, cs_from_KEBAB_CASE, "From_Kebab_Case" ],
    [ f_case_to_Camel_Snake_Case, cs_from_camelCase, "From_Camel_Case" ],
    [ f_case_to_Camel_Snake_Case, cs_from_PascalCase, "From_Pascal_Case" ],
    [ f_case_to_Camel_Snake_Case, cs_from_space_case, "From_Space_Case" ],

    [ f_case_to_Http_Header_Case, null, null ],
    [ f_case_to_Http_Header_Case, undefined, undefined ],
    [ f_case_to_Http_Header_Case, "", "" ],
    [ f_case_to_Http_Header_Case, cs_from_Camel_Snake_Case, "From-Camel-Snake-Case" ],
    [ f_case_to_Http_Header_Case, cs_from_Http_Header_Case, "From-Http-Header-Case" ],
    [ f_case_to_Http_Header_Case, cs_from_snake_case, "From-Snake-Case" ],
    [ f_case_to_Http_Header_Case, cs_from_SNAKE_CASE, "From-Snake-Case" ],
    [ f_case_to_Http_Header_Case, cs_from_kebab_case, "From-Kebab-Case" ],
    [ f_case_to_Http_Header_Case, cs_from_KEBAB_CASE, "From-Kebab-Case" ],
    [ f_case_to_Http_Header_Case, cs_from_camelCase, "From-Camel-Case" ],
    [ f_case_to_Http_Header_Case, cs_from_PascalCase, "From-Pascal-Case" ],
    [ f_case_to_Http_Header_Case, cs_from_space_case, "From-Space-Case" ],

    [ f_case_to_snake_case, null, null ],
    [ f_case_to_snake_case, undefined, undefined ],
    [ f_case_to_snake_case, "", "" ],
    [ f_case_to_snake_case, cs_from_Camel_Snake_Case, "from_camel_snake_case" ],
    [ f_case_to_snake_case, cs_from_Http_Header_Case, "from_http_header_case" ],
    [ f_case_to_snake_case, cs_from_snake_case, "from_snake_case" ],
    [ f_case_to_snake_case, cs_from_SNAKE_CASE, "from_snake_case" ],
    [ f_case_to_snake_case, cs_from_kebab_case, "from_kebab_case" ],
    [ f_case_to_snake_case, cs_from_KEBAB_CASE, "from_kebab_case" ],
    [ f_case_to_snake_case, cs_from_camelCase, "from_camel_case" ],
    [ f_case_to_snake_case, cs_from_PascalCase, "from_pascal_case" ],
    [ f_case_to_snake_case, cs_from_space_case, "from_space_case" ],

    [ f_case_to_SNAKE_CASE, null, null ],
    [ f_case_to_SNAKE_CASE, undefined, undefined ],
    [ f_case_to_SNAKE_CASE, "", "" ],
    [ f_case_to_SNAKE_CASE, cs_from_Camel_Snake_Case, "FROM_CAMEL_SNAKE_CASE" ],
    [ f_case_to_SNAKE_CASE, cs_from_Http_Header_Case, "FROM_HTTP_HEADER_CASE" ],
    [ f_case_to_SNAKE_CASE, cs_from_snake_case, "FROM_SNAKE_CASE" ],
    [ f_case_to_SNAKE_CASE, cs_from_SNAKE_CASE, "FROM_SNAKE_CASE" ],
    [ f_case_to_SNAKE_CASE, cs_from_kebab_case, "FROM_KEBAB_CASE" ],
    [ f_case_to_SNAKE_CASE, cs_from_KEBAB_CASE, "FROM_KEBAB_CASE" ],
    [ f_case_to_SNAKE_CASE, cs_from_camelCase, "FROM_CAMEL_CASE" ],
    [ f_case_to_SNAKE_CASE, cs_from_PascalCase, "FROM_PASCAL_CASE" ],
    [ f_case_to_SNAKE_CASE, cs_from_space_case, "FROM_SPACE_CASE" ],

    [ f_case_to_kebab_case, null, null ],
    [ f_case_to_kebab_case, undefined, undefined ],
    [ f_case_to_kebab_case, "", "" ],
    [ f_case_to_kebab_case, cs_from_Camel_Snake_Case, "from-camel-snake-case" ],
    [ f_case_to_kebab_case, cs_from_Http_Header_Case, "from-http-header-case" ],
    [ f_case_to_kebab_case, cs_from_snake_case, "from-snake-case" ],
    [ f_case_to_kebab_case, cs_from_SNAKE_CASE, "from-snake-case" ],
    [ f_case_to_kebab_case, cs_from_kebab_case, "from-kebab-case" ],
    [ f_case_to_kebab_case, cs_from_KEBAB_CASE, "from-kebab-case" ],
    [ f_case_to_kebab_case, cs_from_camelCase, "from-camel-case" ],
    [ f_case_to_kebab_case, cs_from_PascalCase, "from-pascal-case" ],
    [ f_case_to_kebab_case, cs_from_space_case, "from-space-case" ],

    [ f_case_to_KEBAB_CASE, null, null ],
    [ f_case_to_KEBAB_CASE, undefined, undefined ],
    [ f_case_to_KEBAB_CASE, "", "" ],
    [ f_case_to_KEBAB_CASE, cs_from_Camel_Snake_Case, "FROM-CAMEL-SNAKE-CASE" ],
    [ f_case_to_KEBAB_CASE, cs_from_Http_Header_Case, "FROM-HTTP-HEADER-CASE" ],
    [ f_case_to_KEBAB_CASE, cs_from_snake_case, "FROM-SNAKE-CASE" ],
    [ f_case_to_KEBAB_CASE, cs_from_SNAKE_CASE, "FROM-SNAKE-CASE" ],
    [ f_case_to_KEBAB_CASE, cs_from_kebab_case, "FROM-KEBAB-CASE" ],
    [ f_case_to_KEBAB_CASE, cs_from_KEBAB_CASE, "FROM-KEBAB-CASE" ],
    [ f_case_to_KEBAB_CASE, cs_from_camelCase, "FROM-CAMEL-CASE" ],
    [ f_case_to_KEBAB_CASE, cs_from_PascalCase, "FROM-PASCAL-CASE" ],
    [ f_case_to_KEBAB_CASE, cs_from_space_case, "FROM-SPACE-CASE" ],

    [ f_case_to_camelCase, null, null ],
    [ f_case_to_camelCase, undefined, undefined ],
    [ f_case_to_camelCase, "", "" ],
    [ f_case_to_camelCase, cs_from_Camel_Snake_Case, "fromCamelSnakeCase" ],
    [ f_case_to_camelCase, cs_from_Http_Header_Case, "fromHttpHeaderCase" ],
    [ f_case_to_camelCase, cs_from_snake_case, "fromSnakeCase" ],
    [ f_case_to_camelCase, cs_from_SNAKE_CASE, "fromSnakeCase" ],
    [ f_case_to_camelCase, cs_from_kebab_case, "fromKebabCase" ],
    [ f_case_to_camelCase, cs_from_KEBAB_CASE, "fromKebabCase" ],
    [ f_case_to_camelCase, cs_from_camelCase, "fromCamelCase" ],
    [ f_case_to_camelCase, cs_from_PascalCase, "fromPascalCase" ],
    [ f_case_to_camelCase, cs_from_space_case, "fromSpaceCase" ],

    [ f_case_to_PascalCase, null, null ],
    [ f_case_to_PascalCase, undefined, undefined ],
    [ f_case_to_PascalCase, "", "" ],
    [ f_case_to_PascalCase, cs_from_Camel_Snake_Case, "FromCamelSnakeCase" ],
    [ f_case_to_PascalCase, cs_from_Http_Header_Case, "FromHttpHeaderCase" ],
    [ f_case_to_PascalCase, cs_from_snake_case, "FromSnakeCase" ],
    [ f_case_to_PascalCase, cs_from_SNAKE_CASE, "FromSnakeCase" ],
    [ f_case_to_PascalCase, cs_from_kebab_case, "FromKebabCase" ],
    [ f_case_to_PascalCase, cs_from_KEBAB_CASE, "FromKebabCase" ],
    [ f_case_to_PascalCase, cs_from_camelCase, "FromCamelCase" ],
    [ f_case_to_PascalCase, cs_from_PascalCase, "FromPascalCase" ],
    [ f_case_to_PascalCase, cs_from_space_case, "FromSpaceCase" ],

    [ f_case_to_space_case, null, null ],
    [ f_case_to_space_case, undefined, undefined ],
    [ f_case_to_space_case, "", "" ],
    [ f_case_to_space_case, cs_from_Camel_Snake_Case, "from camel snake case" ],
    [ f_case_to_space_case, cs_from_Http_Header_Case, "from http header case" ],
    [ f_case_to_space_case, cs_from_snake_case, "from snake case" ],
    [ f_case_to_space_case, cs_from_SNAKE_CASE, "from snake case" ],
    [ f_case_to_space_case, cs_from_kebab_case, "from kebab case" ],
    [ f_case_to_space_case, cs_from_KEBAB_CASE, "from kebab case" ],
    [ f_case_to_space_case, cs_from_camelCase, "from camel case" ],
    [ f_case_to_space_case, cs_from_PascalCase, "from pascal case" ],
    [ f_case_to_space_case, cs_from_space_case, "from space case" ],

    [ f_case_to_SPACE_CASE, null, null ],
    [ f_case_to_SPACE_CASE, undefined, undefined ],
    [ f_case_to_SPACE_CASE, "", "" ],
    [ f_case_to_SPACE_CASE, cs_from_Camel_Snake_Case, "FROM CAMEL SNAKE CASE" ],
    [ f_case_to_SPACE_CASE, cs_from_Http_Header_Case, "FROM HTTP HEADER CASE" ],
    [ f_case_to_SPACE_CASE, cs_from_snake_case, "FROM SNAKE CASE" ],
    [ f_case_to_SPACE_CASE, cs_from_SNAKE_CASE, "FROM SNAKE CASE" ],
    [ f_case_to_SPACE_CASE, cs_from_kebab_case, "FROM KEBAB CASE" ],
    [ f_case_to_SPACE_CASE, cs_from_KEBAB_CASE, "FROM KEBAB CASE" ],
    [ f_case_to_SPACE_CASE, cs_from_camelCase, "FROM CAMEL CASE" ],
    [ f_case_to_SPACE_CASE, cs_from_PascalCase, "FROM PASCAL CASE" ],
    [ f_case_to_SPACE_CASE, cs_from_space_case, "FROM SPACE CASE" ],
  ];


  ca_test_list.forEach(function (pa_args) {
    const cf_function = pa_args[0];
    const cs_to = pa_args[2];
    const cx_from = pa_args[1];

    const cs_function = cf_function.name;

    describe(`${cs_function}(${f_console_stringify(cx_from)})`, function() {
      it(`should return [${f_console_stringify(cs_to)}]`, function() {
        cm_expect(cf_function(cx_from)).to.equal(cs_to);
      });
    });
  });

});
