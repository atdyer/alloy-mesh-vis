'use babel';

export default function alloy_editor (editor) {

    let e = {};

    let commands = [],
        invalidated = false;

    e.commands = function () {
        // return commands;

        // Return some dummy commands for testing
        return [
            'Run show for 3',
            'Check refines for 2',
            'Run thisReallyLongCommandName for 10 expect 5',
            'Command',
            'Command',
            'Command',
            'Command',
            'Command'
        ];

    };

    e.invalidated = function () {
        return invalidated;
    };

    e.path = function () {
        return editor.getPath();
    };

    return e;

}