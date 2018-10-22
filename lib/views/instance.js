'use babel';

import header_component from './components/header';
import mesh_component from './components/mesh';

export default function instance_view (selection) {

    let div,
        header,
        display_div,
        ready_div,
        unsat_div,
        mesh_view,
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
            mesh_view = mesh_component();

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

    function display_mesh_solution (solution) {

        if (mesh_svg && mesh_view) {

            mesh_view(mesh_svg, solution);

        }

    }

    function on_next_solution () {
        if (cli) cli.next();
    }

    function on_solution (solution) {

        solution = solution.result;

        console.log(solution);

        let command = solution.command,
            type = solution.type;

        header.title(command);

        if (type === 'unsatisfiable') {

            show_unsat();

        }

        else if (type === 'instance') {

            if (solution.has_mesh()) {

                show_display();
                display_mesh_solution(solution);

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