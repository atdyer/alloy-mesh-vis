'use babel';

import planar from '../../mesh/planar';

import { line } from 'd3-shape';
import { drag } from 'd3-drag';
import { event, select } from 'd3-selection';

export default function mesh_component () {

    let width,
        height;

    let node_label_group,
        node_labels,
        element_label_group,
        element_labels,
        link_group,
        links,
        node_group,
        nodes;

    let styles = {};

    function mesh (svg, solution) {

        svg.selectAll('g').remove();

        // Create groups
        link_group = svg.append('g').attr('class', 'links');
        node_group = svg.append('g').attr('class', 'nodes');
        node_label_group = svg.append('g').attr('class', 'node labels');
        element_label_group = svg.append('g').attr('class', 'element labels');

        // Get svg size
        width = parseInt(svg.style('width'));
        height = parseInt(svg.style('height'));

        // Respond to mouse events
        svg.call(drag()
            .container(svg.node())
            .subject(dragsubject)
            .on('drag', dragged)
        );

        // Render the solution
        render_solution(solution);

    }

    mesh.style_property = function (property) {

        let id = property.signature + '<:' + property.property;
        styles[id] = property;

        if (nodes) style_nodes(nodes);

    };

    return mesh;


    function render_solution (solution) {

        console.log(solution);
        console.log(solution.meshes());

        let meshes = Object.values(solution.meshes()),
            rectangles = build_rectangles(meshes.length);

        meshes = meshes.map((m, i) => {

            let rect = rectangles[i],
                w = rect.r - rect.l,
                h = rect.b - rect.t,
                cx = (rect.r + rect.l) / 2,
                cy = (rect.t + rect.b) / 2,
                r = (Math.min(w, h) / 2) - 30;

            planar.embed_planar_mesh(m, cx, cy, r);

            return m;

        });

        layout_nodes(meshes);
        layout_elements(meshes);
        layout_links(meshes);

    }

    function build_rectangles (num_rectangles) {

        let rectangles = [{
            l: 0,
            r: width,
            t: 0,
            b: height
        }];

        while (rectangles.length < num_rectangles) {

            let rect = rectangles.shift(),
                w = rect.r - rect.l,
                h = rect.b - rect.t,
                cx = (rect.r + rect.l) / 2,
                cy = (rect.b + rect.t) / 2;

            if (w > h) {
                rectangles.push({
                    l: rect.l,
                    r: cx,
                    t: rect.t,
                    b: rect.b
                });
                rectangles.push({
                    l: cx,
                    r: rect.r,
                    t: rect.t,
                    b: rect.b
                });
            } else {
                rectangles.push({
                    l: rect.l,
                    r: rect.r,
                    t: rect.t,
                    b: cy
                });
                rectangles.push({
                    l: rect.l,
                    r: rect.r,
                    t: cy,
                    b: rect.b
                });
            }

        }

        return rectangles;

    }

    function centroid_x (node_list) {
        return node_list.reduce((s, n) => s + n.x, 0) / node_list.length;
    }

    function centroid_y (node_list) {
        return node_list.reduce((s, n) => s + n.y, 0) / node_list.length;
    }

    function dragsubject () {
        return find_node(event.x, event.y);
    }

    function dragged () {
        event.subject.x = event.x;
        event.subject.y = event.y;
        position_nodes();
        position_links();
        position_labels();
    }

    function forEachItem (obj, callback) {
        for (const k in obj) {
            if (obj.hasOwnProperty(k)) {
                callback(k, obj[k]);
            }
        }
    }

    function find_node (x, y, radius) {

        if (nodes) {

            let data = nodes.data(),
                n = data.length,
                i,
                dx,
                dy,
                d2,
                node,
                closest;

            if (radius == null) radius = Infinity;
            else radius *= radius;

            for (i = 0; i < n; ++i) {
                node = data[i];
                dx = x - node.x;
                dy = y - node.y;
                d2 = dx * dx + dy * dy;
                if (d2 < radius) closest = node, radius = d2;
            }

            return closest;

        }

    }

    function layout_elements (meshes) {

        if (element_label_group) {

            let g = element_label_group.selectAll('g')
                .data(meshes)
                .enter()
                .append('g');

            element_labels = g
                .selectAll('text')
                .data(m => Object.values(m.elements));

            element_labels
                .exit()
                .remove();

            element_labels = element_labels
                .enter()
                .append('text')
                .merge(element_labels)
                .text(d => d.id.split('$').pop());

        }

        position_labels();

    }

    function layout_links (meshes) {

        if (link_group) {

            let g = link_group.selectAll('g')
                .data(meshes)
                .enter()
                .append('g');

            links = g
                .selectAll('path')
                .data(m => m.edges);

            links
                .exit()
                .remove();

            links = links
                .enter()
                .append('path')
                .merge(links);

        }

        position_links();

    }

    function layout_nodes (meshes) {

        if (node_group) {

            let g = node_group.selectAll('g')
                .data(meshes)
                .enter()
                .append('g');

            nodes = g
                .selectAll('circle')
                .data(m => Object.values(m.nodes));

            nodes
                .exit()
                .remove();

            nodes = nodes
                .enter()
                .append('circle')
                .merge(nodes);

            style_nodes(nodes);

        }

        if (node_label_group) {

            let g = node_label_group.selectAll('g')
                .data(meshes)
                .enter()
                .append('g');

            node_labels = g
                .selectAll('text')
                .data(m => Object.values(m.nodes));

            node_labels
                .exit()
                .remove();

            node_labels = node_labels
                .enter()
                .append('text')
                .merge(node_labels)
                .text(d => d.id.split('$').pop());

        }

        position_nodes();
        position_labels();

    }

    function position_labels () {

        if (element_labels) {
            element_labels
                .attr('x', d => centroid_x(Object.values(d.nodes)))
                .attr('y', d => centroid_y(Object.values(d.nodes)));
        }

        if (node_labels) {
            node_labels
                .attr('x', d => d.x)
                .attr('y', d => d.y);
        }
    }

    function position_links () {

        if (links) {
            links
                .attr('d', line()
                    .x(d => d.x)
                    .y(d => d.y)
                );
        }

    }

    function position_nodes () {

        if (nodes) {
            nodes
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('r', 14);
        }

    }

    function style_nodes (selection) {

        selection.each(function (d) {

            let node = select(this);

            if (d.properties) {

                forEachItem(d.properties, (property_id, property) => {

                    if (property_id in styles) {

                        let style = styles[property_id];
                        let atoms = property.atoms;
                        node.style(style.style, style.callback(atoms));

                    }

                });

            }

        });

    }

}