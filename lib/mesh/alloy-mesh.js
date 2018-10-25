'use babel';

export default function alloy_meshes (instance) {

    const mesh_sig_ids = ['mesh/Mesh', 'this/Mesh'];
    const elem_sig_ids = ['mesh/Triangle', 'this/Triangle'];
    const node_sig_ids = ['mesh/Vertex', 'this/Vertex'];
    const elem_rel_ids = ['triangles'];
    const edge_rel_ids = ['edges'];

    const mesh_sig = find_signature(mesh_sig_ids);
    const elem_sig = find_signature(elem_sig_ids);
    const node_sig = find_signature(node_sig_ids);
    const elem_rel = find_relation(mesh_sig, elem_rel_ids);
    const edge_rel = find_relation(elem_sig, edge_rel_ids);

    if (!mesh_sig || !elem_sig || !node_sig || !elem_rel || !edge_rel)
        return {};

    const time_signatures = extract_time_signatures();
    return extract_meshes();

    function extract_meshes () {

        let mesh_atms = instance.signatures[mesh_sig].atoms;
        let mesh_rels = instance.signatures[mesh_sig].relations;
        let elem_rels = instance.signatures[elem_sig].relations;

        if (mesh_atms && mesh_rels) {

            let meshes = {};

            mesh_atms.forEach(mesh_atom => {

                let mesh = new_atom(mesh_atom);
                mesh.nodes = {};
                mesh.elements = {};
                mesh.edges = [];

                let elements = filter_include_first_atom(mesh_rels[elem_rel], mesh_atom);
                elements.forEach(e => {

                    let element_id = e[1];
                    let element = new_atom(element_id);
                    element.nodes = {};
                    element.edges = [];

                    let edges = filter_include_first_atom(elem_rels[edge_rel], element_id);
                    edges.forEach(edge => {

                        let n1 = mesh.nodes[edge[1]];
                        let n2 = mesh.nodes[edge[2]];

                        if (!n1) {
                            n1 = new_atom(edge[1]);
                            mesh.nodes[n1.id] = n1;
                        }
                        element.nodes[n1.id] = n1;

                        if (!n2) {
                            n2 = new_atom(edge[2]);
                            mesh.nodes[n2.id] = n2;
                        }
                        element.nodes[n2.id] = n2;

                        element.edges.push([n1, n2]);
                        mesh.edges.push([n1, n2]);

                    });

                    mesh.elements[element.id] = element;

                });

                meshes[mesh_atom] = mesh;

            });

            return meshes;

        }

        return {};

    }

    function extract_time_signatures () {

        let time_sigs = {};

        forEachItem(instance.signatures, (sig_id, signature) => {

            let first,
                first_table,
                next,
                next_table;

            forEachItem(signature.relations, (rel_id, relation) => {

                if (rel_id === 'First') {
                    first = sig_id + '<:' + rel_id;
                    first_table = relation;
                }
                if (rel_id === 'Next') {
                    next = sig_id + '<:' + rel_id;
                    next_table = relation;
                }

            });

            if (first && first_table && first_table.length && first_table[0].length === 2 &&
                next && next_table && next_table.length && next_table[0].length === 3) {

                let atoms = [first_table[0][1]];
                let next_dict = {};
                next_table.forEach(row => next_dict[row[1]] = row[2]);

                let n;
                while (n = next_dict[atoms[atoms.length - 1]]) {
                    atoms.push(n);
                }

                time_sigs[sig_id] = atoms;

            }

        });

        return time_sigs;

    }

    function forEachItem (obj, callback) {
        for (const k in obj) {
            if (obj.hasOwnProperty(k)) {
                callback(k, obj[k]);
            }
        }
    }

    function filter_include_first_atom (list, id) {
        return list.filter(l => l.length && l[0] === id);
    }

    function find_relation (signature, options) {
        if (signature) {
            let sig = instance.signatures[signature];
            if (sig) {
                return options.find(id => id in sig.relations);
            }
        }
    }

    function find_signature (options) {
        return options.find(id => id in instance.signatures);
    }

    function new_atom (id) {

        const atom = {
            id: id,
            properties: {}
        };

        populate_atom_properties(atom);

        return atom;

    }

    function populate_atom_properties (atom) {

        let time_atoms = new Set(Object.values(time_signatures).reduce((acc, val) => acc.concat(val), []));

        forEachItem(instance.signatures, (sig_id, signature) => {

            forEachItem(signature.relations, (rel_id, relation) => {

                let rel_name = sig_id + '<:' + rel_id;

                relation.forEach(row => {

                    if (row[0] === atom.id) {

                        // Determine property type
                        let arity = row.length;

                        if (arity === 2 && !time_atoms.has(row[1])) {

                            // A static property, unless it maps to the 'time' signature
                            if (!(rel_name in atom.properties)) {
                                atom.properties[rel_name] = {
                                    type: 'static',
                                    atoms: []
                                };
                            }

                            atom.properties[rel_name].atoms.push(row[1]);

                        }

                        if (arity === 3 && time_atoms.has(row[2])) {

                            // A dynamic property if the last atom is of a 'time' signature
                            if (!(rel_name in atom.properties)) {
                                atom.properties[rel_name] = {
                                    type: 'dynamic',
                                    atoms: {}
                                }
                            }

                            atom.properties[rel_name].atoms[row[2]] = row[1];

                        }

                    }

                });

            });

        });

    }

}