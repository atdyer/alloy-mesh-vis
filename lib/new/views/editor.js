'use babel';

import header_component from './components/header';

export default function editor_view (selection) {

    let div,
        commands,
        editor,
        header,
        visible = false;

    function view (selection) {

        if (!div) {

            // Add a div to the parent
            div = selection.append('div')
                .style('display', visible ? null : 'none');

            // Add the header
            header = div.append('div')
                .call(header_component()
                    .title('Alloy Commands')
                    .icon('icon-sync', 'Update Commands', on_request_update));

            // Add the commands box
            commands = div.append('div')
                .attr('class', 'commands');

            // If we've already got an editor, display it
            if (editor) {
                list_commands(commands, editor);
            }

        }

        return view;

    }

    view.disable = function () {

    };

    view.editor = function (_) {
        if (!arguments.length) return editor;
        editor = _;
        if (commands) list_commands(commands, editor);
        return view;
    };

    view.enable = function () {

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


    function list_commands (s, e) {

        let selection = s.selectAll('div.command')
            .data(e.commands());

        selection
            .exit()
            .remove();

        selection = selection
            .enter()
            .append('div')
            .attr('class', 'command')
            .merge(selection);

        selection
            .text(c => c);

    }

    function on_request_update () {
        console.log('update');
    }

}