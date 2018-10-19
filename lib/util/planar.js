'use babel';

function layout_planar_tin_layered (instance, cx, cy) {

    let triangle_names = instance.triangles(),
        adjacent_triangles = instance.adjacent_triangles(),
        edges = instance.edges();

    let nodes = {},
        size = 60;

    // We need at least one triangle to do anything
    if (triangle_names.length) {

        let neighbors = build_neighbors(adjacent_triangles),
            triangles = build_triangles(edges);

        // The first layer will be just the first triangle
        let queue = [],
            visited = new Set();

        enqueue(triangle_names[0]);

        while (queue.length) {

            // The current layer is the set of all triangles currently in the queue...
            // Get the set of all nodes that will be added
            let entering_vertices = new Set();
            queue.forEach(t => {
                let triangle = triangles[t];
                let list = Array.from(triangle);
                console.log(list);
            });
            // queue.forEach(t => Array.from(triangles[t]).forEach(console.log));
            // queue.forEach(t => Array.from(triangles[t]).forEach(entering_vertices.add));
            // console.log(entering_vertices);
            queue = [];


        }

        function enqueue (triangle) {
            queue.push(triangle);
            visited.add(triangle);
        }

        function dequeue () {
            return queue.shift();
        }

    }

}

function layout_planar_tin (instance, cx, cy) {

    // neighbors: {
    //  'Triangle0': Set('Triangle1', 'Triangle2')
    // }
    //
    // triangles: {
    //  'Triangle0': Set('Vertex0', 'Vertex1', 'Vertex2')
    // }
    //
    // nodes: [{id: 'Vertex0'}, {id: 'Vertex1'}, {id: 'Vertex2'}]

    let triangle_names = instance.triangles();
    let adjacent_triangles = instance.adjacent_triangles();
    let edges = instance.edges();

    let nodes = {};
    let size = 60;

    // We need at least one triangle to do anything
    if (triangle_names.length) {

        let neighbors = build_neighbors(adjacent_triangles);
        let triangles = build_triangles(edges);

        // Starting with the first triangle, add triangles in a breadth-first manner
        let queue = [];
        let visited = new Set();
        enqueue(triangle_names[0], null);

        while (queue.length !== 0) {

            // Get the next triangle to process
            let [triangle, neighbor_of] = dequeue();

            // Do something with the triangle
            // console.log(neighbor_of + ' -> ' + triangle, triangles[triangle]);
            add_triangle(triangle, neighbor_of);

            // Get the neighbors of this triangle
            let neighbor_list = Array.from(neighbors[triangle] || []) ;
            neighbor_list.forEach(neighbor => {

                if (!visited.has(neighbor)) {

                    enqueue(neighbor, triangle);

                }

            });

        }

        function add_triangle (triangle, neighbor_of) {

            // console.log('Adding triangle: ' + triangle);

            // Get the vertices of this triangle
            let vertices = Array.from(triangles[triangle]);

            // Determine which vertices need to be added
            let adding = vertices.filter(v => !(v in nodes));
            adding.forEach(v => nodes[v] = vertex_to_node(v));

            // If 3 vertices are being added, it is the first triangle and
            // can be placed at the center of the layout
            if (adding.length === 3) {

                nodes[adding[0]].x = cx - size;
                nodes[adding[0]].y = cy - size;
                nodes[adding[1]].x = cx + size;
                nodes[adding[1]].y = cy - size;
                nodes[adding[2]].x = cx;
                nodes[adding[2]].y = cy + size;

            }

            // If 1 vertex is being added, there are two possible cases:
            // - A single triangle is formed with the previous neighbor by adding this vertex
            // - Two triangles are formed with the previous neighbor by adding this vertex
            else if (adding.length === 1 && neighbor_of) {

                let entering_vertex = adding[0];

                // Determine which case we're looking at
                // console.log('----------');
                // console.log('Adding triangle: ' + vertices);
                // console.log('Adding vertex: ' + entering_vertex);

                // First, get the list of vertices that form the previous triangle
                let neighbor = Array.from(triangles[neighbor_of]);
                // console.log('Previous triangle: ' + neighbor);

                // Next, determine the two vertices in common between this triangle and the previous
                let common_vertices = neighbor.filter(v => vertices.includes(v));
                let uncommon_vertex = neighbor.filter(v => !vertices.includes(v)).pop();
                // console.log('Common vertices with previous triangle: ' + common_vertices);
                // console.log('Uncommon vertex with previous triangle: ' + uncommon_vertex);

                // Now look for the two other possible triangles
                for (let i=0; i<common_vertices.length; ++i) {

                    let common_vertex = common_vertices[i];
                    let test_triangle = new Set([entering_vertex, common_vertex, uncommon_vertex]);

                    // console.log('Looking for triangle: ' + Array.from(test_triangle));
                    let exists = is_triangle(test_triangle);

                    if (exists) {

                        // console.log('Vertex common to all three: ' + common_vertex);

                        // Place the new vertex where the common vertex is currently located
                        nodes[entering_vertex].x = nodes[common_vertex].x;
                        nodes[entering_vertex].y = nodes[common_vertex].y;

                        // Move the common vertex to the center of the previous triangle
                        let c = centroid(neighbor);
                        nodes[common_vertex].x = c.x;
                        nodes[common_vertex].y = c.y;

                        return;

                    }

                }

                // If we've reached this point, there are no other common triangles,
                // so reflect the uncommon point
                let reflected_vertex = reflect(uncommon_vertex, common_vertices);
                nodes[entering_vertex].x = reflected_vertex.x;
                nodes[entering_vertex].y = reflected_vertex.y;


                // console.log('----------');

            }

            // If no vertices are being added, all vertices are already
            // placed and should be in non-overlapping positions

        }


        function centroid (node_list) {
            let xsum = node_list.reduce((s, n) => s + nodes[n].x, 0);
            let ysum = node_list.reduce((s, n) => s + nodes[n].y, 0);
            return {
                x: xsum / node_list.length,
                y: ysum / node_list.length
            };
        }

        function reflect (vertex, line) {

            // Fetch all the necessary coordinates
            let p = nodes[vertex],
                a = nodes[line[0]],
                b = nodes[line[1]];

            let dx = b.x - a.x,
                dy = b.y - a.y;

            let s = (dx * dx - dy * dy) / (dx * dx + dy * dy),
                t = 2 * dx * dy / (dx * dx + dy * dy);

            return {
                x: s * (p.x - a.x) + t * (p.y - a.y) + a.x,
                y: t * (p.x - a.x) - s * (p.y - a.y) + a.y
            };


        }

        function equal (a, b) {
            if (a.size !== b.size) return false;
            for (const x of a) if (!b.has(x)) return false;
            return true;
        }

        function enqueue (triangle, neighbor_of) {
            queue.push([triangle, neighbor_of]);
            visited.add(triangle);
        }

        function dequeue () {
            return queue.shift();
        }

        function is_triangle (vertex_set) {
            return Object.values(triangles).findIndex(t => equal(t, vertex_set)) !== -1;
        }


    }

    return build_nodes(nodes);

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

function vertex_to_node (vertex) {
    return {
        id: vertex,
        x: 0,
        y: 0
    };
}

export default {
    build_triangles: build_triangles,
    layout_planar_tin: layout_planar_tin,
    layout_planar_tin_layered: layout_planar_tin_layered
};