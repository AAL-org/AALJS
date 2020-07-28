const f = require('fs');

const types = {
    
    INTEGER:  0,
    FLOAT  :  1,
    BOOLEAN:  2,
    STRING :  3,
    FUNCTION: 4,
    NAME:     5, // Function / Variable Name
    END:      6, // Semicolon
    OPERATOR: 7  // ':' - Variable Assigner

};

(() => {

    let lexed = lexer(f.readFileSync('input.aal').toString());
    console.log(lexed);

})();

/* */

function getType (t) {

    if(t.match(/[0-9]+\.[0-92]+/g))       return types.FLOAT;
    if(!isNaN(t))                         return types.INTEGER;
    if(t.match(/(true|false)/))           return types.BOOLEAN;
    if(typeof t == 'string')              return types.STRING;

}

function typeName(type) {

    if(type == 0)      return "INTEGER";
    else if(type == 1) return "FLOAT";
    else if(type == 2) return "BOOLEAN";
    else if(type == 3) return "STRING";
    else if(type == 4) return "FUNCTION";
    else if(type == 5) return "NAME";
    else if(type == 6) return "END";
    else if(type == 7) return "OPERATOR";
    else return `[Unknown Type (${type})]`;

}

function createVariable(type, value) {
    return {type: type, value: value};
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

    input.split(/\s+/).filter(t => t.length > 0).forEach(t => {

        var type = getType(t);

        console.log(wait);

        if(wait[waitIndex] != null) {

            var expect = wait[waitIndex];

            if(type != expect) throw new Error(`Invalid token ${typeName(type)}, expected ${typeName(expect)}.`);
            if(type < 3) ;

            if(type == types.END) {

                if(wait[waitIndex - 4] == types.name) {
                    tokens.push(createVariable(wait[typeName(waitIndex - 1), wait[waitIndex - 1]]));
                }

            }
    
            waitIndex++;
            return;

        }

        console.log(t);

        if(t === 'int') {
            console.log('Int!');
            wait.concat([type.NAME, types.OPERATOR, types.END]);
        }

    });
    
    return tokens;

}

/* */