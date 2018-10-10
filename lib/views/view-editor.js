'use babel';

// Libraries
import * as d3 from 'd3-selection';

// Components
import view_header from './components/view-header';


export default function view_editor (selection) {

    let _div = null,
        _header = null,
        _commands = null;

    let _editor = null,
        _on_commands_changed = null,
        _on_compile_changed = null;

    function _view_editor (selection) {

        // Add a div to the parent
        _div = selection.append('div')
            .style('display', 'none');

        // Add the header
        _header = _div.append('div')
            .call(view_header()
                .title('Alloy Commands')
                .icon('icon-pulse', _run_all));

        // Add the commands container
        _commands = _div.append('div')
            .attr('class', 'item-list');


        return _view_editor;

    }

    _view_editor.editor = function (editor) {

        if (!arguments.length) return _editor;
        _editor = editor;
        if (_editor) {

            if (_on_commands_changed) _on_commands_changed.dispose();
            if (_on_compile_changed) _on_compile_changed.dispose();
            _on_commands_changed = _editor.on_commands_changed(_update_commands);
            _on_compile_changed = _editor.on_compile_changed(_update_compiled);
            _update_commands(editor.commands());
            _update_compiled(editor.compiled());

        } else {

        }

    };

    _view_editor.hide = function () {

        if (_div) _div.style('display', 'none');
        return _view_editor;

    };

    _view_editor.show = function () {

        if (_div) _div.style('display', null);
        return _view_editor;

    };

    function _run_all () {

        if (_editor) _editor.run_all();

    }

    function _update_commands (commands) {

        if (_commands) {

            let _selection = _commands
                .selectAll('div.item')
                .data(commands, function (command) {
                    return command.key();
                });

            _selection.exit()
                .remove();

            _selection.enter()
                .append('div')
                .merge(_selection)
                .each(function (command) {
                    command(d3.select(this));
                });

        }

    }

    function _update_compiled (is_compiled) {

        if (_commands) {
            _commands
                .classed('compiled', is_compiled)
                .classed('invalidated', !is_compiled);
        }


    }

    return _view_editor(selection);

}