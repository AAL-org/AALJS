# AALJS
AAL -> AST -> Something In JS

## To-DO
#### All the stuff i'm aiming to get done soon.
* Being able to call functions
* Math stuff done in brackets, e.g 1 + (2 * 3);
* Begin working on taking the tokens/ast/i dont know the names for things into js
* Figure out how the wait queue should work with functions

## ChangeLog
#### What i've done in the latest commits
* + Added 'flatted', don't really like how it does circulars though, i'd rather just use [CIRCULAR] in the output.
* + Added functions, so all the currently being handled stuff goes in the current function.

## Syntax stuff
#### None of this stuff is implimented, just what im aiming for

```

fn name (@Required int argument, string argument2) {

            //   v  Using = help prevent confusion, as assigning is done through ':';
    if(argument2 = null) print("You didn't provide a second argument");

    int a: 1;
    int b: 2;

    print("Fun fact: " + a " plus " + b " equals " + (a + b));

}


```