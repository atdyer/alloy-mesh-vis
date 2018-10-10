'use babel';

// Atom
import { Emitter } from 'atom';

export default function editor_manager () {

    let editor;

    let atom_subscription = atom.workspace.observeActiveTextEditor(set_active_editor),
        emitter = new Emitter();

    return {

        dispose: function () {

            atom_subscription.dispose();

        },

        on_active_editor_change: function (callback) {

            return emitter.on('change', callback);

        }

    };

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