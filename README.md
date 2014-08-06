The Simple Interpreter Project
==================

I was trying to learn Javascript for a job interview,
and decided that writing a simple little browser interpreter would be a good
way to practice.
This is the result of that little project.

The language is simple: basically a desk calculator
with variable declarations.
Arithmetic expressions, involving the four standard
operators, can be parsed, and their results saved to variables
(which can then be referenced in future expressions).

The whole program runs in Javascript within the browser
(no server-side scripting).

##The Grammar
The language is an implementation of the classic LL(1) expression grammar,
with the twist that, as each input line is parsed, it's possible
for the line to save a variable.

In BNF:
```
<line> ::= "def" identifier "=" <expression> | <expression>

<expression> ::= <term> <expression_prime>

<term> ::= <factor> <term_prime>

<expression_prime> ::= "+" <term> <expression_prime> | "-" <term> <expression_prime> | ""

<term_prime> ::= "*" <factor> <term_prime> | "/" <factor> <term_prime> | ""

<factor> ::= "(" <expression> ")" | number | identifier
```

##The Virtual Machine
The fun part of this project was writing the virtual machine
on which the given commands would be executed.

Instead of just translating the given expression into its
Javascript equivalent and returning that result, the parser
constructs the equivalent bytecode-like assembly instructions
for the toy virtual machine, and then runs that code,
returning the result (saved in one of the registers).

The result is basically a simple Static Single-Assignment (SSA)
3-Address Intermediate Representation, with a virtual machine interpreter.

The VM itself consists of
* An array representing the machine's memory
* Another array representing the registers
* A stack pointer -> an index into the memory array
* A heap pointer -> an index into the memory array
* A program counter (PC) -> an index into the memory array

Code to be run is loaded into the low end of the memory array,
the PC is set to 0, and instructions are sequentially read from the memory
until a sigil 'stop' instruction is encountered.

Memory is allocated by incrementing the heap pointer
and returning the new location in the memory array.
The heap begins above the text section of the memory
(where the code to be run is stored), so code with
more than 1000 instructions will actually smash into the heap.
That's probably fine, since this is just a simple interpreter
and so won't be running long lines of code.

The register file has an unlimited number of registers
(up to the maximum size of a Javascript array) and assigns
a new register to each intermediate value
(SSA-style).
This way, there's no need to worry about register allocation
(though, even simple instructions use a pretty large number
of registers...).

The current instructions recognized by the VM are:
* MOV reg1 reg2: Copy the contents of reg1 into reg2

* LOAD mem reg: Load the contents at mem in memory into register reg2

* LOADIMM imm reg: Load the number imm into the register reg

* STORE reg mem: Store the contents of register reg into memory at mem

* STOREIMM imm mem: Store the number imm into memory at mem

* ADD reg1 reg2 dest: Add the contents of registers reg1 and reg2,
and save to dest register

* SUB reg1 reg2 dest: Subtract the contents of register reg2 from register reg1,
and save to dest register

* MULT reg1 reg2 dest: Multiply the contents of registers reg1 and reg2,
and save to dest register

* DIV reg1 reg2 dest: Divide the contents of registers reg1
by the contents of register reg2, and save to dest register

* STOP : Halt execution of code, and return contents of register-0
to the caller of the VM

## TODOs
* Clearly, this is overkill for a stupid desk calculator.
The reason for implementing it this way, other than I felt like
it and wanted to try it, was to allow for more complex instructions,
such as function calls and looping.
These will be implemented in new VM instructions, like 'jmp', etc.
* There's, currently, essentially no error-handling whatsoever.
So, when you enter a syntactically-incorrect line, the display
simply goes blank. That is a top priority for fixing.
* The single-line input, to a separate output, is fine for this
simple expression parsing, but when the language is extended to
be more full-fledged, a standard console-like input/output
needs to be implemented.

## Links
* The excellent PHP-based Markdown parser Parsedown,
by Emanuil Rusev,
is used here to include the contents of the README.md
file into the homepage. Check out the project page
[here](http://parsedown.org).

* This project's code can be found on my Github at
[Simple Interpreter](http://github.com/zanebeckwith/simple-interpreter).

* This interpreter is also hosted live on my website at
[zanebeckwith.com](http://www.zanebeckwith.com/simple-interpreter).
