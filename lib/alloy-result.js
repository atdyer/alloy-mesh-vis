'use babel';

export default function alloy_result (lines) {

    let command = lines[0];

    if (lines[1] === '---INSTANCE---') {

        let res = alloy_instance(lines.slice(2));
        res.command = command;
        return res;

    }

    else if (lines[1] === '---OUTCOME---' && lines[2] === 'Unsatisfiable.') {

        return {
            command: command,
            type: 'unsatisfiable'
        };

    }

}

function alloy_instance (lines) {

    let atoms = {},
        relations = {};


    lines.forEach(parse_line);

    return {
        type: 'instance',
        atoms: atoms,
        relations: relations
    };

    function parse_line (line) {

        let dat = line.split('=');

        if (dat.length === 2) {

            if (dat[0].includes('<:')) {

                parse_relation(dat[0], dat[1]);

            } else {

                parse_signature(dat[0], dat[1]);

            }

        }
    }

    function parse_relation (sig_string, tuple_string) {

        let relation = sig_string.split('<:')[1];
        let content = tuple_string.slice(1, -1);
        relations[relation] = content.split(',').map((rel) => {
            return rel.trim().split('->');
        });

    }

    function parse_signature (sig_string, atom_string) {

        let content = atom_string.slice(1, -1);
        atoms[sig_string] = content.split(',').map((atom) => atom.trim());

    }

}