'use babel';

// Atom
import { Emitter } from 'atom';

export default function editor_manager () {

    let editor,
        manager = {},
        panel,
        emitter = new Emitter();

    let atom_subscription = atom.workspace.observeActiveTextEditor(set_active_editor);

    manager.alloy_panel = function (_) {
        if (!arguments.length) return panel;
        panel = _;
        return manager;
    };

    manager.dispose = function () {

        atom_subscription.dispose();

    };

    manager.on_active_editor_change = function (callback) {

        return emitter.on('change', callback);

    };

    manager.set_commands = function (file, commands) {

    };

    manager.set_result = function (file, index, result) {

    };

    return manager;

    function set_active_editor (active_editor) {

        if (active_editor) {

            let path = active_editor.getPath();

            if (path.split('.').pop() === 'als') {

                editor = active_editor;

                emitter.emit('change', path);
                atom.workspace.open('atom://alloy');

            }

        } else {

            emitter.emit('change', null);
            atom.workspace.hide('atom://alloy');

        }

    }

}