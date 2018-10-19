'use babel';

import planar from '../../util/planar';

import { forceSimulation, forceLink } from 'd3-force';
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

    let node_label_group,
        node_labels,
        element_label_group,
        element_labels,
        link_group,
        links,
        node_group,
        nodes;

    function mesh (svg) {

        svg.selectAll('g').remove();

        link_group = svg.append('g').attr('class', 'links');
        node_group = svg.append('g').attr('class', 'nodes');
        node_label_group = svg.append('g').attr('class', 'node labels');
        element_label_group = svg.append('g').attr('class', 'element labels');

        width = parseInt(svg.style('width'));
        height = parseInt(svg.style('height'));
        cx = width / 2;
        cy = height / 2;

        // Create the simulation
        simulation = forceSimulation()
            .force('link', forceLink().id(id).strength(0))
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

    function layout_labels (node_data, triangle_data) {

        if (node_label_group) {

            node_labels = node_label_group
                .selectAll('text')
                .data(node_data);

            node_labels
                .exit()
                .remove();

            node_labels = node_labels
                .enter()
                .append('text')
                .text(d => d.id.split('$').pop());

        }

        if (element_label_group) {

            element_labels = element_label_group
                .selectAll('text')
                .data(triangle_data);

            element_labels
                .exit()
                .remove();

            element_labels = element_labels
                .enter()
                .append('text')
                .text(d => d.id.split('$').pop());

        }

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

        let r = (Math.min(width, height) - 60) / 2;
        let node_data = planar.embed_planar_tin(sln, cx, cy, r);
        let link_data = sln.edges().map(edge_to_link);

        let triangles = planar.build_triangles(sln.edges());
        let label_data = [];
        for (let [triangle, vertices] of Object.entries(triangles)) {
            label_data.push({
                id: triangle,
                vertices: Array.from(vertices).map(v => node_data.find(n => n.id === v))
            });
        }

        simulation.nodes(node_data);
        simulation.force('link').links(link_data);

        // Place items on svg
        layout_labels(node_data, label_data);
        layout_links(link_data);
        layout_nodes(node_data);

    }


    function centroid_x (triangle) {
        return triangle.vertices.reduce((s, n) => s + n.x, 0) / triangle.vertices.length;
    }

    function centroid_y (triangle) {
        return triangle.vertices.reduce((s, n) => s + n.y, 0) / triangle.vertices.length;
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
        update_node_labels();
        update_element_labels();

    }

    function update_node_labels () {

        if (node_labels) {
            node_labels
                .attr('x', d => d.x)
                .attr('y', d => d.y);
        }

    }

    function update_element_labels () {

        if (element_labels) {
            element_labels
                .attr('x', centroid_x)
                .attr('y', centroid_y);
        }

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
                .attr('r', 14)
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        }
    }


}