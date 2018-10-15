'use babel';

import header_component from './components/header';

export default function instance_view (selection) {

    let div,
        header,
        display,
        visible = false;

    let subscriptions = [];

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

            // Add the drawing pane
            display = div.append('div')
                .attr('class', 'display');

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


    function on_next_solution () {
        console.log('next');
    }

    function on_result (result) {

        console.log(result);

        let command = result.result.command;

        header.title(command);

    }

    function subscribe (cli) {

        subscriptions.push(cli.on_result(on_result));

    }

    function unsubscribe () {

        subscriptions.forEach(s => s.dispose());

    }

}