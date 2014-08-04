var Parse = {}; // File namespace

// Token type, for storing info on type and represention
// of lexical tokens in input line.
Parse.Token = function(type_in, rep_in) {
        var that = {};
        that.type = type_in;
        that.rep = rep_in;

        return that;
};

function parseLine(input) {
        return input;
};
