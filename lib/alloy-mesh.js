'use babel';

export default function alloy_mesh (instance) {

    console.log(instance);

    const mesh_ids = ['mesh/Mesh', 'this/Mesh'];

    function extract_meshes () {

        let mesh_sig = mesh_ids.find(id => id in instance.signatures);

        if (mesh_sig) {

            let meshes = instance.signatures[mesh_sig].atoms.map(m => {

                let triangles = m.triangles;
                let mesh = {};
                mesh.id = m.id;
                mesh.nodes = new Set();
                mesh.elements = [];


                triangles.forEach(t => {

                    let element = {};
                    element.id = t.id;
                    element.nodes = new Set();
                    element.edges = [];

                    t.edges.forEach(([v1, v2]) => {

                        mesh.nodes.add(v1.id);
                        mesh.nodes.add(v2.id);
                        element.nodes.add(v1.id);
                        element.nodes.add(v2.id);
                        element.edges.push([v1, v2]);

                    });

                    element.nodes = Array.from(element.nodes);
                    mesh.elements.push(element);

                });

                mesh.nodes = Array.from(mesh.nodes);

                return mesh;

            });

            console.log(meshes);

        }

    }

    extract_meshes();

}