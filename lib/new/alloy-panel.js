'use babel';

// Libraries
import * as d3 from 'd3-selection';

// Alloy
import jar_required_view from './views/jar_required';
import cli_view from "./views/cli";
import editor_view from "./views/editor";
import instance_view from "./views/instance";


export default function alloy_panel () {

    let element,
        div;

    let title = 'Alloy',
        allowed_locations = ['left', 'right'],
        default_location = 'right',
        uri = 'atom://alloy';

    let views,
        view_cli,
        view_editor,
        view_instance,
        view_jar_required;

    let panel = {};

    panel.cli = function (cli) {

        // Respond to events from the CLI
        cli.on_busy(on_cli_busy);
        cli.on_error(on_cli_error);
        // cli.on_list();
        cli.on_ready(on_cli_ready);
        // cli.on_result();

    };

    panel.editor = function (editor) {

    };

    panel.element = function (_) {
        if (!arguments.length) return element;
        create_panel(_);
        return panel;
    };


    panel.getAllowedLocations = function () {
        return allowed_locations;
    };

    panel.getDefaultLocation = function () {
        return default_location;
    };

    panel.getElement = function () {
        return element;
    };

    panel.getTitle = function () {
        return title;
    };

    panel.getURI = function () {
        return uri;
    };


    return panel;


    function create_panel (e) {

        // Create the top level node
        element = e;
        div = d3.select(element)
            .classed('alloy', true);

        // Create various views (note order)
        view_cli = cli_view(div);
        view_editor = editor_view(div);
        view_instance = instance_view(div);
        view_jar_required = jar_required_view(div);
        views = [
            view_cli,
            view_editor,
            view_instance,
            view_jar_required
        ];

        // Register an opener for the URI
        atom.workspace.addOpener(opener);

        // Begin on the jar required view
        show_jar_required();

    }

    function on_cli_busy () {

        // Show the main view
        show_main_view();

        // Disable button clicking in the editor view
        if (view_editor) view_editor.disable();

        // Print message to CLI
        if (view_cli) view_cli.message('Busy');

    }

    function on_cli_error () {

        // Print error to CLI
        if (view_cli) view_cli.error('Error');

    }

    function on_cli_ready () {

        // Show the main view
        show_main_view();

        // Enable button clicking in editor view
        if (view_editor) view_editor.enable();

        // Print message to CLI
        if (view_cli) view_cli.message('Ready');

    }

    function opener (target_uri) {
        if (target_uri === uri) return panel;
    }

    function show_jar_required () {
        show_only(view_jar_required);
    }

    function show_main_view () {
        if (view_cli) view_cli.show();
        if (view_editor) view_editor.show();
        if (view_instance) view_instance.show();
        if (view_jar_required) view_jar_required.hide();
    }

    function show_only (view) {
        if (view) {
            views.forEach(v => {
                if (v) v === view ? v.show() : v.hide()
            });
        }
    }

}