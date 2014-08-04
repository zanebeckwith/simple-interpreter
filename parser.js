var Parse = {}; // File namespace

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

        // Set up simple finite automaton to classify tokens
        // and determine their representation,
        // and save each to the toks array.
        var pos = 0;    // Position in input line
        var type;       // Buffer for new token type
        var rep;        // Buffer for new token rep
        while (pos < line.length) {
                // if next char is a letter
                if (/[a-zA-Z]/.test(line[pos])) {
                        type = 'ident';
                        rep = '';
                        // while next char isn't an operator, parens, or space
                        while (/[^+\-*\/()\s]/.test(line[pos])) {
                                rep += line[pos];
                                ++pos;
                                if (pos === line.length) {
                                        break;
                                };
                        };
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
        var output = '';
        var t;
        while (t = tokens.pop()) {
                output += t.type
                output += ' ';
        };

        return output;
};

// External-facing function to scan and parse input line
function parseLine(input) {
        var tokens = Parse.Scanner(input);
        return Parse.Parse(tokens);
};

