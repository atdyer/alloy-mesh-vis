'use babel';

const { spawn } = require('child_process');

import alloy_cli_parser from './alloy-cli-parser';
import { Emitter } from 'atom';

export default function alloy_cli () {

    const emitter = new Emitter();
    const parser = alloy_cli_parser();
    const queue = [];
    const cli = spawn('java', [
        '-cp',
        '/home/tristan/IdeaProjects/org.alloytools.alloy/org.alloytools.alloy.dist/target/org.alloytools.alloy.dist.jar',
        'edu.mit.csail.sdg.alloy4whole.AtomCLI'
    ]);

    parser.on_parsed(on_parse);
    let waiting = false;

    cli.stdout.on('data', on_dat);
    cli.stderr.on('data', on_err);
    cli.on('close', on_close);
    cli.on('exit', on_exit);

    return {

        display_last: function () {
            enqueue('d');
        },

        execute_command: function (index) {
            enqueue('e ' + index);
        },

        list_commands: function () {
            enqueue('c');
        },

        next_solution: function () {
            enqueue('n');
        },

        on_list_commands: function (callback) {
            return emitter.on('commands', callback);
        },

        on_model_set: function (callback) {
            return emitter.on('model', callback);
        },

        on_result: function (callback) {
            return emitter.on('result', callback);
        },

        quit: function () {
            enqueue('q');
        },

        set_model: function (file) {
            enqueue('m ' + file);
        }

    };

    function dequeue () {
        if (!waiting) {
            waiting = true;
            let message = queue.shift();
            if (message) {
                write(message);
            } else {
                waiting = false;
            }
        }
    }

    function enqueue (message) {
        queue.push(message);
        dequeue();
    }

    function on_dat (data) {

        parser.push(`${data}`);

    }

    function on_err (data) {

        console.error(`CLI:\n${data}`);

    }

    function on_close (code, signal) {

        console.log('Child process closed: ' + (code !== null ? code : signal));

    }

    function on_exit (code, signal) {

        console.log('Child process exited: ' + (code !== null ? code : signal));

    }

    function on_parse (result) {

        emitter.emit(result.type, result);
        waiting = false;
        dequeue();

    }

    function write (message) {

        cli.stdin.cork();
        cli.stdin.write(message + '\n');
        cli.stdin.uncork();

    }

}