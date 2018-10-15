'use babel';

import header_component from './components/header';

export default function editor_view (selection) {

    let div,
        commands,
        editor,
        header,
        visible = false;

    let command_callback,
        update_callback;

    function view (selection) {

        if (!div) {

            // Add a div to the parent
            div = selection.append('div')
                .style('display', visible ? null : 'none');

            // Add the header
            header = header_component()
                .title('Alloy Commands')
                .icon('icon-sync', 'Update Commands', on_request_update);

            div.append('div')
                .call(header);

            // Add the commands box
            commands = div.append('div')
                .attr('class', 'commands');

            // If we've already got an editor, display it
            if (editor) list_commands(editor);

        }

        return view;

    }

    view.disable = function () {

    };

    view.editor = function (_) {
        if (!arguments.length) return editor;
        set_editor(_);
        return view;
    };

    view.enable = function () {

    };

    view.hide = function () {

        visible = false;
        if (div) div.style('display', 'none');
        return view;

    };

    view.on_request_update = function (cb) {
        if (!arguments.length) return update_callback;
        update_callback = cb;
        return view;
    };

    view.on_run_command = function (cb) {
        if (!arguments.length) return command_callback;
        command_callback = cb;
        return view;
    };

    view.show = function () {

        visible = true;
        if (div) div.style('display', null);
        return view;

    };


    return view(selection);


    function list_commands (e) {

        if (commands) {

            // Update the header text
            header.title('Commands: ' + e.file());

            // Update the commands list
            let selection = commands.selectAll('div.command')
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
                .on('click', on_run_command)
                .text(c => c.command);

        }

    }

    function on_request_update () {
        if (update_callback) update_callback();
    }

    function on_run_command (command) {
        if (command_callback) command_callback(command);
    }

    function set_editor (e) {

        // Disconnect any previous editor
        if (editor) {

            // Disable update callback
            editor.on_command_list_updated(null);

        }

        // Keep track of this editor
        editor = e;

        // Subscribe to updates
        editor.on_command_list_updated(list_commands);

        // Update the command list
        list_commands(editor);
    }

}