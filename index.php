<!doctype html>
<html lang='en'>

<head>
        <title>How to waste time, but in a new language!</title>
        <link rel='stylesheet' href='style.css'></link>
</head>

<body>
<div id='interpreter'>
        <h1>A Simple Interpreter</h1>
        <div id='output-display'></div>

        <form id='user-input'>
                <input id='input-box' placeholder='Enter commands here' autofocus/>
        </form>

        <div id='explanation'>
                Explanation:
                <ul>
                        <li>Hit enter to submit a command</li>
                        <li>Define a variable: <code>def [var name] = [expression]</code></li>
                        <li>Operators: <code>+, -, *, /</code></li>
                        <li>Parentheses may be used as usual to alter operator precedence
                        <li>Variable names must begin with a letter (upper or lower case),
                                and cannot include the operators or parenthesis
                        <li>All numerical constants are saved as floating-point</li>
                </ul>
        </div>
        <div id='readme'>
        <?php
                include_once dirname(__FILE__) . '/packages/parsedown/Parsedown.php';
                $Parsedown = new Parsedown();
                $readme = file_get_contents(dirname(__FILE__) . '/README.md');
                echo $Parsedown->text($readme);
        ?>
        </div>
</div>
</body>
<script src='virtual-machine.js'></script>
<script src='parser.js'></script>
<script src='display.js'></script>
<script>
        // When user hits enter button in text input box,
        // read the input, parse it, add the formatted output
        // to the output box, and clear the input box.
        document.getElementById('input-box').onkeypress = function(key) {
                if (key.keyCode === 13) {
                        var input_elem = document.getElementById('input-box');
                        var input_line = input_elem.value;
                        var out_elem = document.getElementById('output-display');
                        var new_elem = document.createElement('p');      
                        new_elem.innerHTML = displayOutput(input_line, 
                                        parseLine(input_line));
                        out_elem.appendChild(new_elem);
                        input_elem.value = "";
                        return false;
                }
        }
</script>
</html>
