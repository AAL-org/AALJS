const { types, getType, typeName } = require('./types');

exports.transpile = (document) => {

    console.log(document);

    let output = ``;
    let add_out = value => output += value + '\n';

    document.children.forEach((e, i) => {

        if(e._TYPE == 'VARIABLE') add_out(handle_var(e) + ';');
        if(e._TYPE == 'PRINT')    add_out(`console.log(${handle_function_inputs(e.arguments)});`);

    });

    return output;

}

let handle_var = (v) => {

    if(v.value === undefined) return `${v.name}`;
    else return `let ${v.name} = ${v.value}`;

}

let handle_function_inputs = (a) => {

    let output = [];
    
    a.forEach((e, i) => {
        
        if(e._TYPE == 'VARIABLE') output.push(handle_var(e));
        if(e._TYPE == 'LITERAL')  output.push(e.value);

    });

    return output.join(', ');

}