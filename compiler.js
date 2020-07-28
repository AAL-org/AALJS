const f = require('fs');

const types = {
    
    INTEGER:       0,
    FLOAT  :       1,
    BOOLEAN:       2,
    STRING :       3,
    FUNCTION:      4,
    NAME:          5, // Function / Variable Name
    END:           6, // Semicolon
    OPERATOR:      7, // ':' - Variable Assigner
    PRINT:         8, // Write to stdout
    OPENBRACKET:   9,
    CLOSEBRACKET: 10,
    ARGUMENTS   : 11,
    MULTIPLY    : 12,
    DIVIDE      : 13,
    ADD         : 14,
    SUBTRACT    : 15

};

(() => {

    let lexed = lexer(f.readFileSync('input.aal').toString());
    console.log(JSON.stringify(lexed, null, 4));

})();

/* */

function getType (t) {

    t = t.toString();

    if(t.match(/[0-9]+\.[0-92]+/g))       return types.FLOAT;
    if(!isNaN(t))                         return types.INTEGER;
    if(t.match(/(true|false)/g))          return types.BOOLEAN;
    if(t.match(/".+"/g))                  return types.STRING;
    if(t === ':')                         return types.OPERATOR;
    if(t === ';')                         return types.END;
    if(t === 'print')                     return types.PRINT;
    if(t === '(')                         return types.OPENBRACKET;
    if(t === ')')                         return types.CLOSEBRACKET;
    if(t === '+')                         return types.ADD;
    if(t === '-')                         return types.SUBTRACT;
    if(t === '*')                      return types.MULTIPLY;
    if(t === '/')                         return types.DIVIDE;
    if(typeof t == 'string')              return types.NAME;

}

function typeName(type) {

    if(type == 0)       return "INTEGER";
    else if(type == 1)  return "FLOAT";
    else if(type == 2)  return "BOOLEAN";
    else if(type == 3)  return "STRING";
    else if(type == 4)  return "FUNCTION";
    else if(type == 5)  return "NAME";
    else if(type == 6)  return "END";
    else if(type == 7)  return "OPERATOR";
    else if(type == 8)  return "PRINT";
    else if(type == 9)  return "OPEN BRACKET '('";
    else if(type == 10) return "CLOSE BRACKET ')'";
    else if(type == 11) return "[ARGUMENTS]";
    else if(type == 12) return "MULTIPLY";
    else if(type == 13) return "DIVIDE";
    else if(type == 14) return "ADD";
    else if(type == 15) return "SUBTRACT";
    else return `[Unknown Type (${type})]`;

}

function createVariable(type, name, value) {
    return {_TYPE: "VARIABLE", type: type, name: name, value: value}; //TODO: Replace with classes.
}

function createLiteral(type, value) {
    return {_TYPE: "LITERAL", type: type, value: value};
}

function mathSymbol(type) {
    return {_TYPE: "MATH", type: type};
}

function lexer(input) {

    tokens = [];
    
    var wait = [];
    var waitIndex = 0;
    
    /**
     * Wait Queue;
     * Allow for multiple expected values to appear, whilst
     * retaining context by never removing elements.
     * 
     * E.g:
     * [NAME, OPERATOR, INTEGER, END];
     *   ^ -->   ^   -->   ^ -->  ^ --> (createVariable(v))
     *   ^      <-&-       ^ <---------------------------
     */

    var input = input.split('\n').filter(l => !l.startsWith('//')).join('\n');

    input.split(/\s+/).filter(t => t.length > 0).forEach(t => {

        var type = getType(t);

        if(wait[waitIndex] != null) {

            var expect = wait[waitIndex];

            if(expect === types.ARGUMENTS) {
                
                var token = tokens[tokens.length - 1];
                
                var lastArg = token.arguments[token.arguments.length - 1];
                if(lastArg != null) lastArg = lastArg.value;

                if(type === types.CLOSEBRACKET) waitIndex += 2;
                else if(type <= 3 || type == 5) {
                    
                    if(token.arguments.length > 0 && (lastArg < 11 || lastArg > 16)) throw new Error(`Invalid token ${typeName(type)} (${t}), expected [+ - / *].`);
                    token.arguments.push(token.arguments.push(createLiteral(type, t)));

                } else if(type > 11 && type < 16) {
                    
                    if(lastArg > 11 && lastArg < 16) throw new Error(`Invalid token ${typeName(type)} (${t}), expected non [+ - / *]`);
                    else token.arguments.push(token.arguments.push(mathSymbol(t)));

                }
                
                return;

            }

            if(type !== expect) throw new Error(`Invalid token ${typeName(type)} (${t}), expected ${typeName(expect)}.`);

            if(type <= 3 || type === 5) wait[waitIndex] = t;

            if(type === types.END) {

                if(getType(wait[waitIndex - 3]) === types.NAME) {
                    tokens.push(createVariable(getType(wait[waitIndex - 1]), wait[waitIndex - 3], wait[waitIndex - 1]));
                }

            }
            
            waitIndex++;
            return;

        }

        if(t === 'int')         wait = wait.concat([types.NAME, types.OPERATOR, types.INTEGER, types.END]);
        else if(t === 'float')  wait = wait.concat([types.NAME, types.OPERATOR, types.FLOAT,   types.END]);
        else if(t === 'string') wait = wait.concat([types.NAME, types.OPERATOR, types.STRING,  types.END]);
        else if(t === 'bool')   wait = wait.concat([types.NAME, types.OPERATOR, types.BOOLEAN, types.END]);

        else if(type <= 3) tokens.push(createLiteral(type, t));

        else if(type == types.PRINT) {
            tokens.push({_TYPE: "PRINT", arguments: []});
            wait = wait.concat([types.OPENBRACKET, types.ARGUMENTS, types.CLOSEBRACKET, types.END]);
        }

        else throw new Error(`Unexpected token ${typeName(type)} (${t})`);

    });

    if(wait[waitIndex] != null && wait[waitIndex] != END) throw new Error("Unexpected end of file.");
    
    return tokens;

}

/* */