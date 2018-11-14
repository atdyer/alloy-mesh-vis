'use babel';

export default function alloy_instance (command, lines) {

    let instance = {};
    let univ = new Set();
    let signatures = [];
    let relations = [];

    lines.forEach(parse_signature_line);
    lines.forEach(parse_relation_line);

    instance.atoms = function () {
        return Array.from(univ);
    };

    instance.command = function () {
        return command;
    };

    instance.orderings = function () {
        return extract_time_signatures(instance);
    };

    instance.relation = function (relation, signature) {
        return relations.find(r => r.id === relation && r.signature === signature);
    };

    instance.relations = function () {
        return relations;
    };

    instance.signature = function (signature) {
        return signatures.find(s => s.id === signature);
    };

    instance.signatures = function () {
        return signatures;
    };

    instance.type = function () {
        return 'instance';
    };

    return instance;

    function extract_time_signatures (instance) {

        // First get all signatures that are ordered using util/ordering

        let timesigs = {};
        let relations = instance.relations();
        let firsts = relations.filter(relation => relation.id === 'First');
        let nexts = relations.filter(relation => relation.id === 'Next');

        firsts.forEach(relation => {

            let table = relation.table;
            if (table.length === 1 && table[0].length === 2) {
                timesigs[relation.signature] = [table[0][1]];
            }

        });

        nexts.forEach(relation => {

            let sig = relation.signature;
            if (sig in timesigs) {

                let table = relation.table;
                if (table.length > 0 && table[0].length === 3) {

                    let next = {};
                    table.forEach(row => {
                        next[row[1]] = row[2];
                    });

                    let last = timesigs[sig].pop();
                    while (last) {
                        let curr = next[last];
                        timesigs[sig].push(last);
                        last = curr;
                    }

                }

            }

        });

        // Next look for additional signatures that contain ALL of the atoms
        // from the signatures that were ordered with util/ordering
        let orderatoms = new Set(Object.values(timesigs).reduce((acc, cur) => acc.concat(cur), []));
        timesigs = instance.signatures().filter(signature => {
            let atomset = new Set(signature.atoms);
            return sets_equal(atomset, orderatoms);
        });

        return timesigs;

    }

    function parse_relation (sig_string, set_string) {

        let [sig, rel] = sig_string.split('<:');
        let content = set_string.slice(1, -1);

        let signature = signatures.find(s => s.id === sig);
        let relation_table = content.split(',').map(row => row.trim().split('->'));

        if (relation_table.length === 1 && relation_table[0][0] === '') relation_table = [];

        if (signature) {
            signature.relations.push(rel);
            relations.push({
                id: rel,
                signature: sig,
                table: relation_table
            });
        }


    }

    function parse_relation_line (line) {

        let dat = line.split('=');

        if (dat.length === 2 && dat[0].includes('<:')) {

            parse_relation(dat[0], dat[1]);

        }

    }

    function parse_signature (sig_string, set_string) {

        let content = set_string.slice(1, -1);

        signatures.push({
            id: sig_string,
            atoms: content.split(',').map(atom => {
                atom = atom.trim();
                univ.add(atom);
                return atom;
            }),
            relations: []
        });

    }

    function parse_signature_line (line) {

        let dat = line.split('=');

        if (dat.length === 2 && !dat[0].includes('<:')) {

            parse_signature(dat[0], dat[1]);

        }

    }

    function sets_equal (s1, s2) {
        if (s1.size !== s2.size) return false;
        for (const a of s1) if (!s2.has(a)) return false;
        return true;
    }

}