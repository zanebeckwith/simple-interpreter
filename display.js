// Format given input string and result of parsing that string
// so that they can be printed to the screen.
//
// Format:
//      >>> [input text]
//      [output]
//
//      These two lines are in two different divs,
//      so they can be formatted in CSS separately.
function displayOutput(input_line, output_value) {
        var formatted = "<div id='input-report'>";
        formatted += "&gt;&gt;&gt; ";
        formatted += input_line;
        formatted += "</div>";
        formatted += "<div id='result-report'>";
        formatted += output_value.toString();
        formatted += "</div>";
        return formatted;
}
