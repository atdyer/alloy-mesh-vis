'use babel';

import alloy_instance from './alloy-instance';
import alloy_instance_new from './instance/alloy-instance';

export default function alloy_result (lines) {

    let command = lines[0];

    if (lines[1] === '---INSTANCE---') {

        let res = alloy_instance(lines.slice(2));
        res.command(command);

        let test = alloy_instance_new(command, lines.slice(2));

        return test;

    }

    else if (lines[1] === '---OUTCOME---' && lines[2] === 'Unsatisfiable.') {

        return {
            command: () => command,
            type: () => 'unsatisfiable'
        };

    }

}