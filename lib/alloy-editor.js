'use babel';

export default function alloy_editor (editor) {

    let e = {};

    let commands = [],
        invalidated = false;

    let on_command_list;

    e.commands = function (_) {
        if (!arguments.length) return commands;
        commands = _;
        emit_commands();
        return e;
    };

    e.file = function () {
        return editor.getPath().split('/').pop();
    };

    e.invalidated = function () {
        return invalidated;
    };

    e.on_command_list_updated = function (cb) {
        on_command_list = cb;
    };

    e.path = function () {
        return editor.getPath();
    };

    e.save = function () {
        return editor.save();
    };

    return e;

    function emit_commands () {

        if (on_command_list) {

            on_command_list(e);

        }

    }

}