'use babel';

import header_component from './components/header';

export default function editor_view (selection) {

    let div,
        commands,
        editor,
        header,
        enabled = false,
        visible = false;

    let command_callback,
        update_callback;

    let subscriptions = [];

    function view (selection) {

        if (!div) {

            // Add a div to the parent
            div = selection.append('div')
                .attr('class', 'panel-item panel-item-commands')
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

    view.cli = function (cli) {
        unsubscribe();
        subscribe(cli);
        return view;
    };

    view.editor = function (_) {
        if (!arguments.length) return editor;
        set_editor(_);
        return view;
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


    function disable () {

        enabled = false;

        if (commands) {

            commands
                .selectAll('.command')
                .classed('active', enabled)
                .on('click', null);

        }

        if (header) {

            header.disable();

        }

    }

    function enable () {

        enabled = true;

        if (commands) {

            commands
                .selectAll('.command')
                .classed('active', enabled)
                .on('click', on_run_command);

        }

        if (header) {

            header.enable();

        }

    }

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
                .text(c => c.command);

            if (enabled) enable();

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

    function subscribe (cli) {

        subscriptions.push(cli.on_busy(disable));
        subscriptions.push(cli.on_ready(enable));

    }

    function unsubscribe () {

        subscriptions.forEach(s => s.dispose());

    }

}