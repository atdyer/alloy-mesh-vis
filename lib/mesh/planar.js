'use babel';

function embed_planar_mesh (mesh, cx, cy, r) {


    //
    // Set some defaults
    //

    cx = cx || 0;
    cy = cy || 0;
    r = r || 80;


    //
    // Initialize positional properties for each node
    //

    forEachItem(mesh.nodes, (node_id, node) => {

        node.x = cx;
        node.y = cy;
        node.fixed = false;

    });


    //
    // Create vertex neighborhoods and list of all edges
    //

    let neighborhood = {},
        edges = [];

    forEachItem(mesh.elements, (ele_id, element) => {

        element.edges.forEach(e => {

            let n1 = e[0],
                n2 = e[1];

            if (!(n1.id in neighborhood)) neighborhood[n1.id] = new Set();
            if (!(n2.id in neighborhood)) neighborhood[n2.id] = new Set();
            neighborhood[n1.id].add(n2);
            neighborhood[n2.id].add(n1);
            edges.push(e);

        });

    });

    forEachItem(neighborhood, (node, neighbors) => {
        neighborhood[node] = Array.from(neighbors);
    });


    //
    // Determine half-edges
    //

    let halves = new Set(),
        edge;

    while (edge = edges.pop()) {

        let e = edge.map(n => n.id).join(),
            r = [edge[1].id, edge[0].id].join();

        if (halves.has(r)) {
            halves.delete(r);
        } else {
            halves.add(e);
        }

    }

    halves = Array.from(halves).map(e => e.split(','));


    //
    // Create a map that contains the outer ring of the mesh
    //

    let ring = {};
    halves.forEach(h => ring[h[0]] = h[1]);


    //
    // Get the set of vertices that are on the outer boundary
    //

    let ring_vertices = new Set();
    halves.forEach(h => {
        ring_vertices.add(h[0]);
        ring_vertices.add(h[1]);
    });
    ring_vertices = Array.from(ring_vertices);


    //
    // Determine the angle that will separate vertices and place the ring nodes
    //

    let angle = 360 / ring_vertices.length;
    let start = ring_vertices[0],
        v = start,
        ng = 0;

    mesh.nodes[start].x = cx + r * Math.cos(ng);
    mesh.nodes[start].y = cy + r * Math.sin(ng);
    mesh.nodes[start].fixed = true;

    while ((v = ring[v]) !== start) {

        ng += angle;
        mesh.nodes[v].x = cx + r * Math.cos(ng * Math.PI / 180);
        mesh.nodes[v].y = cy + r * Math.sin(ng * Math.PI / 180);
        mesh.nodes[v].fixed = true;

    }


    //
    // Iteratively place the rest of the nodes using the averaging method
    //

    let biggest_move = Infinity,
        tolerance = 1;

    while (biggest_move > tolerance) {

        let biggest_it = 0;

        forEachItem(mesh.nodes, (id, node) => {

            if (!node.fixed) {

                let neighbors = neighborhood[id];
                let x = neighbors.reduce((acc, neighbor) => acc + neighbor.x, 0) / neighbors.length;
                let y = neighbors.reduce((acc, neighbor) => acc + neighbor.y, 0) / neighbors.length;
                let dist = Math.sqrt((node.x - x)**2 + (node.y - y)**2);
                node.x = x;
                node.y = y;

                if (dist > biggest_it) biggest_it = dist;

            }

        });

        biggest_move = biggest_it;

    }

    return mesh;

}

function build_triangles (edges) {

    let triangles = {};

    edges.forEach(edge => {

        let t = edge[0],
            v1 = edge[1],
            v2 = edge[2];

        if (!(t in triangles)) {

            triangles[t] = new Set([v1, v2]);

        } else {

            triangles[t].add(v1);
            triangles[t].add(v2);

        }

    });

    return triangles;

}

function forEachItem (obj, callback) {
    for (const k in obj) {
        if (obj.hasOwnProperty(k)) {
            callback(k, obj[k]);
        }
    }
}

export default {
    build_triangles: build_triangles,
    embed_planar_mesh: embed_planar_mesh,
};