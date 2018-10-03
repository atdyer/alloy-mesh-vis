'use babel';

// Alloy
import editor from './editor';

// Atom
import { Emitter } from 'atom';

export default function editor_manager () {

    let alloy,
        active_editor,
        emitter = new Emitter();

    let atom_subscription = atom.workspace.observeActiveTextEditor(on_active_editor_change);

    let manager = {

        alloy: function (_) {

            if (!arguments.length) return alloy;

            _.on_java_running(function () {

                alloy = _;
                if (active_editor) active_editor.alloy(alloy);

            });

        },

        dispose: function () {

            atom_subscription.dispose();
            if (active_editor) active_editor.dispose();

        }

    };

    return manager;

    function on_active_editor_change (edit) {

        if (edit) {

            let path = edit.getPath();

            // Check the file extension
            if (path.split('.').pop() === 'als') {

                if (active_editor) active_editor.dispose();
                active_editor = editor().editor(edit);
                if (alloy) editor.alloy(alloy);

            } else {

                emitter.emit('change', null);

            }

        } else {

            emitter.emit('change', null);

        }

    }

}