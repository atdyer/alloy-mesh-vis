'use babel';

// Libraries
import { select } from 'd3-selection';

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

        cli.on_ready(show_main_view);
        if (view_cli) view_cli.cli(cli);
        if (view_editor) view_editor.cli(cli);
        if (view_instance) view_instance.cli(cli);

    };

    panel.editor = function (editor) {

        if (view_editor) {
            view_editor.editor(editor);
        }

    };

    panel.element = function (_) {
        if (!arguments.length) return element;
        create_panel(_);
        return panel;
    };

    panel.on_request_update = function (cb) {
        if (view_editor) return view_editor.on_request_update(cb);
    };

    panel.on_run_command = function (cb) {
        if (view_editor) return view_editor.on_run_command(cb);
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
        div = select(element)
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

        // Set up instance expanded view
        view_instance.on_expand(() => show_only(view_instance));
        view_instance.on_collapse(() => show_main_view());

        // Register an opener for the URI
        atom.workspace.addOpener(opener);

        // Begin on the jar required view
        show_jar_required();

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

        // TODO: Remove this
        // view_instance.EXPAND_TMP();
        // show_only([view_editor, view_instance]);
    }

    function show_only (view) {
        if (Array.isArray(view)) {
            views.forEach(v => {
                if (v) view.includes(v) ? v.show() : v.hide();
            });
        }
        else if (view) {
            views.forEach(v => {
                if (v) v === view ? v.show() : v.hide();
            });
        }
    }

}