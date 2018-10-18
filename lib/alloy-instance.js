'use babel';

export default function alloy_instance (lines) {

    let atoms = {},
        relations = {};

    lines.forEach(parse_line);

    let solution = {
        type: 'instance',
        atoms: atoms,
        relations: relations
    };

    solution.is_mesh = function () {

        return('this/Mesh' in atoms || 'mesh/Mesh' in atoms) &&
            ('this/Triangle' in atoms || 'mesh/Triangle' in atoms) &&
            ('this/Vertex' in atoms || 'mesh/Vertex' in atoms) &&
            'triangles' in relations &&
            'adj' in relations &&
            'edges' in relations;

    };

    solution.triangles = function () {

        return 'this/Triangle' in atoms ? atoms['this/Triangle'] :
            'mesh/Triangle' in atoms ? atoms['mesh/Triangle'] :
            [];

    };

    solution.vertices = function () {

        return 'this/Vertex' in atoms ? atoms['this/Vertex'] :
            'mesh/Vertex' in atoms ? atoms['mesh/Vertex'] :
            [];

    };

    solution.adjacent_triangles = function () {

        return 'adj' in relations ?
            relations.adj.map(a => a.slice(1)) :
            [];

    };

    solution.edges = function () {

        return 'edges' in relations ?
            relations['edges'] :
            [];

    };

    return solution;


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
        if (content.length === 0) {
            relations[relation] = [];
        } else {
            relations[relation] = content.split(',').map((rel) => {
                return rel.trim().split('->');
            });
        }

    }

    function parse_signature (sig_string, atom_string) {

        let content = atom_string.slice(1, -1);
        atoms[sig_string] = content.split(',').map((atom) => atom.trim());

    }

}