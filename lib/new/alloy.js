'use babel';

import alloy_cli from './alloy-cli';
import alloy_editor from './alloy-editor';
import alloy_panel from './alloy-panel';

export default function alloy () {

    let cli = alloy_cli(),
        editors = {},
        panel = alloy_panel();

    let a = {};

    a.editor = function (editor) {
        set_active_editor(editor);
    };

    a.jar = function (jar) {
        return cli.jar(jar);
    };


    initialize();
    return a;


    function hide_alloy_panel () {
        atom.workspace.hide('atom://alloy');
    }

    function initialize () {

        // Create the div element for the Alloy panel
        panel.element(document.createElement('div'));

        // Connect the CLI to the panel
        panel.cli(cli);

        // Respond to events from the panel
        panel.on_request_update(cli.list);
        panel.on_run_command(cli.execute);

        // Respond to events from the CLI
        cli.on_list(on_command_list);

    }

    function on_command_list (event) {

        // Find the appropriate editor
        let editor = editors[event.model];

        if (editor) {

            // Send list to editor
            editor.commands(event.commands);

        }

    }

    function set_active_editor (editor) {

        let path = editor.getPath();

        // Check that the editor is viewing an Alloy file
        if (path.split('.').pop() === 'als') {

            // Determine if we've already got an instance of this editor
            let active = editors[path];

            if (!active) {
                active = alloy_editor(editor);
                editors[path] = active;
            }

            // Update the Alloy panel to show the active editor
            panel.editor(active);
            show_alloy_panel();

            // Update the CLI to use the current file
            cli.model(path);
            cli.list();

        } else {

            // Not an Alloy file, so hide the Alloy panel
            hide_alloy_panel();

        }

    }

    function show_alloy_panel () {
        atom.workspace.open('atom://alloy');
    }

}