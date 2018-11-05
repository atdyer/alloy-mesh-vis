'use babel';

import alloy_element from "./alloy-element";
import alloy_node from "./alloy-node";
import alloy_edge from "./alloy-edge";
import { property_static, property_dynamic } from './alloy-property';

export {
    alloy_mesh,
    extract
};

function alloy_mesh (id) {

    let nodes = {},
        edges = {},
        elements = {};

    let properties = {};

    function mesh (svg) {

    }

    mesh.id = function () {
        return id;
    };

    mesh.node = function (node_id, node) {
        if (arguments.length === 1) return nodes[node_id];
        nodes[node_id] = node;
        return mesh;
    };

    mesh.nodes = function () {
        return Object.keys(nodes);
    };

    mesh.edge = function (edge_id, edge) {
        if (arguments.length === 1) return edges[edge_id];
        edges[edge_id] = edge;
        return mesh;
    };

    mesh.edges = function () {
        return Object.keys(edges);
    };

    mesh.element = function (element_id, element) {
        if (arguments.length === 1) return elements[element_id];
        elements[element_id] = element;
        return mesh;
    };

    mesh.elements = function () {
        return Object.keys(elements);
    };

    mesh.property = function (property_id, property) {
        if (arguments.length === 1) return properties[property_id];
        if (arguments.length === 2) properties[property_id] = property;
        return mesh;
    };

    mesh.properties = function () {
        return Object.keys(properties);
    };

    mesh.print = function (depth) {
        depth = depth || 0;
        console.log('\t'.repeat(depth) + id + ' (' + mesh.properties().join() + ')');
        Object.values(nodes).forEach(n => n.print(depth + 1));
        Object.values(edges).forEach(e => e.print(depth + 1));
        Object.values(elements).forEach(e => e.print(depth + 1));
    };

    return mesh;

}

function extract (instance) {

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

            mesh_atms.forEach(mesh_id => {

                let mesh = alloy_mesh(mesh_id);
                populate_properties(mesh);

                let elements = filter_include_first_atom(mesh_rels[elem_rel], mesh_id);
                elements.forEach(e => {

                    let element = alloy_element(e[1]);
                    populate_properties(element);

                    let edges = filter_include_first_atom(elem_rels[edge_rel], element.id());
                    edges.forEach(edge => {

                        let id1 = edge[1],
                            id2 = edge[2];

                        let n1 = mesh.node(id1),
                            n2 = mesh.node(id2);

                        if (!n1) {
                            n1 = alloy_node(id1);
                            populate_properties(n1);
                            mesh.node(id1, n1);
                            element.node(id1, n1);
                        }

                        if (!n2) {
                            n2 = alloy_node(id2);
                            populate_properties(n2);
                            mesh.node(id2, n2);
                            element.node(id2, n2);
                        }

                        edge = alloy_edge(n1, n2);
                        mesh.edge(edge.id(), edge);
                        element.edge(edge.id(), edge);

                    });

                    mesh.element(element.id(), element);

                });

                meshes[mesh_id] = mesh;

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

    function populate_properties (atom) {

        let time_atoms = new Set(Object.values(time_signatures).reduce((acc, val) => acc.concat(val), []));

        forEachItem(instance.signatures, (sig_id, signature) => {

            forEachItem(signature.relations, (rel_id, relation) => {

                let rel_name = sig_id + '<:' + rel_id;

                relation.forEach(row => {

                    if (row[0] === atom.id()) {

                        // Determine property type
                        let arity = row.length;

                        // Arity of 2 means static property
                        if (arity === 2 && !time_atoms.has(row[1])) {

                            let property = atom.property(rel_name);

                            if (!property) {
                                property = property_static(rel_name);
                                atom.property(rel_name, property);
                            }

                            property.value(row[1]);

                        }

                        // Arity of 3 with a 'time' signature means dynamic property
                        if (arity === 3 && time_atoms.has(row[2])) {

                            let property = atom.property(rel_name);

                            if (!property) {
                                property = property_dynamic(rel_name);
                                atom.property(rel_name, property);
                            }

                            property.value(row[2], row[1]);

                        }

                    }

                });

            });

        });

    }

}