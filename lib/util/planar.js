'use babel';

function embed_planar_mesh (mesh, cx, cy, r) {

    //
    // Build the nodes list and maintain a local mapping for convenience
    //

    r = r || 80;
    let nodes = {};

    mesh.nodes = mesh.vertices.map(v => {
        return {
            id: v,
            x: cx || 0,
            y: cy || 0,
            fixed: false
        }
    });

    mesh.nodes.forEach(n => nodes[n.id] = n);


    //
    // Create the vertex neighborhood and build element node lists
    //

    let elements = {},
        neighborhood = {};

    mesh.edges.forEach(e => {
        let el = e[0],
            n1 = e[1],
            n2 = e[2];
        if (!(n1 in neighborhood)) neighborhood[n1] = new Set();
        if (!(n2 in neighborhood)) neighborhood[n2] = new Set();
        if (!(el in elements)) elements[el] = new Set();
        neighborhood[n1].add(n2);
        neighborhood[n2].add(n1);
        elements[el].add(n1);
        elements[el].add(n2);
    });

    forEachItem(neighborhood, (node, neighbors) => {
        neighborhood[node] = Array.from(neighbors);
    });

    forEachItem(elements, (element, nodeset) => {
        elements[element] = Array.from(nodeset).map(n => nodes[n]);
    });

    mesh.elements = Object.entries(elements).map(([element, nodelist]) => {
        return {
            id: element,
            nodes: nodelist
        }
    });


    //
    // Determine half-edges
    //

    let halves = new Set(),
        edges = mesh.edges.map(e => e.slice(1)),
        edge;

    while (edge = edges.pop()) {

        let r = [edge[1], edge[0]].join();

        if (halves.has(r)) {
            halves.delete(r);
        } else {
            halves.add(edge.join());
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

    nodes[start].x = cx + r * Math.cos(ng);
    nodes[start].y = cy + r * Math.sin(ng);

    while ((v = ring[v]) !== start) {

        ng += angle;
        nodes[v].x = cx + r * Math.cos(ng * Math.PI / 180);
        nodes[v].y = cy + r * Math.sin(ng * Math.PI / 180);

    }

    ring_vertices.forEach(v => nodes[v].fixed = true);


    //
    // Iteratively place the rest of the nodes using the averaging method
    //

    let biggest_move = Infinity,
        tolerance = 1;

    while (biggest_move > tolerance) {

        let biggest_it = 0;

        forEachItem(nodes, (id, node) => {

            if (!node.fixed) {

                let neighbors = neighborhood[id];
                let x = neighbors.reduce((acc, neighbor) => acc + nodes[neighbor].x, 0) / neighbors.length;
                let y = neighbors.reduce((acc, neighbor) => acc + nodes[neighbor].y, 0) / neighbors.length;
                let dist = Math.sqrt((node.x - x)**2 + (node.y - y)**2);
                node.x = x;
                node.y = y;

                if (dist > biggest_it) biggest_it = dist;

            }

        });

        biggest_move = biggest_it;

    }


    //
    // Convert edges to hold nodes instead of just ids
    //

    mesh.edges = mesh.edges.map(nodelist => nodelist.slice(1).map(n => nodes[n]));

    //
    // Create elements list
    //

    return mesh;

}

function embed_planar_tin (instance, cx, cy, r) {

    // Get the list of edges
    let edges = instance.edges().map(e => e.slice(1));

    // Create the list of nodes
    let node_list = new Set();
    let node_map = {};
    edges.forEach(e => node_list.add(e[0]));
    node_list = Array.from(node_list).map(v => {
        return {
            id: v,
            x: cx,
            y: cy,
            fixed: false
        };
    });
    node_list.forEach(n => node_map[n.id] = n);

    // Create the vertex neighborhood
    let neighborhood = {};
    edges.forEach(e => {
        let a = e[0],
            b = e[1];
        if (!(a in neighborhood)) neighborhood[a] = new Set();
        if (!(b in neighborhood)) neighborhood[b] = new Set();
        neighborhood[a].add(b);
        neighborhood[b].add(a);
    });
    forEachItem(neighborhood, (node, neighbors) => {
        neighborhood[node] = Array.from(neighbors);
    });

    // Determine half-edges
    let halves = new Set(),
        edge;

    while (edge = edges.pop()) {

        let r = [edge[1], edge[0]].join();

        if (halves.has(r)) {
            halves.delete(r);
        } else {
            halves.add(edge.join());
        }

    }

    halves = Array.from(halves).map(e => e.split(','));

    // Create a map that contains the outer ring of the mesh
    let ring = {};
    halves.forEach(h => ring[h[0]] = h[1]);

    // Get the set of vertices that are on the outer boundary
    let ring_vertices = new Set();
    halves.forEach(h => {
        ring_vertices.add(h[0]);
        ring_vertices.add(h[1]);
    });
    ring_vertices = Array.from(ring_vertices);

    // Determine the angle that will separate vertices
    let angle = 360 / ring_vertices.length;

    // Place ring nodes
    let start = ring_vertices[0],
        v = start,
        ng = 0;

    node_map[start].x = cx + r * Math.cos(ng);
    node_map[start].y = cy + r * Math.sin(ng);

    while ((v = ring[v]) !== start) {

        ng += angle;
        node_map[v].x = cx + r * Math.cos(ng * Math.PI / 180);
        node_map[v].y = cy + r * Math.sin(ng * Math.PI / 180);

    }

    // Fix the ring nodes
    ring_vertices.forEach(v => node_map[v].fixed = true);

    // Iteratively place the rest of the nodes using the averaging method
    let biggest_move = Infinity,
        tolerance = 1;

    while (biggest_move > tolerance) {

        let biggest_it = 0;

        forEachItem(node_map, (id, node) => {

            if (!node.fixed) {

                let neighbors = neighborhood[id];
                let x = neighbors.reduce((acc, neighbor) => acc + node_map[neighbor].x, 0) / neighbors.length;
                let y = neighbors.reduce((acc, neighbor) => acc + node_map[neighbor].y, 0) / neighbors.length;
                let dist = Math.sqrt((node.x - x)**2 + (node.y - y)**2);
                node.x = x;
                node.y = y;

                if (dist > biggest_it) biggest_it = dist;

            }

        });

        biggest_move = biggest_it;

    }

    return node_list;


}

function forEachItem (obj, callback) {
    for (const k in obj) {
        if (obj.hasOwnProperty(k)) {
            callback(k, obj[k]);
        }
    }
}

// Some set operations

function build_neighbors (adjacency) {

    let neighbors = {};

    adjacency.forEach(adj => {

        let a = adj[0],
            b = adj[1];

        if (!(a in neighbors)) {

            neighbors[a] = new Set([b]);

        } else {

            neighbors[a].add(b);

        }

    });

    return neighbors;

}

function build_nodes (nodes) {

    return Object.values(nodes);

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

export default {
    build_triangles: build_triangles,
    embed_planar_mesh: embed_planar_mesh,
    embed_planar_tin: embed_planar_tin
};