'use babel';

function populate_mesh_properties (mesh, solution) {

    let relations = solution.relations,
        ignore = new Set(['triangles', 'adj', 'edges', 'First', 'Next']),
        nodeset = new Set(mesh.nodes.map(n => n.id)),
        triangleset = new Set(mesh.triangles);

    let states = solution.states(),
        stateset = new Set(states);

    forEachItem(relations, (rel, arr) => {

        if (!ignore.has(rel)) {
            // console.log(rel, arr[0]);
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

export default {
    populate_mesh_properties: populate_mesh_properties
};