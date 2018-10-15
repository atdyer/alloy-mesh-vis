'use babel';

import alloy_result from '../alloy-result';

export default function alloy_cli_parser () {

    let cb,
        curr_lines = [],
        next_lines = [];

    return {

        on_parsed: function (callback) {
            cb = callback;
        },

        push: function (data) {

            let new_lines = remove_empty_strings(data.trim().split(/\r?\n/g)),
                end_index = new_lines.indexOf('CLI READY');

            if (end_index === -1) {
                curr_lines = curr_lines.concat(new_lines);
            } else {
                curr_lines = curr_lines.concat(new_lines.slice(0, end_index));
                next_lines = new_lines.slice(end_index + 1);
                parse();
            }

        }

    };

    function parse () {

        if (curr_lines.length > 0) {

            switch (curr_lines[0]) {

                case "CLI READY":
                    cb({ type: 'ready' });
                    break;

                case 'c':
                    cb(parse_list_commands(curr_lines));
                    break;

                case 'm':
                    cb(parse_model_set(curr_lines));
                    break;

                case 'r':
                    cb(parse_result(curr_lines));
                    break;

            }

        }

        curr_lines = next_lines;

    }

}

function parse_list_commands (lines) {

    if (lines.length > 1) {

        let commands = lines.slice(1).map((line) => {

            let dat = line.split(':');
            return {
                index: parseInt(dat[0]),
                command: dat[1]
            };

        });

        return {
            type: 'commands',
            commands: commands
        };

    } else {

        return {
            type: 'commands',
            commands: []
        };

    }

}

function parse_model_set (lines) {

    if (lines.length === 2) {
        return {
            type: 'model',
            model: lines[1]
        };
    } else {
        return {
            type: 'error',
            error: 'Error parsing set model command',
            lines: lines
        };
    }

}

function parse_result (lines) {

    if (lines.length > 1) {

        return {
            type: 'result',
            result: alloy_result(lines.slice(1))
        };

    } else {

        return {
            type: 'error',
            error: 'Error parsing model result'
        };

    }

}

function remove_empty_strings (lines) {

    while (lines.length) {
        if (lines[lines.length - 1] === '') {
            lines.pop();
        }
        else if (lines[0] === '') {
            lines.shift();
        }
        else {
            break;
        }
    }

    return lines;

}
