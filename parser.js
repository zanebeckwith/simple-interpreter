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

function parseLine(input) {
        return input;
};
