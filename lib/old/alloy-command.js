'use babel';

// Atom
import { Emitter } from 'atom';

export default function alloy_command () {

    let alloy,
        command,
        solution;

    let cmd = {

        alloy: function (_) {
            if (!arguments.length) return alloy;
            _.on_java_running(function () {
                alloy = _;
            });
            return cmd;
        },

        command: function (_) {
            if (!arguments.length) return command;
            command = _;
            return cmd;
        },

        label: function () {
            if (command) return command.label;
        },

        solution: function (_) {
            if (!arguments.length) return solution;
            solution = _;
            return cmd;
        }

    };

    return cmd;

}