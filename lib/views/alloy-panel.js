'use babel';

// Libraries
import * as d3 from 'd3-selection';

// Views
import view_jar_required from './view-jar-required';
// import view_java_loading from './view-java-loading';
// import view_editor from './view-editor';

// Atom
import { CompositeDisposable } from 'atom';


export default function alloy_panel () {

    let _element = null,
        _div = null;

    let _title = 'Alloy',
        _allowed_locations = ['left', 'right'],
        _default_location = 'right',
        _uri = 'atom://alloy';

    let _views = null,
        _view_editor = null,
        _view_jar_required = null,
        _view_java_loading = null,
        _view_warning = null,
        _view_error = null;

    let _subscriptions = new CompositeDisposable();

    let _alloy_panel = {};

    _alloy_panel.dispose = function () {

        _subscriptions.dispose();

    };

    _alloy_panel.editor = function (editor) {

        if (_view_editor) _view_editor.editor(editor);

    };

    _alloy_panel.element = function (element) {
        if (!arguments.length) return _element;
        return _create_alloy_panel(element);
    };

    _alloy_panel.set_busy = function () {

        // Disallow button clicking
        console.log('busy');

    };

    _alloy_panel.set_error = function () {

        // Display the error
        console.log('error');

    };

    _alloy_panel.set_ready = function () {

        // Allow button clicking
        console.log('ready');

    };

    _alloy_panel.show_editor = function () {
        _show_only(_view_editor);
        return _alloy_panel;
    };

    _alloy_panel.show_jar_required = function () {
        _show_only(_view_jar_required);
        return _alloy_panel;
    };


    // Functions required by the Atom API
    _alloy_panel.getAllowedLocations = function () {
        return _allowed_locations;
    };

    _alloy_panel.getDefaultLocation = function () {
        return _default_location;
    };

    _alloy_panel.getElement = function () {
        return _element;
    };

    _alloy_panel.getTitle = function () {
        return _title;
    };

    _alloy_panel.getURI = function () {
        return _uri;
    };

    function _create_alloy_panel (element) {

        // The top level node
        _element = element;
        _div = d3.select(_element)
            .classed('alloy', true);

        // Create views
        // _view_editor = view_editor(_div);
        _view_jar_required = view_jar_required(_div);
        // _view_java_loading = view_java_loading(_div);
        // _view_warning = view_warning(_div);
        // _view_error = view_error(_div);
        _views = [
            _view_editor,
            _view_jar_required,
            _view_java_loading,
            _view_warning,
            _view_error
        ];

        // Subscriptions
        _subscriptions.add(atom.workspace.addOpener(_opener));

        // Start on the jar required view
        _alloy_panel.show_jar_required();


        return _alloy_panel;

    }

    function _opener (uri) {
        if (uri === _uri) {
            return _alloy_panel;
        }
    }

    function _show_only (view) {
        if (view) {
            _views.forEach(function (v) {
                if (v)
                    v === view ? v.show() : v.hide();
            });
        }
    }

    return _alloy_panel;

}