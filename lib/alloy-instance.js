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

    let mesh_name = 'this/Mesh' in atoms ? 'this/Mesh' : 'mesh/Mesh' in atoms ? 'mesh/Mesh' : null,
        triangle_name = 'this/Triangle' in atoms ? 'this/Triangle' : 'mesh/Triangle' in atoms ? 'mesh/Triangle' : null,
        vertex_name = 'this/Vertex' in atoms ? 'this/Vertex' : 'mesh/Vertex' in atoms ? 'mesh/Vertex' : null;

    solution.has_mesh = function () {

        return mesh_name &&
            triangle_name &&
            vertex_name &&
            'triangles' in relations &&
            'adj' in relations &&
            'edges' in relations;

    };

    solution.meshes = function () {

        if (solution.has_mesh()) {

            let meshes = atoms[mesh_name].map(m => { return { mesh: m } });

            meshes.forEach(m => {

                // Get the list of triangles in this mesh
                m.triangles = relations['triangles']
                    .filter(t => t[0] === m.mesh)
                    .map(t => t[1]);

                // Get the list of edges in this mesh
                m.edges = relations['edges']
                    .filter(e => m.triangles.includes(e[0]));

                // Get the list of nodes in this mesh
                m.vertices = new Set();
                m.edges.forEach(e => m.vertices.add(e[1]));
                m.vertices = Array.from(m.vertices);

            });

            return meshes;

        }

    };

    solution.num_meshes = function () {

        return solution.has_mesh() ? atoms[mesh_name].length : 0;

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