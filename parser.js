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

        if (Parse.line(tokens, code)) {
                if (tokens.peak().type === 'eof') {
                        return 5;
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
        if (tokens.peak().type === 'def') {
                tokens.pop();
                tokens.pop();
                tokens.pop();
                return Parse.expr(tokens, code);
        } else {
                return Parse.expr(tokens, code);
        };
};

Parse.expr = function(tokens, code) {
        if (Parse.term(tokens, code)) {
                return Parse.exprP(tokens, code);
        } else {
                Parse.reportFail();
                return false;
        };
};

Parse.term = function(tokens, code) {
        if (Parse.factor(tokens, code)) {
                return Parse.termP(tokens, code);
        } else {
                Parse.reportFail();
                return false;
        };
};

Parse.exprP = function(tokens, code) {
        if (tokens.peak().rep === '+') {
                tokens.pop();

                if (Parse.term(tokens, code)) {
                        return Parse.exprP(tokens, code);
                } else {
                        Parse.reportFail();
                        return false;
                }
        } else if (tokens.peak().rep === '-') {
                tokens.pop();

                if (Parse.term(tokens, code)) {
                        return Parse.exprP(tokens, code);
                } else {
                        Parse.reportFail();
                        return false;
                }
        } else if (tokens.peak().type === 'rParens'
                        || tokens.peak().type === 'eof') {
                return true;
        } else {
                Parse.reportFail();
                return false;
        };
};

Parse.termP = function(tokens, code) {
        if (tokens.peak().rep === '*') {
                tokens.pop();

                if (Parse.factor(tokens, code)) {
                        return Parse.termP(tokens, code);
                } else {
                        Parse.reportFail();
                        return false;
                }
        } else if (tokens.peak().rep === '/') {
                tokens.pop();

                if (Parse.factor(tokens, code)) {
                        return Parse.termP(tokens, code);
                } else {
                        Parse.reportFail();
                        return false;
                }
        } else if (tokens.peak().type === 'rParens' || 
                        tokens.peak().rep === '+' ||
                        tokens.peak().rep === '-' ||
                        tokens.peak().type === 'eof') {
                return true;
        } else {
                Parse.reportFail();
                return false;
        };
};

Parse.factor = function(tokens, code) {
        if (tokens.peak().type === 'lParens') {
                tokens.pop();

                if (!Parse.expr(tokens, code)) {
                        Parse.reportFail();
                        return false;
                }

                if (tokens.peak().type !== 'rParens') {
                        Parse.reportFail();
                        return false;
                }

                tokens.pop();
                return true;
        } else if (tokens.peak().type === 'num' ||
                        tokens.peak().type === 'ident') {
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

//         Parse.symTab.x = {};
//         Parse.symTab.x.loc = Parse.vm.allocate(1);
//         Parse.symTab.x.val = 20;
//         Parse.vm.run([{op: 'storeImm', mem: Parse.symTab.x.loc, imm: Parse.symTab.x.val},
//                       {op: 'stop'}
//                       ]);
