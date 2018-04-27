module.exports = {
    extends: "kano",
    rules: {
        "prefer-destructuring": [
            "error",
            { "array": false, "object": false },
            { "enforceForRenamedProperties": false }
        ],
        "arrow-body-style": ["error", "always"],
        "comma-dangle": ["error", "never"],
        "no-console":0,
        "no-underscore-dangle":0,
        "max-len":0,
        "no-use-before-define":0
    },
    "globals"   : {
        /* MOCHA */
        "describe"   : false,
        "it"         : false,
        "before"     : false,
        "beforeEach" : false,
        "after"      : false,
        "afterEach"  : false,
        "expect"     : false,
        /* Gun */
        Gun          : false,
    }
};
