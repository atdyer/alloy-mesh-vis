'use babel';

import alloy_meshes from './mesh/alloy-mesh';
import { extract } from './mesh/mesh';

export default function alloy_instance (lines) {

    let univ = new Set();
    let signatures = {};
    let command;

    lines.forEach(parse_signature_lines);
    lines.forEach(parse_relation_lines);

    let inst = {
        universe: univ,
        signatures: signatures
    };


    // TODO: REMOVE
    let test = extract(inst);
    Object.values(test).forEach(m => m.print());


    let meshes = alloy_meshes(inst);

    inst.command = function (_) {
        if (!arguments.length) return command;
        command = _;
        return inst;
    };

    inst.has_mesh = function () {
        return Object.values(meshes).length !== 0;
    };

    inst.meshes = function () {
        return meshes;
    };

    inst.type = function () {
        return 'instance';
    };

    return inst;


    function new_atom (name) {

        univ.add(name);
        return name;

    }

    function new_relation (sig, rel, table) {

        // Look for the signature
        let signature = signatures[sig];

        if (signature) {

            // Check for an empty table
            if (table.length === 1 && table[0][0] === '') {
                table = [];
            }

            // Save the relation
            signature.relations[rel] = table;

        }

    }

    function parse_relation_lines (line) {

        let dat = line.split('=');

        if (dat.length === 2) {

            if (dat[0].includes('<:')) {

                parse_relation(dat[0], dat[1]);

            }

        }

    }

    function parse_relation (sig_string, set_string) {

        let [sig, rel] = sig_string.split('<:'),
            content = set_string.slice(1, -1);

        new_relation(sig, rel, content.split(',').map(row => row.trim().split('->')));

    }

    function parse_signature_lines (line) {

        let dat = line.split('=');

        if (dat.length === 2) {

            if (!dat[0].includes('<:')) {

                parse_signature(dat[0], dat[1]);

            }

        }

    }

    function parse_signature (sig_string, set_string) {
        let content = set_string.slice(1, -1);
        signatures[sig_string] = {
            atoms: content.split(',').map((atom) => new_atom(atom.trim())),
            relations: {}
        };
    }

}