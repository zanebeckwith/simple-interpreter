// Namespace for this file
VM = {};

// Virtual-machine type, for interpreting bytecode-like instructions
VM.VirtualMachine = function() {
        var that = {};

        var registers = [];     // Unlimited number of registers
        var memory = [];        // von Neumann architecture memory
        var pc = 0;             // Program counter
        var heap = 1e3;         // Heap pointer (code can have <=1000 instructions)
        var stack = 1e9;        // Stack pointer (heap can grow by 1e6
                                //      before crashing into stack)
        var opCode;
        var newReg = 0;         // Lowest unused register

        // Run given code.
        that.run = function(code) {
                // Load code
                for (pc = 0; pc < code.length; ++pc) {
                        memory[pc] = code[pc];
                };


                // Run through code
                for (pc = 0; (opCode = (memory[pc]).op) !== 'stop'; ++pc) {
                        switch (opCode) {
                                case 'mov':
                                        registers[memory[pc].reg2] = registers[memory[pc].reg1];
                                        break;
                                case 'load': 
                                        registers[memory[pc].reg] = memory[memory[pc].mem];
                                        break;
                                case 'loadImm': 
                                        registers[memory[pc].reg] = memory[pc].imm;
                                        break;
                                case 'store':
                                        memory[memory[pc].mem] = registers[memory[pc].reg];
                                        break;
                                case 'storeImm':
                                        memory[memory[pc].mem] = memory[pc].imm;
                                        break;
                                case 'add':
                                        registers[memory[pc].dest] =
                                                registers[memory[pc].reg1] + registers[memory[pc].reg2];
                                        break;
                                case 'sub':
                                        registers[memory[pc].dest] =
                                                registers[memory[pc].reg1] - registers[memory[pc].reg2];
                                        break;
                                case 'mult':
                                        registers[memory[pc].dest] =
                                                registers[memory[pc].reg1] * registers[memory[pc].reg2];
                                        break;
                                case 'div':
                                        registers[memory[pc].dest] =
                                                registers[memory[pc].reg1] / registers[memory[pc].reg2];
                                        break;
                                default:
                                        // Just don't do anything on unknown opcode
                        };
                };

                return registers[0];
        };

        // Allocate storage
        that.allocate = function(size) {
                heap += size;
                return heap - size;
        };
        
        // Give an unused register
        that.newRegister = function() {
                return newReg++;
        };

        // Reset the registers
        that.clearRegisters = function() {
                registers = [];
                newReg = 0;
        };

        return that;
};

