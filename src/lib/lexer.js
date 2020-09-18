const f = require('fs');
const c = require('chalk');

/* */

const { types, getType, typeName } = require('./types');

/* */


function createVariable(type, name, value) {
    return { _TYPE: "VARIABLE", type: type, name: name, value: value }; //TODO: Replace with classes.
}

function createLiteral(type, value) {
    return { _TYPE: "LITERAL", type: type, value: value };
}

function mathSymbol(type) {
    return { _TYPE: "MATH", type: type };
}

function createVarRef(name) {
    return { _TYPE: "VARIABLE", name: name, value: undefined };
}

function createFuncCall(name) {
    return { _TYPE: "FUNCTION_CALL", name: name, arguments: [] };
}

/* */
let error_handler;
function lex(input, on_error = null) {

    error_handler = on_error;

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

        // var _twi = -1;
        // console.log(wait.map(w => {

        //     _twi++;

        //     var isCurrent = _twi == waitIndex;
        //     return (isCurrent ? "> " : "  ") + typeName(w) + (isCurrent ? ' | ' + t : '');


        // }));

        // console.log(current);

        // console.log('\n', JSON.stringify(current, null, 4));
        // console.log(body.children);

        /* DEBUGGING */

        if (wait[waitIndex] != null) {

            var expect = wait[waitIndex];

            if (expect === types.ARGUMENTS) {

                var token = tokens[tokens.length - 1];

                var lastArg = token.arguments[token.arguments.length - 1];
                if (lastArg != null) lastArg = lastArg.value;

                if (type === types.CLOSEBRACKET) waitIndex += 2;
                else if (type <= 3 || type == 5) {

                    if (lastArg != null && (lastArg < 11 || lastArg > 16)) lexError(`Invalid token ${typeName(type)} (${t}), expected [+ - / *].`, input, tokenIndex);

                    if (type == 3) token.arguments.push(createLiteral(type, t));
                    if (type == 5) token.arguments.push(createVarRef(t));

                } else if (type > 11 && type < 16) {

                    if (lastArg == null || (lastArg > 11 && lastArg < 16)) lexError(`Invalid token ${typeName(type)} (${t}), expected non [+ - / *]`, input, tokenIndex);
                    else token.arguments.push(mathSymbol(t));

                }

                return;

            }

            else if (expect === types.FNARGUMENTS) {

                /**
                 * TODO: Function Arguments;
                 * Function args specifically refers to the arguments that a
                 * Function takes as an input; e.g fn main(THIS) {}
                 */                             
                
                if (type === types.CLOSEBRACKET) waitIndex += 2;
                return;

            }

            else if (type !== expect) lexError(`Invalid token ${typeName(type)} (${t}), expected ${typeName(expect)}.`, input, tokenIndex);

            else if (type === types.NAME && current.name === null) current.name = t;
            else if (type === types.NAME) {
                wait[waitIndex] = t;
            }

            else if (type <= 3) wait[waitIndex] = t;

            else if (type === types.END) {

                if (getType(wait[waitIndex - 3]) === types.NAME) {
                    tokens.push(createVariable(getType(wait[waitIndex - 1]), wait[waitIndex - 3], wait[waitIndex - 1]));
                }

            }

            waitIndex++;
            return;

        }

        if (t === 'int') wait = wait.concat([types.NAME, types.OPERATOR, types.INTEGER, types.END]);
        else if (t === 'float') wait = wait.concat([types.NAME, types.OPERATOR, types.FLOAT, types.END]);
        else if (t === 'string') wait = wait.concat([types.NAME, types.OPERATOR, types.STRING, types.END]);
        else if (t === 'bool') wait = wait.concat([types.NAME, types.OPERATOR, types.BOOLEAN, types.END]);

        else if (type <= 3) tokens.push(createLiteral(type, t));

        else if (type === types.PRINT) {
            tokens.push({ _TYPE: "PRINT", arguments: [] });
            wait = wait.concat([types.OPENBRACKET, types.ARGUMENTS, types.CLOSEBRACKET, types.END]);
        }

        else if (type === types.FUNCTION) {

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
        else if (type === types.NAME) {
            tokens.push(createFuncCall(t));
            wait = wait.concat([types.OPENBRACKET, types.FNARGUMENTS, types.CLOSEBRACKET, types.END]);
        }

        else if (type === types.CLOSEPEREN) {
            if (!current._PARENT) current = body;
            else current = current._PARENT;
        }

        else lexError(`Unexpected token ${typeName(type)} (${t})`, input, tokenIndex);

    });

    if (wait[waitIndex] != null && wait[waitIndex] != types.END) lexError("Unexpected end of file.", input, tokenIndex);

    return body;

}

function split(input) {
    return input.split('\n').filter(l => !l.startsWith('//')).join('\n').replace(/([();:])/g, ' $1 ').split(/\s+(?=(?:[^\'"]*[\'"][^\'"]*[\'"])*[^\'"]*$)/).filter(t => t.length > 0);
}

function lexError(error, input, index) {

    console.log(c.blueBright('[AAL') + c.yellowBright('JS') + c.gray(' — ') + c.redBright('Lex Error') + c.blueBright('] ' + error + '\nNear: ' + c.yellowBright('... ' + input.slice(Math.max(index - 2, 0), 8).join(' ') + ' ...')));
    if(error_handler) return error_handler(error + '\nNear: ' + '... ' + input.slice(Math.max(index - 2, 0), 8).join(' ') + ' ...');
    process.exit(1);

}

exports.lex = lex;