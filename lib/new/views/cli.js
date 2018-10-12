'use babel';

import header_component from './components/header';

export default function cli_view (selection) {

    let div,
        header,
        messages,
        visible = false;

    function view (selection) {

        if (!div) {

            // Add a div to the parent
            div = selection.append('div')
                .style('display', visible ? null : 'none');

            // Add the header
            header = div.append('div')
                .call(header_component()
                    .title('Alloy Status'));

            // Add the messages box
            messages = div.append('div')
                .attr('class', 'cli');

        }

        return view;

    }

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


    function scroll_down () {

        if (messages) {

            let height = messages.property('scrollHeight');
            messages.property('scrollTop', height);

        }

    }

}