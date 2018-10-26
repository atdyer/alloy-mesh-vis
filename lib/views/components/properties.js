'use babel';

import { schemePaired } from 'd3-scale-chromatic';
import { select } from 'd3-selection';

export default function properties_component () {

    let nodal_options = [
        {
            id: 'Color',
            style: 'fill',
            options: schemePaired
        },
        {
            id: 'Border Thickness',
            style: 'stroke-width',
            options: []
        },
        {
            id: 'Border Color',
            style: 'stroke',
            options: schemePaired
        }
    ];

    let elemental_options = [];


    function layout_properties (selection) {

        let header = selection
            .append('div')
            .attr('class', 'property-header');

        let list = selection
            .append('div')
            .attr('class', 'property-list')
            .style('display', 'none');

        header
            .append('div')
            .attr('class', 'property-name')
            .text(d => d.property);

        header
            .append('div')
            .attr('class', 'signature')
            .text(d => d.signature);

        header
            .append('div')
            .attr('class', 'icon icon-button icon-plus')
            .on('click', show_property_list);

        function show_property_list (datum) {

            select(this)
                .classed('icon-plus', false)
                .classed('icon-x', true)
                .on('click', hide_property_list);

            list.filter(d => d === datum)
                .style('display', null)
                .call(list_options);

        }

        function hide_property_list (datum) {

            select(this)
                .classed('icon-x', false)
                .classed('icon-plus', true)
                .on('click', show_property_list);

            list.filter(d => d === datum)
                .style('display', 'none');

        }

        function list_options (selection) {

            let header = selection.selectAll('div.list-header')
                .data(d => [d]);

            header
                .exit()
                .remove();

            header = header
                .enter()
                .append('div')
                .attr('class', 'list-header')
                .merge(header);

            header
                .text('Choose a property');

            let list = selection.selectAll('div.list-item')
                .data(d => d.options);

            list
                .exit()
                .remove();

            list = list
                .enter()
                .append('div')
                .attr('class', 'list-item')
                .merge(list);

            list.text(d => d.id);

        }

    }

    return function (div, solution) {

        let tree = extract_data_tree(solution);
        console.log(tree);

        div.classed('properties-view', true);

        let selection = div.selectAll('div.section')
            .data(tree, d => d.id);

        selection
            .exit()
            .remove();

        selection = selection
            .enter()
            .append('div')
            .attr('class', 'section')
            .merge(selection);

        let header = selection.selectAll('div.section-header')
            .data(d => [d.id], d => d.id);

        header
            .exit()
            .remove();

        header = header
            .enter()
            .append('div')
            .attr('class', 'section-header')
            .merge(header);

        header
            .text(d => d);

        let subsections = selection.selectAll('div.section')
            .data(d => d.properties || []);

        subsections
            .exit()
            .remove();

        subsections = subsections
            .enter()
            .append('div')
            .attr('class', 'section')
            .merge(subsections);

        let sub_header = subsections.selectAll('div.subsection-header')
            .data(d => [d.id]);

        sub_header
            .exit()
            .remove();

        sub_header = sub_header
            .enter()
            .append('div')
            .attr('class', 'subsection-header')
            .merge(sub_header);

        sub_header
            .text(d => d);

        let properties = subsections.selectAll('div.property')
            .data(d => d.properties || []);

        properties
            .exit()
            .remove();

        properties = properties
            .enter()
            .append('div')
            .attr('class', 'property')
            .merge(properties);

        layout_properties(properties);

    };

    function extract_elemental_properties (solution) {

        let static_properties = new Set();
        let dynamic_properties = new Set();

        forEachItem(solution.meshes(), (mesh_id, mesh) => {

            forEachItem(mesh.elements, (node_id, node) => {

                forEachItem(node.properties, (property_id, property) => {

                    if (property.type === 'static')
                        static_properties.add(property_id);
                    if (property.type === 'dynamic')
                        dynamic_properties.add(property_id);

                });

            });

        });

        function parse_property (p) {
            let dat = p.split('<:');
            if (dat.length === 2) {
                return {
                    signature: dat[0],
                    property: dat[1],
                    options: elemental_options
                };
            }
        }

        static_properties = {
            id: 'Static',
            properties: Array.from(static_properties).map(parse_property).filter(p => !!p)
        };
        dynamic_properties = {
            id: 'Dynamic',
            properties: Array.from(dynamic_properties).map(parse_property).filter(p => !!p)
        };

        return [static_properties, dynamic_properties];

    }

    function extract_nodal_properties (solution) {

        let static_properties = new Set();
        let dynamic_properties = new Set();

        forEachItem(solution.meshes(), (mesh_id, mesh) => {

            forEachItem(mesh.nodes, (node_id, node) => {

                forEachItem(node.properties, (property_id, property) => {

                    if (property.type === 'static')
                        static_properties.add(property_id);
                    if (property.type === 'dynamic')
                        dynamic_properties.add(property_id);

                });

            });

        });

        function parse_property (p) {
            let dat = p.split('<:');
            if (dat.length === 2) {
                return {
                    signature: dat[0],
                    property: dat[1],
                    options: nodal_options
                };
            }
        }

        static_properties = {
            id: 'Static',
            properties: Array.from(static_properties).map(parse_property).filter(p => !!p)
        };
        dynamic_properties = {
            id: 'Dynamic',
            properties: Array.from(dynamic_properties).map(parse_property).filter(p => !!p)
        };

        return [static_properties, dynamic_properties];

    }

    function extract_data_tree (solution) {

        return [
            {
                id: 'Node Properties',
                properties: extract_nodal_properties(solution)
            },
            {
                id: 'Element Properties',
                properties: extract_elemental_properties(solution)
            }
        ];

    }

    function forEachItem (obj, callback) {
        for (const k in obj) {
            if (obj.hasOwnProperty(k)) {
                callback(k, obj[k]);
            }
        }
    }

}