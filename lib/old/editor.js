'use babel';

// Alloy
import alloy_command from './alloy-command';

// Atom
import { CompositeDisposable, Emitter } from 'atom';

export default function editor () {

    let alloy,
        atom_editor,
        editor_subscriptions = new CompositeDisposable(),
        emitter = new Emitter();

    let is_compiled = false,
        is_compiling = false,
        is_compile_invalidated = true;

    let commands = [],
        comp_mod,
        pending,
        running;

    let editor = {

        alloy: function (_) {

            if (!arguments.length) return alloy;
            _.on_java_running(function () {
                alloy = _;
                editor.parse();
            });
            return editor;

        },

        commands: function (_) {

            if (!arguments.length) return commands;
            commands = _.map(c => alloy_command().command(c));
            return editor;

        },

        dispose: function () {

            editor_subscriptions.dispose();
            commands.forEach(c => c.dispose());

        },

        editor: function (_) {

            if (!arguments.length) return atom_editor;
            atom_editor = _;

            editor_subscriptions.dispose();
            editor_subscriptions.add(
                atom_editor.onDidStopChanging(on_did_stop_changing),
                atom_editor.onDidDestroy(editor.dispose)
            );
            return editor;

        },

        parse: function () {

            if (atom_editor && alloy) {
                alloy.parse(atom_editor.getText(), on_parse);
            }
            return editor;

        },

        path: function () {

            if (atom_editor) return atom_editor.getPath();

        },

        run: function (command) {

            emitter.emit('running', true);
            if (is_compiled) {
                run_command(command);
            } else {
                pending = command;
                compile();
            }

        }

    };

    return editor;

    function compile () {

        if (alloy) {

            if (!is_compile_invalidated && (is_compiling || is_compiled)) return;

            is_compile_invalidated = false;
            is_compiling = true;
            is_compiled = false;

            commands.forEach(c => c.solution(null));

            atom_editor.save().then(function () {
                alloy.compile(editor.path(), on_compiled, on_compile_error);
            });

        }

    }

    function on_compiled (err, mod) {

        is_compiling = false;

        if (err) return on_compile_error(err);

        if (!is_compile_invalidated) {

            // Keep the compiled module for running commands
            comp_mod = mod;
            is_compiled = true;
            emitter.emit('compile', true);

            // Check for a pending run
            if (pending) run_command(pending);
            pending = null;

        }

    }

    function on_compile_error (err) {
        console.log('error compiling alloy file');
        console.log(err);
    }

    function on_did_stop_changing (text_change_event) {

        if (text_change_event) {

            function contains_text (e) {
                let old_contains = e.oldText.trim().length !== 0,
                    new_contains = e.newText.trim().length !== 0;
                return old_contains || new_contains;
            }

            let text_change = text_change_event.changes.find(contains_text);

            if (text_change) {
                editor.parse();
            }

        }

    }

    function on_parse (err, res) {

        if (err) {

            console.error(err);

        } else {

            editor.commands(res.getAllCommandsSync().toArraySync());

            // Automatically run first command for testing purposes
            // let cmd = editor.commands()[0];
            // console.log(cmd.command().scope.toArraySync());
            // editor.run(cmd);

        }

    }

    function on_run (command, err, res) {

        emitter.emit('running', false);
        running = null;

        if (err) {
            console.log(err);
        } else {
            command.solution(res);
            console.log(res);
        }

    }

    function run_command (command) {

        running = command;

        if (alloy && is_compiled && comp_mod) {

            let sigs = comp_mod.getAllReachableSigsSync();
            alloy.execute(sigs, command, on_run);

        }

    }

}