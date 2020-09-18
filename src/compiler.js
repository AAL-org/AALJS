const f = require('fs');
const c = require('chalk');
const p = require('path');

const { lex       } = require('./lib/lexer');
const { transpile } = require('./lib/transpiler');

(() => {

    var path = p.join('./', process.argv[2]);
    if(!f.existsSync(path)) return error(`Invalid input file ${c.redBright(path)}`);

    log(`Beginning parsing of file '${path.indexOf('/') > -1 ? path.split('/')[path.split('/').length - 1] : path}'.`);

    let lexed = lex(f.readFileSync(path).toString());
    log(`Lexing complete, beginning transpile.`, `Lexer`);

    let output = transpile(lexed);
    log(`Transpiling complete, writing to file.`, `Transpiler`);

    f.writeFileSync(p.join('./', process.argv[3] || 'out.js'), output);

})();

/* */

function log(message, sub = null) {
    console.log(c.blueBright('[AAL') + c.yellowBright('JS') + (!sub ? '' : (c.gray(' — ') + c.cyanBright(sub))) + c.blueBright('] ' + message));
}

function error(message) {
    console.log(c.blueBright('[AAL') + c.yellowBright('JS') + c.gray(' — ') + c.redBright('Error') + c.blueBright('] ' + message));
    process.exit(1);
}

/* */