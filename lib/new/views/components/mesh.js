'use babel';

import {
    forceSimulation,
    forceCenter,
    forceManyBody,
    forceLink
} from 'd3-force';

import { line } from 'd3-shape';
import { drag } from 'd3-drag';
import { event } from 'd3-selection';

export default function mesh_component () {

    let solution,
        simulation;

    let width,
        height,
        cx,
        cy;

    let link_group,
        links,
        node_group,
        nodes;

    function mesh (svg) {

        svg.selectAll('g').remove();

        link_group = svg.append('g').attr('class', 'links');
        node_group = svg.append('g').attr('class', 'nodes');

        width = parseInt(svg.style('width'));
        height = parseInt(svg.style('height'));
        cx = width / 2;
        cy = height / 2;

        // Create the simulation
        simulation = forceSimulation()
            .stop()
            .force('center', forceCenter(cx, cy))
            .force('charge', forceManyBody().strength(-30))
            .force('link', forceLink()
                .id(id)
                .strength(0.0001)
                .distance(80)
                .iterations(10)
            )
            .on('tick', ticked);

        // Respond to mouse events
        svg.call(drag()
            .container(svg.node())
            .subject(dragsubject)
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended)
        );

        if (solution) layout_solution(solution);

    }

    mesh.solution = function (_) {
        if (!arguments.length) return solution;
        solution = _;
        return mesh;
    };

    return mesh;


    function dragsubject () {
        return simulation.find(event.x, event.y);
    }

    function dragstarted () {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged () {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended () {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    function layout_links (link_data) {

        if (link_group) {

            links = link_group
                .selectAll('path')
                .data(link_data.map(l => [l.source, l.target]));

            links
                .exit()
                .remove();

            links = links
                .enter()
                .append('path')
                .merge(links);

        }

    }

    function layout_nodes (node_data) {

        if (node_group) {

            nodes = node_group
                .selectAll('circle')
                .data(node_data);

            nodes
                .exit()
                .remove();

            nodes = nodes
                .enter()
                .append('circle')
                .merge(nodes);

        }

    }

    function layout_solution (sln) {

        // Get the data
        let vertices = sln.atoms['this/Vertex'] || sln.atoms['mesh/Vertex'];
        let edges = sln.relations['edges'];
        let node_data = vertices.map(vertex_to_node);
        let link_data = edges.map(edge_to_link);

        simulation.nodes(node_data);
        simulation.force('link').links(link_data);

        // Place items on svg
        layout_links(link_data);
        layout_nodes(node_data);

        simulation.restart();
    }

    function edge_to_link (edge) {

        return {
            source: edge[1],
            target: edge[2]
        };

    }

    function id (d) {
        return d.id;
    }

    function ticked () {

        update_links();
        update_nodes();

    }

    function update_links () {

        if (links) {
            links
                .attr('d', line()
                    .x(d => d.x)
                    .y(d => d.y)
                );
        }

    }

    function update_nodes () {

        if (nodes) {
            nodes
                .attr('r', 7)
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        }
    }

    function vertex_to_node (vertex) {
        return {
            id: vertex
        };
    }

}