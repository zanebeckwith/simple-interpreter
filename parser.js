var Parse = {}; // File namespace

// Global variables
Parse.vm = VM.VirtualMachine(); // Virtual machine running in background
Parse.symTab = {};              // Symbol table

// Token type, for storing info on type and represention
// of lexical tokens in input line.
Parse.Token = function(type_in, rep_in) {
        var that = {};
        that.type = type_in;
        that.rep = rep_in;

        return that;
};

// Scanner type, for tokenizing input line character stream.
// Constructor function tokenizes the given input.
// Methods pop and peak provide stack-like access to
// resulting token stream.
Parse.Scanner = function(line) {
        var that = {};

        var toks = [];  // Internal representation of token stream

        var keywords = {'def': undefined};

        // Set up simple finite automaton to classify tokens
        // and determine their representation,
        // and save each to the toks array.
        var pos = 0;    // Position in input line
        var type;       // Buffer for new token type
        var rep;        // Buffer for new token rep
        while (pos < line.length) {
                // if next char is a letter
                if (/[a-zA-Z]/.test(line[pos])) {
                        rep = '';
                        // while next char isn't an operator, parens, or space
                        while (/[^+\-*\/()\s]/.test(line[pos])) {
                                rep += line[pos];
                                ++pos;
                                if (pos === line.length) {
                                        break;
                                };
                        };
                        // Check if it's a keyword
                        if (rep in keywords) {
                                type = rep;
                                rep = undefined;
                        } else {
                                type = 'ident';
                        }
                // if next char is a number or decimal
                } else if (/[\d\.]/.test(line[pos])) {
                        type = 'num';
                        rep = '';
                        // while char is numeric or decimal
                        while (/[\d\.]/.test(line[pos])) {
                                rep += line[pos];
                                ++pos;
                                if (pos === line.length) {
                                        break;
                                };
                        };
                        rep *= 1;       // Convert to number
                // if next char is a left-parenthesis
                } else if (line[pos] === '(') {
                        type = 'lParens';
                        rep = undefined;
                        ++pos;
                // if next char is a right-parenthesis
                } else if (line[pos] === ')') {
                        type = 'rParens';
                        rep = undefined;
                        ++pos;
                // if next char is an equals sign
                } else if (line[pos] === '=') {
                        type = 'equals';
                        rep = undefined;
                        ++pos;
                // if next char is an operator (+, -, *, /)
                } else if (/[+\-*\/]/.test(line[pos])) {
                        type = 'op';
                        rep = line[pos];
                        ++pos;
                // if next char is whitespace
                } else if (/[\s]/.test(line[pos])) {
                        ++pos;
                        continue;
                // otherwise, don't know what the char is
                } else {
                        // report error
                        ++pos;
                        continue;
                };

                // Add new token to token stream
                toks.unshift(Parse.Token(type, rep));
        };
        // Indicate end of token stream
        toks.unshift(Parse.Token('eof', undefined));

        // Function to view (but don't delete) next token
        that.peak = function() {
                return toks[toks.length - 1];
        };

        // Get and delete next token
        that.pop = function() {
                return toks.pop();
        };
        
        return that;
};

// Function to parse given token stream
Parse.Parse = function(tokens) {
        var code = [];  // Holds code to be executed on vm
        var result;     // Holds result of computation

        if (Parse.line(tokens, code)) {
                if (tokens.peak().type === 'eof') {
                        code.push({op: 'stop'});
                        result = Parse.vm.run(code);
                        Parse.vm.clearRegisters();
                        return result;
                } else {
                        Parse.reportFail();
                        return false;
                };
        } else {
                Parse.reportFail();
                return false;
        };
};

Parse.line = function(tokens, code) {
        var res = Parse.vm.newRegister();        // Register in which to save results
        var varName;    // Name of new variable, if line is a definition

        // Check if a definition, or just an expression
        if (tokens.peak().type === 'def') {
                tokens.pop();
                if (tokens.peak().type === 'ident') {
                        // If it's a new variable,
                        //      register it in the symbol table,
                        //      and allocate storage for it
                        if (!(tokens.peak().rep in Parse.symTab)) {
                                Parse.symTab[tokens.peak().rep] = {};
                                Parse.symTab[tokens.peak().rep].loc =
                                        Parse.vm.allocate(1);
                        }

                        varName = tokens.pop().rep;
                        if (tokens.pop().type !== 'equals') {
                                Parse.reportFail();
                                return false;
                        };

                        // Parse the rhs
                        if (Parse.expr(tokens, code, res)) {
                                // Register the code to save the value
                                code.push({op: 'store',
                                           mem: Parse.symTab[varName].loc,
                                           reg: res
                                });

                                return true;
                        } else {
                                Parse.reportFail();
                                return false;
                        };
                } else {
                        Parse.reportFail();
                        return false;
                };
        } else {
                return Parse.expr(tokens, code, res);
        };
};

Parse.expr = function(tokens, code, res) {
        // Register in which to save result of term
        var termReg = Parse.vm.newRegister();

        // Register in which to save result of exprP
        // exprP also requires we give it termReg,
        //      so it can combine it with its sub-parts
        var exprPReg = Parse.vm.newRegister();

        if (Parse.term(tokens, code, termReg)) {
                if (Parse.exprP(tokens, code, termReg, exprPReg)) {
                        // Copy results into res register
                        code.push({op: 'mov', reg1: exprPReg, reg2: res});

                        return true;
                } else {
                        return false;
                };
        } else {
                Parse.reportFail();
                return false;
        };
};

