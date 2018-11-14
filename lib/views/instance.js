'use babel';

import header_component from './components/header';
import mesh_component from './components/mesh';
import properties_component from './components/properties';

import { extract_meshes, extract_properties } from "../instance/alloy-mesh-util";
import view_meshes from './view-meshes';
import default_styles from '../styles/mesh-styles';

import { select } from 'd3-selection';

export default function instance_view (selection) {

    let div,
        header,
        display_div,
        ready_div,
        unsat_div,
        mesh_svg,
        visible = false;

    let cli,
        subscriptions = [];

    function view (selection) {

        if (!div) {

            // Add a div to the parent
            div = selection.append('div')
                .attr('class', 'panel-item panel-item-display')
                .style('display', visible ? null : 'none');

            // Add the header
            header = header_component()
                .title('Solution')
                .icon('icon-unfold', 'Toggle Expanded View', on_expand_toggle)
                .icon('icon-arrow-right', 'Next Solution', on_next_solution);

            div.append('div')
                .call(header);

            // Add the unsatisfiable solution div
            unsat_div = div.append('div')
                .attr('class', 'message-lg')
                .text('Unsatisfiable');

            // Add the drawing pane
            display_div = div.append('div')
                .attr('class', 'panel-item');

            mesh_svg = display_div.append('svg');

            // Add the ready div
            ready_div = div.append('div')
                .attr('class', 'message-lg')
                .text('Run a command');

            show_ready();

        }

        return view;

    }

    view.cli = function (cli) {
        unsubscribe();
        subscribe(cli);
        return view;
    };

    view.hide = function () {

        visible = false;
        if (div) div.style('display', 'none');
        return view;

    };

    view.show = function () {

        visible = true;
        if (div) div.style('display', null);
        return view;

    };

    return view(selection);


    function disable () {
        if (header) header.disable();
    }

    function enable () {
        if (header) header.enable();
    }

    function on_expand_toggle () {

        console.log('SHOW EXPANDED VIEW');
        atom.workspace.open('atom://alloy-mesh-vis-display')
            .then(editor => {
                console.log(editor);
                // select(editor.element).selectAll('*').remove();
                // console.log(editor.element);
            });

    }

    function on_next_solution () {
        if (cli) cli.next();
    }

    function on_solution (solution) {

        // Set the header to show the command text
        header.title(solution.result.command());

        if (solution.result.type() === 'unsatisfiable') {

            // Unsatisfiable, so show unsat view
            show_unsat();

        } else {

            // Attempt to extract and show meshes
            let instance = solution.result;
            let { mesh_sig, elem_sig, node_sig, meshes} = extract_meshes(instance);

            if (meshes.length) {

                show_display();

                let orderings = instance.orderings();
                let properties = extract_properties(meshes, instance);
                let styles = default_styles(node_sig, elem_sig);

                let mesh_view = view_meshes(meshes);

                styles.forEach(styler => {
                    mesh_view.style(styler);
                });

                mesh_svg.selectAll('*').remove();
                mesh_view(mesh_svg);

            } else {

                show_ready();

            }

        }

    }

    function show_display () {
        if (display_div) display_div.style('display', null);
        if (ready_div) ready_div.style('display', 'none');
        if (unsat_div) unsat_div.style('display', 'none');
    }

    function show_ready () {
        if (display_div) display_div.style('display', 'none');
        if (ready_div) ready_div.style('display', null);
        if (unsat_div) unsat_div.style('display', 'none');
    }

    function show_unsat () {
        if (display_div) display_div.style('display', 'none');
        if (ready_div) ready_div.style('display', 'none');
        if (unsat_div) unsat_div.style('display', null);
    }

    function subscribe (c) {

        cli = c;
        subscriptions.push(c.on_result(on_solution));
        subscriptions.push(c.on_busy(disable));
        subscriptions.push(c.on_ready(enable));

    }

    function unsubscribe () {

        subscriptions.forEach(s => s.dispose());

    }

}