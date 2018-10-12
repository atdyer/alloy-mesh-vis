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

        } else {

            // Not an Alloy file, so hide the Alloy panel
            hide_alloy_panel();

        }

    }

    function show_alloy_panel () {
        atom.workspace.open('atom://alloy');
    }

}