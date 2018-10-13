'use babel';

const { spawn } = require('child_process');

import alloy_cli_parser from './alloy-cli-parser';
import { Emitter } from 'atom';

export default function alloy_cli () {

    const emitter = new Emitter();
    const parser = alloy_cli_parser();
    const queue = [];

    let cli;
    let model;
    let waiting = false;
    let self = {};

    parser.on_parsed(on_parse);

    self.display = function () {
        enqueue('d');
        return self;
    };

    self.execute = function (index) {
        enqueue('e ' + index);
        return self;
    };

    self.jar = function (jar) {
        if (!cli) initialize(jar);
        return self;
    };

    self.list = function () {
        enqueue('c');
        return self;
    };

    self.model = function (_) {
        enqueue('m ' + _);
        return self;
    };

    self.next = function () {
        enqueue('n');
        return self;
    };

    self.on_busy = function (cb) {
        return emitter.on('busy', cb);
    };

    self.on_error = function (cb) {
        return emitter.on('error', cb);
    };

    self.on_list = function (cb) {
        return emitter.on('commands', cb);
    };

    self.on_model = function (cb) {
        return emitter.on('model', cb);
    };

    self.on_ready = function (cb) {
        return emitter.on('ready', cb);
    };

    self.on_result = function (cb) {
        return emitter.on('result', cb);
    };

    self.quit = function () {
        enqueue('q');
    };


    return self;


    function dequeue () {
        if (cli && !waiting) {
            waiting = true;
            let message = queue.shift();
            emitter.emit('busy', message);
            if (message) {
                write(message);
            } else {
                waiting = false;
                emitter.emit('ready');
            }
        }
    }

    function enqueue (message) {
        queue.push(message);
        dequeue();
    }

    function initialize (jar) {

        if (jar && jar.split('.').pop() === 'jar') {

            cli = spawn('java', [
                '-cp',
                jar, // '/home/tristan/IdeaProjects/org.alloytools.alloy/org.alloytools.alloy.dist/target/org.alloytools.alloy.dist.jar',
                'edu.mit.csail.sdg.alloy4whole.AtomCLI'
            ]);

            cli.stdout.on('data', on_dat);
            cli.stderr.on('data', on_err);
            cli.on('close', on_close);
            cli.on('exit', on_exit);

            dequeue();

        }

    }

    function on_dat (data) {

        parser.push(`${data}`);

    }

    function on_err (data) {

        emitter.emit('error', `${data}`);

    }

    function on_close (code, signal) {

        console.log('Child process closed: ' + (code !== null ? code : signal));

    }

    function on_exit (code, signal) {

        console.log('Child process exited: ' + (code !== null ? code : signal));

    }

    function on_parse (result) {

        // Check for model change
        if (result.type === 'model') {
            model = result.model;
        } else {
            result.model = model;
        }

        emitter.emit(result.type, result);
        waiting = false;
        dequeue();

    }

    function write (message) {

        cli.stdin.write(message + '\n');

    }

}