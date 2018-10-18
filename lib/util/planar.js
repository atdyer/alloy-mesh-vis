'use babel';

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
    let size = 30;

    // We need at least one triangle to do anything
    if (triangle_names.length) {

        let neighbors = build_neighbors(adjacent_triangles);
        let triangles = build_triangles(edges);

        // Starting with the first triangle, add triangles in a breadth-first manner
        let queue = [];
        let visited = new Set();
        enqueue(triangle_names[0]);

        while (queue.length !== 0) {

            // Get the next triangle to process
            let triangle = dequeue();

            // Do something with the triangle
            console.log(triangle, triangles[triangle]);
            add_triangle(triangle);

            // Get the neighbors of this triangle
            let neighbor_list = Array.from(neighbors[triangle] || []) ;
            neighbor_list.forEach(neighbor => {

                if (!visited.has(neighbor)) {

                    enqueue(neighbor);

                }

            });

        }

        function add_triangle (triangle) {

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

            // If 1 vertex is being added, it shares one or two edges
            // with an existing triangle. Determine it's placement
            // based on the number of edges in common with the adjacent
            // triangle
            else if (adding.length === 1) {



            }

            // If no vertices are being added, all vertices are already
            // placed and should be in non-overlapping positions

        }

        function enqueue (triangle) {
            queue.push(triangle);
            visited.add(triangle);
        }

        function dequeue () {
            return queue.shift();
        }


    }

    return build_nodes(nodes);

}


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
    layout_planar_tin: layout_planar_tin
};