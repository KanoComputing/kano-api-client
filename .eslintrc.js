module.exports = {
    extends: "kano",
    rules: {
        "prefer-destructuring": [
            "error",
            { "array": false, "object": false },
            { "enforceForRenamedProperties": false }
        ],
        "arrow-body-style": ["error", "always"],
        "comma-dangle": ["error", "never"]
    },
    "globals"   : {
        /* MOCHA */
        "describe"   : false,
        "it"         : false,
        "before"     : false,
        "beforeEach" : false,
        "after"      : false,
        "afterEach"  : false
    }
};