Parse.term = function(tokens, code, res) {
        // Register in which to save result of factor
        var factorReg = Parse.vm.newRegister();

        // Register in which to save result of termP
        // termP also requires we give it factorReg,
        //      so it can combine it with its sub-parts
        var termPReg = Parse.vm.newRegister();

        if (Parse.factor(tokens, code, factorReg)) {
                if (Parse.termP(tokens, code, factorReg, termPReg)) {
                        // Copy results into res register
                        code.push({op: 'mov', reg1: termPReg, reg2: res});

                        return true;
                } else {
                        Parse.reportFail();
                        return false;
                };
        } else {
                Parse.reportFail();
                return false;
        };
};

Parse.exprP = function(tokens, code, leftReg, res) {
        // Register in which to save result of term
        var termReg = Parse.vm.newRegister();

        // Register in which to save result of combining
        var combReg = Parse.vm.newRegister();

        // Register in which to save result of exprP
        var exprPReg = Parse.vm.newRegister();

        if (tokens.peak().rep === '+') {
                tokens.pop();

                if (Parse.term(tokens, code, termReg)) {
                        // Add results of previous parsing and
                        //      the result of term
                        code.push({op: 'add',
                                   reg1: leftReg,
                                   reg2: termReg,
                                   dest: combReg
                        });
                        if (Parse.exprP(tokens, code, combReg, exprPReg)) {
                                // Copy results into res register
                                code.push({op: 'mov', reg1: exprPReg, reg2: res});

                                return true;
                        } else {
                                Parse.reportFail();
                                return false;
                        };
                } else {
                        Parse.reportFail();
                        return false;
                }
        } else if (tokens.peak().rep === '-') {
                tokens.pop();

                if (Parse.term(tokens, code, termReg)) {
                        // Subtract results of previous parsing and
                        //      the result of term
                        code.push({op: 'sub',
                                   reg1: leftReg,
                                   reg2: termReg,
                                   dest: combReg
                        });
                        if (Parse.exprP(tokens, code, combReg, exprPReg)) {
                                // Copy results into res register
                                code.push({op: 'mov', reg1: exprPReg, reg2: res});

                                return true;
                        } else {
                                Parse.reportFail();
                                return false;
                        };
                } else {
                        Parse.reportFail();
                        return false;
                }
        } else if (tokens.peak().type === 'rParens'
                        || tokens.peak().type === 'eof') {
                // Copy unchanged left side into res register
                code.push({op: 'mov', reg1: leftReg, reg2: res});
                return true;
        } else {
                Parse.reportFail();
                return false;
        };
};

Parse.termP = function(tokens, code, leftReg, res) {
        // Register in which to save result of factor
        var factorReg = Parse.vm.newRegister();

        // Register in which to save result of combining
        var combReg = Parse.vm.newRegister();

        // Register in which to save result of termP
        var termPReg = Parse.vm.newRegister();

        if (tokens.peak().rep === '*') {
                tokens.pop();

                if (Parse.factor(tokens, code, factorReg)) {
                        // Multiply results of previous parsing and
                        //      the result of factor
                        code.push({op: 'mult',
                                   reg1: leftReg,
                                   reg2: factorReg,
                                   dest: combReg
                        });
                        if (Parse.termP(tokens, code, combReg, termPReg)) {
                                // Copy results into res register
                                code.push({op: 'mov', reg1: termPReg, reg2: res});

                                return true;
                        } else {
                                Parse.reportFail();
                                return false;
                        };
                } else {
                        Parse.reportFail();
                        return false;
                }
        } else if (tokens.peak().rep === '/') {
                tokens.pop();

                if (Parse.factor(tokens, code, factorReg)) {
                        // Divide results of previous parsing and
                        //      the result of factor
                        code.push({op: 'div',
                                   reg1: leftReg,
                                   reg2: factorReg,
                                   dest: combReg
                        });
                        if (Parse.termP(tokens, code, combReg, termPReg)) {
                                // Copy results into res register
                                code.push({op: 'mov', reg1: termPReg, reg2: res});

                                return true;
                        } else {
                                Parse.reportFail();
                                return false;
                        };
                } else {
                        Parse.reportFail();
                        return false;
                }
        } else if (tokens.peak().type === 'rParens' || 
                        tokens.peak().rep === '+' ||
                        tokens.peak().rep === '-' ||
                        tokens.peak().type === 'eof') {
                // Copy unchanged left side into res register
                code.push({op: 'mov', reg1: leftReg, reg2: res});
                return true;
        } else {
                Parse.reportFail();
                return false;
        };
};

Parse.factor = function(tokens, code, res) {
        if (tokens.peak().type === 'lParens') {
                tokens.pop();

                if (!Parse.expr(tokens, code, res)) {
                        Parse.reportFail();
                        return false;
                }

                if (tokens.peak().type !== 'rParens') {
                        Parse.reportFail();
                        return false;
                }

                tokens.pop();
                return true;
        } else if (tokens.peak().type === 'num') {
                // Load the constant number into the res register
                code.push({op: 'loadImm', reg: res, imm: tokens.peak().rep});
                tokens.pop();
                return true;
        } else if (tokens.peak().type === 'ident') {
                // Load the saved value into the res register
                code.push({op: 'load',
                           reg: res,
                           mem: Parse.symTab[tokens.peak().rep].loc
                });
                tokens.pop();
                return true;
        } else {
                Parse.reportFail();
                return false;
        };
};

// Handle parsing errors
Parse.reportFail = function() {
        return 'Unable to parse input';
};

// External-facing function to scan and parse input line
function parseLine(input) {
        var tokens = Parse.Scanner(input);
        return Parse.Parse(tokens);
};

