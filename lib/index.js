'use babel';

import alloy_cli from './alloy-cli';
import alloy_panel from './views/alloy-panel';
import editor_manager from './editor-manager';

export default {

    cli: null,
    manager: null,
    panel: null,

    initialize: function () {

        // Initialize the command-line interface
        this.cli = alloy_cli();
        this.cli.on_ready(); // PICK UP HERE

        // Initialize the alloy panel
        this.panel = alloy_panel()
            .element(document.createElement('div'));

        // Watch for editors that open alloy files
        this.manager = editor_manager();
        this.manager.on_active_editor_change(this.panel.editor);

        // this.cli.on_list_commands(console.log);
        // this.cli.on_model_set(console.log);
        // this.cli.on_result(console.log);
        // this.cli.set_model('/home/tristan/Desktop/test.als');
        // this.cli.list_commands();
        // this.cli.execute_command(0);
        // this.cli.next_solution();
        // this.cli.display_last();

        atom.workspace.open('atom://alloy');

    },

    deactivate: function () {

        if (this.cli) {
            this.cli.quit();
        }

    }

}
