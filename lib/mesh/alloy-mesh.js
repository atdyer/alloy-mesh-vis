'use babel';

export default function alloy_mesh (instance) {

    console.log(instance);

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
        return console.log('Unable to extract mesh from instance');

    extract_time_signatures();
    extract_meshes();

    function extract_meshes () {

        let mesh_atms = instance.signatures[mesh_sig].atoms;
        let mesh_rels = instance.signatures[mesh_sig].relations;
        let elem_rels = instance.signatures[elem_sig].relations;

        if (mesh_atms && mesh_rels) {

            let meshes = mesh_atms.map(mesh_atom => {

                let mesh = new_atom(mesh_atom);
                mesh.nodes = [];
                mesh.elements = [];

                let elements = filter_include_first_atom(mesh_rels[elem_rel], mesh_atom);
                elements.forEach(e => {

                    let element_id = e[1];
                    let element = new_atom(element_id);
                    element.nodes = [];
                    element.edges = [];

                    let edges = filter_include_first_atom(elem_rels[edge_rel], element_id);
                    edges.forEach(edge => {

                        let n1 = mesh.nodes.find(n => n.id === edge[1]);
                        let n2 = mesh.nodes.find(n => n.id === edge[2]);

                        if (!n1) {
                            n1 = new_atom(edge[1]);
                            mesh.nodes.push(n1);
                            element.nodes.push(n1);
                        }

                        if (!n2) {
                            n2 = new_atom(edge[2]);
                            mesh.nodes.push(n2);
                            element.nodes.push(n2);
                        }

                        element.edges.push([n1, n2]);

                    });

                    mesh.elements.push(element);

                });

                return mesh;

            });

            console.log(meshes);

        }

    }

    function extract_time_signatures () {

        forEachItem(instance.signatures, (sig_id, signature) => {

            let first,
                next;

            forEachItem(signature.relations, (rel_id, relation) => {

                if (rel_id === 'First') first = sig_id + '<:' + rel_id;
                if (rel_id === 'Next') next = sig_id + '<:' + rel_id;

            });

            if (first && next) {

                console.log(sig_id);
                console.log('\t' + first);
                console.log('\t' + next);

            }

        });

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

        forEachItem(instance.signatures, (sig_id, signature) => {

            forEachItem(signature.relations, (rel_id, relation) => {

                let rel_name = sig_id + '<:' + rel_id;

                relation.forEach(row => {

                    if (row[0] === atom.id) {

                        // Determine property type
                        let arity = row.length;
                        if (arity === 2) {

                            // A static property, unless it maps to the 'time' signature
                            if (!(rel_name in atom.properties)) {
                                atom.properties[rel_name] = {
                                    type: 'static',
                                    atoms: []
                                };
                            }

                            atom.properties[rel_name].atoms.push(row[1]);

                        }

                        if (arity === 3) {

                            // A dynamic property if the last atom is of the 'time' signature

                        }

                    }

                })

            });

        });

    }

}