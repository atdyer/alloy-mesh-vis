'use babel';

import * as d3 from 'd3-force';

export default function mesh_component () {

    let solution;

    let width,
        height,
        cx,
        cy;

    function mesh (svg) {

        width = parseInt(svg.style('width'));
        height = parseInt(svg.style('height'));
        cx = width / 2;
        cy = height / 2;

        if (solution) layout_solution(svg, solution);

    }

    mesh.solution = function (_) {
        if (!arguments.length) return solution;
        solution = _;
        return mesh;
    };

    return mesh;


    function layout_solution (svg, sln) {

        // Get the data
        let vertices = sln.atoms['this/Vertex'];
        let moments = sln.relations['moment'];
        let nodes = vertices.map(vertex_to_node);

        // Create an initial simulation layout
        let simulation = d3.forceSimulation(nodes)
            .force('center', d3.forceCenter(cx, cy))
            .force('charge', d3.forceManyBody().strength(-80));

        const n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));
        for (let i=0; i<n; ++i) {
            simulation.tick();
        }

        // Place items on svg
        let selection = svg.selectAll('circle').data(nodes);

        selection
            .exit()
            .remove();

        selection = selection
            .enter()
            .append('circle')
            .merge(selection);

        selection
            .attr('r', 10)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);

        console.log(nodes);
    }

    function vertex_to_node (vertex) {
        return {
            id: vertex
        };
    }

}