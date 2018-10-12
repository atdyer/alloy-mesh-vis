'use babel';

export default function alloy_editor (editor) {

    let e = {};

    let commands = [],
        invalidated = false;

    e.commands = function () {
        return commands;
    };

    e.invalidated = function () {
        return invalidated;
    };

    e.path = function () {
        return editor.getPath();
    };

    return e;

}