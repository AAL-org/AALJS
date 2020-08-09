const f = require('fs');
const c = require('chalk');
const chalk = require('chalk');

const types = {
    
    INTEGER     : 0,
    FLOAT       : 1,
    BOOLEAN     : 2,
    STRING      : 3,
    FUNCTION    : 4,
    NAME        : 5, // Function / Variable Name
    END         : 6, // Semicolon
    OPERATOR    : 7, // ':' - Variable Assigner
    PRINT       : 8, // Write to stdout
    OPENBRACKET : 9,
    CLOSEBRACKET: 10,
    ARGUMENTS   : 11,
    MULTIPLY    : 12,
    DIVIDE      : 13,
    ADD         : 14,
    SUBTRACT    : 15,
    OPENPEREN   : 16,
    CLOSEPEREN  : 17,
    FNARGUMENTS : 18

};

(() => {


    var path = '/home/tascord/Project/AALJS/input.aal';
    log(`Beginning parsing of file '${path.indexOf('/') > -1 ? path.split('/')[path.split('/').length - 1] : path}'.`);

    let lexed = lexer(f.readFileSync(path).toString());
    console.log("\n\n\n", lexed);
    // f.writeFileSync('out.ast', lexed);

})();

/* */

function getType (t) {

    t = t.toString();

    if(t.match(/[0-9]+\.[0-92]+/g))       return types.FLOAT;
    if(!isNaN(t))                         return types.INTEGER;
    if(t.match(/(true|false)/g))          return types.BOOLEAN;
    if(t.match(/".+"/g))                  return types.STRING;
    if(t === 'fn')                        return types.FUNCTION;  
    if(t === ':')                         return types.OPERATOR;
    if(t === ';')                         return types.END;
    if(t === 'print')                     return types.PRINT;
    if(t === '(')                         return types.OPENBRACKET;
    if(t === ')')                         return types.CLOSEBRACKET;
    if(t === '+')                         return types.ADD;
    if(t === '-')                         return types.SUBTRACT;
    if(t === '*')                         return types.MULTIPLY;
    if(t === '/')                         return types.DIVIDE;
    if(t === '{')                         return types.OPENPEREN;
    if(t === '}')                         return types.CLOSEPEREN;
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
    else if(type == 9)  return "OPEN BRACKET";
    else if(type == 10) return "CLOSE BRACKET";
    else if(type == 11) return "[ARGUMENTS]";
    else if(type == 12) return "MULTIPLY";
    else if(type == 13) return "DIVIDE";
    else if(type == 14) return "ADD";
    else if(type == 15) return "SUBTRACT";
    else if(type == 16) return "OPEN PEREN";
    else if(type == 17) return "CLOSE PEREN";
    else if(type == 18) return "[FN-ARGUMENTS]";
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

function createVarRef(name) {
    return {_TYPE: "VARIABLE", name: name, value: null};
}

function createFuncCall(name) {
    return {_TYPE: "FUNCTION_CALL", name: name, arguments: []};
}

/* */

function lexer(input) {

    var body = {
        _TYPE: "FUNCTION",
        _PARENT: null,
        children: []
    }

    var current = body;
    
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
     * 
     * In this example, the wait queue expects (after it sees an 'int')
     * in the input file, that it should see a NAME for that int, an OPERATOR ':',
     * an integer value for that, and then an END symbol ';'.
     * 
     * It then checks every 't' as it comes through, making sure it fits
     * that pattern, erroring if it doesn't. Then, apon reaching the end
     * it creates a new variable, with the type of whatever value was
     * present 1 index ago, which is an integer. It doesn't read
     * 'INTEGER' from the wait queue, as that is replaced with the
     * integer value provided in the input, however we know the
     * value will be the same, as it's type was checked to be an
     * integer whilst the wait queue was still expecting an integer.
     * It then gets tge name from 3 steps prior, and the value
     * which we got earlier and creates the variable.
     * 
     */

    input = split(input);

    var tokenIndex = -1;
    input.forEach(t => {
        tokenIndex++;

        var type = getType(t);
        var tokens = current.children;

        /* DEBUGGING */
        
        var _twi = -1;
        console.log(wait.map(w => {
            
            _twi++;
            
            var isCurrent = _twi == waitIndex;
            return (isCurrent ? "> " : "  ") + typeName(w) + (isCurrent ? ' | ' + t : '');


        }));

        console.log(current);

        // console.log('\n', JSON.stringify(current, null, 4));
        // console.log(body.children);
        
        /* DEBUGGING */

        if(wait[waitIndex] != null) {

            var expect = wait[waitIndex];

            if(expect === types.ARGUMENTS) {
                
                var token = tokens[tokens.length - 1];
                
                var lastArg = token.arguments[token.arguments.length - 1];
                if(lastArg != null) lastArg = lastArg.value;
                
                if(type === types.CLOSEBRACKET) waitIndex += 2;
                else if(type <= 3 || type == 5) {
                    
                    if(lastArg != null && (lastArg < 11 || lastArg > 16)) lexError(`Invalid token ${typeName(type)} (${t}), expected [+ - / *].`, input, tokenIndex);
                    
                    if(type == 3) token.arguments.push(createLiteral(type, t));
                    if(type == 5) token.arguments.push(createVarRef(t));

                } else if(type > 11 && type < 16) {
                    
                    if(lastArg == null || (lastArg > 11 && lastArg < 16)) lexError(`Invalid token ${typeName(type)} (${t}), expected non [+ - / *]`, input, tokenIndex);
                    else token.arguments.push(mathSymbol(t));

                }
                
                return;

            }

            else if (expect === types.FNARGUMENTS) {

                //TODO: Function Arguments;
                //Function args specifically refers to the arguments that a
                //Function takes as an input; e.g fn main(THIS) {}

                if(type === types.CLOSEBRACKET) waitIndex += 2;
                return;

            }

            else if(type !== expect) lexError(`Invalid token ${typeName(type)} (${t}), expected ${typeName(expect)}.`, input, tokenIndex);

            else if(type === types.NAME && current.name === null) current.name = t;
            else if(type === types.NAME) {
                wait[waitIndex] = t;
            }

            else if(type <= 3) wait[waitIndex] = t;

            else if(type === types.END) {

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

        else if(type === types.PRINT) {
            tokens.push({_TYPE: "PRINT", arguments: []});
            wait = wait.concat([types.OPENBRACKET, types.ARGUMENTS, types.CLOSEBRACKET, types.END]);
        }

        else if(type === types.FUNCTION) {
            
            wait = wait.concat([types.NAME, types.OPENBRACKET, types.ARGUMENTS, types.CLOSEBRACKET, types.OPENPEREN]);
            
            tokens.push({
                _TYPE: "FUNCTION",
                _PARENT: current,
                name: null,
                arguments: [],
                children: []
            });

            current = tokens[tokens.length - 1];

        }

        //TODO: Handle re-defining var values
        else if(type === types.NAME) {
            tokens.push(createFuncCall(t));
            wait = wait.concat([types.OPENBRACKET, types.FNARGUMENTS, types.CLOSEBRACKET, types.END]);
        }

        else if(type === types.CLOSEPEREN) {
            if(!current._PARENT) current = body;
            else current = current._PARENT;
        }

        else lexError(`Unexpected token ${typeName(type)} (${t})`, input, tokenIndex);

    });

    if(wait[waitIndex] != null && wait[waitIndex] != types.END) lexError("Unexpected end of file.", input, tokenIndex);
    
    return body;

}

function split(input) {
    return input.split('\n').filter(l => !l.startsWith('//')).join('\n').replace(/([();])/g, ' $1 ').split(/\s+(?=(?:[^\'"]*[\'"][^\'"]*[\'"])*[^\'"]*$)/).filter(t => t.length > 0);
}

function lexError(error, input, index) {

    //TODO: Print whole line.
    console.log('...' + input.slice(index - 2, index + 2).join(' ') + '...');
    console.log(index)

    process.exit(1);

}

function log(message, sub = null) {
    console.log(`${c.blueBright('[AAL')}${c.yellowBright('JS')}${sub === null ? '' : (c.gray(' — ') + c.cyanBright(sub))}${c.blueBright('] ' + message)}`);
}

/* */