const types = {

    INTEGER: 0,
    FLOAT: 1,
    BOOLEAN: 2,
    STRING: 3,
    FUNCTION: 4,
    NAME: 5, // Function / Variable Name
    END: 6, // Semicolon
    OPERATOR: 7, // ':' - Variable Assigner
    PRINT: 8, // Write to stdout
    OPENBRACKET: 9,
    CLOSEBRACKET: 10,
    ARGUMENTS: 11,
    MULTIPLY: 12,
    DIVIDE: 13,
    ADD: 14,
    SUBTRACT: 15,
    OPENPEREN: 16,
    CLOSEPEREN: 17,
    FNARGUMENTS: 18

};

function getType(t) {

    t = t.toString();

    if (t.match(/[0-9]+\.[0-92]+/g)) return types.FLOAT;
    if (!isNaN(t)) return types.INTEGER;
    if (t.match(/(true|false)/g)) return types.BOOLEAN;
    if (t.match(/".+"/g)) return types.STRING;
    if (t === 'fn') return types.FUNCTION;
    if (t === ':') return types.OPERATOR;
    if (t === ';') return types.END;
    if (t === 'print') return types.PRINT;
    if (t === '(') return types.OPENBRACKET;
    if (t === ')') return types.CLOSEBRACKET;
    if (t === '+') return types.ADD;
    if (t === '-') return types.SUBTRACT;
    if (t === '*') return types.MULTIPLY;
    if (t === '/') return types.DIVIDE;
    if (t === '{') return types.OPENPEREN;
    if (t === '}') return types.CLOSEPEREN;
    if (typeof t == 'string') return types.NAME;

}

function typeName(t) {

    return Object.keys(types).find(k => types[k] == t) || `Unknown Type | ${t}`;

}

exports.types    = types;
exports.getType  = getType;
exports.typeName = typeName;