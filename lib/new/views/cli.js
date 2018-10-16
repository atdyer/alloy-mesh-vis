'use babel';

import header_component from './components/header';

export default function cli_view (selection) {

    let div,
        header,
        messages,
        visible = false;

    let subscriptions = [];

    function view (selection) {

        if (!div) {

            // Add a div to the parent
            div = selection.append('div')
                .attr('class', 'panel-item panel-item-cli')
                .style('display', visible ? null : 'none');

            // Add the header
            header = div.append('div')
                .call(header_component()
                    .title('Status'));

            // Add the messages box
            messages = div.append('div')
                .attr('class', 'cli');

        }

        return view;

    }

    view.cli = function (cli) {
        unsubscribe();
        subscribe(cli);
        return view;
    };

    view.error = function (message) {

        if (messages) {

            let m = messages.append('div')
                .attr('class', 'message');

            m.append('div')
                .attr('class', 'prefix')
                .text('>>');

            m.append('div')
                .attr('class', 'error')
                .text(message);

            scroll_down();

        }

    };

    view.hide = function () {

        visible = false;
        if (div) div.style('display', 'none');
        return view;

    };

    view.message = function (message) {

        if (messages) {

            let m = messages.append('div')
                .attr('class', 'message');

            m.append('div')
                .attr('class', 'prefix')
                .text('>>');

            m.append('div')
                .attr('class', 'info')
                .text(message);

            scroll_down();

        }

    };

    view.show = function () {

        visible = true;
        if (div) div.style('display', null);
        scroll_down();
        return view;

    };


    return view(selection);


    function file (model) {
        return model.split('/').pop();
    }

    function on_busy (event) {

        if (event.model) {
            let h = file(event.model) + ': ';
            view.message(h + event.description);
        } else {
            view.message(event.description);
        }

    }

    function on_error (event) {

        let h = file(event.model) + ': ';
        view.error(h + event.error);

    }

    function on_list (event) {

        let h = file(event.model) + ': ';
        let l = event.commands.length || 0;
        view.message(h + 'Retrieved ' + l + ' commands');

    }

    function on_model (event) {

        view.message('Model set: ' + file(event.model));

    }

    function on_ready (event) {

        let h = event.model ? file(event.model) + ': ' : '';
        view.message(h + 'Ready');

    }

    function on_result (event) {

    }

    function scroll_down () {

        if (messages) {

            let height = messages.property('scrollHeight');
            messages.property('scrollTop', height);

        }

    }

    function subscribe (cli) {

        subscriptions.push(cli.on_busy(on_busy));
        subscriptions.push(cli.on_error(on_error));
        subscriptions.push(cli.on_list(on_list));
        subscriptions.push(cli.on_model(on_model));
        subscriptions.push(cli.on_ready(on_ready));
        subscriptions.push(cli.on_result(on_result));

    }

    function unsubscribe () {

        subscriptions.forEach(s => s.dispose());

    }

}