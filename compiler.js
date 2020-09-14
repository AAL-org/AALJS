const f = require('fs');
const c = require('chalk');

const { lexer } = require('./lexer');

(() => {

    var path = '/home/tascord/Project/AALJS/input.aal';
    log(`Beginning parsing of file '${path.indexOf('/') > -1 ? path.split('/')[path.split('/').length - 1] : path}'.`);

    let lexed = lexer(f.readFileSync(path).toString());
    log(`Lexing complete, beginning transpile.`, `Lexer`);

    let output = transpiler(lexed);
    log(`Transpilkng complete, executing!.`, `Transpiler`);

    eval(lexed);

})();

/* */

function log(message, sub = null) {
    console.log(`${c.blueBright('[AAL')}${c.yellowBright('JS')}${sub === null ? '' : (c.gray(' — ') + c.cyanBright(sub))}${c.blueBright('] ' + message)}`);
}

/* */