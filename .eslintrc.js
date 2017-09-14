module.exports = {
    "env": {
        "es6": true,
        "node": true,
        "commonjs": true,
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "script",
        "ecmaVersion": 8
    },
    "rules": {
        "max-len": ["error", {
                "ignoreTemplateLiterals": true,
                "ignoreRegExpLiterals": true
        }],
        "max-depth": ["error", 4],
        "curly": ["error", "all"],
        "brace-style": ["error", "stroustrup"],
        "no-console": 0,
        "no-unused-vars": ["error", {
            "vars": "local",
            "varsIgnorePattern": "^_+|^dummy"
        }],
        "indent": [
            "error", 2, {
                "SwitchCase": 0,
                "flatTernaryExpressions": true,
                "VariableDeclarator": 2,
                "outerIIFEBody": 0,
                "MemberExpression": 1,
                "FunctionDeclaration": {"body": 1, "parameters": 2},
                "FunctionExpression": {"body": 1, "parameters": 2},
                "CallExpression": {"arguments": 1},
                "ArrayExpression": 1,
                "ObjectExpression": 1
            }
        ],
        "no-trailing-spaces": "error",
        "no-multi-spaces": "error",
        "key-spacing": ["error", {
                "mode": "strict",
                "beforeColon": false,
                "afterColon": true,
            }
        ],
        "keyword-spacing": ["error", { "before": true }],
        "space-infix-ops": "error",
        "space-unary-ops": "error",
        "no-mixed-spaces-and-tabs": "error",
        "accessor-pairs": "error",
        "no-template-curly-in-string": "error",
        "array-callback-return": "error",
        "block-scoped-var": "error",
        "consistent-return": "error",
        "dot-location": ["error", "object"],
        "dot-notation": "error",
        "eqeqeq": "error",
        "no-else-return": "error",
        "no-eval": "error",
        "no-floating-decimal": "error",
        "no-implied-eval": "error",
        "no-lone-blocks": "error",
        "no-magic-numbers": ["error", { "ignore": [-1, 0, 1, 2, 500, 1000, 5, 10, 20, 25] }],
        "no-new-func": "error",
        "no-self-assign": "error",
        "no-self-compare": "error",
        "no-useless-call": "error",
        "no-useless-concat": "error",
        "no-with": "error",
        "radix": "error",
        "require-await": "error",
        "block-spacing": "error",
        "eol-last": ["error", "always"],
        "comma-dangle": ["error", "only-multiline"],
        "comma-spacing": ["error", { "before": false, "after": true }],
        "comma-style": ["error", "last"],
        "func-name-matching": "error",
        "func-call-spacing": ["error", "never"],
        "func-call-spacing": ["error", "never"],
        "computed-property-spacing": ["error", "never"],
        "yoda": "error",
        "no-undefined": "error",
        "new-cap": "error",
        "new-parens": "error",
        "no-lonely-if": "error",
        "no-tabs": "error",
        "one-var": ["error", "never"],
        "operator-assignment": ["error", "always"],
        "operator-linebreak": ["error", "after"],
        "padded-blocks": ["error", "never"],
        "quote-props": ["error", "consistent-as-needed"],
        "linebreak-style": [ "error", "unix" ],
        "quotes": [ "error", "double" ],
        "semi": [ "error", "always" ],
        "semi-spacing": "error",
        "semi-style": ["error", "last"],
        "space-before-blocks": "error",
        "space-in-parens": ["error", "never"],
        "arrow-parens": ["error", "as-needed"],
        "arrow-spacing": "error",
        "generator-star-spacing": ["error", {"before": true, "after": false}],
        "no-useless-computed-key": "error",
        "no-useless-constructor": "error",
        "no-var": "error",
        "object-shorthand": "error",
        "prefer-const": "error",
        "prefer-destructuring": "error",
        "prefer-numeric-literals": "error",
        "prefer-rest-params": "error",
        "prefer-template": "error",
        "rest-spread-spacing": ["error", "never"],
        "template-curly-spacing": "error",
        "yield-star-spacing": ["error", {"before": true, "after": false}],
        "valid-jsdoc": ["error", {
            "requireReturn": false,
            "requireParamDescription": false,
            "requireReturnDescription": false,
            "prefer": {
                "arg": "param",
                "argument": "param",
                "return": "returns",
                "virtual": "abstract"
            }
        }],
        "padding-line-between-statements": [
            "error",
            { "blankLine": "always", "prev": "*", "next": ["class", "function", "case", "directive"] },
            { "blankLine": "never", "prev": "directive", "next": "directive" },
            { "blankLine": "always", "prev": ["class", "function", "directive", "cjs-import"], "next": "*" },
            { "blankLine": "never", "prev": "directive", "next": "directive" },
            { "blankLine": "never", "prev": "cjs-import", "next": "cjs-import" },
        ]
    }
};
