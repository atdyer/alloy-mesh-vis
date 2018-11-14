'use babel';

import alloy from './alloy';
import alloy_config from './alloy-config';

import { CompositeDisposable } from 'atom';

export default {

    alloy_mesh_vis: null,
    config: alloy_config,
    subscriptions: null,

    initialize: function () {

        atom.views.addViewProvider(Test, createTestView);

        // Create instance
        this.alloy_mesh_vis = alloy();

        // Connect to Atom
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(atom.workspace.observeActiveTextEditor(this.alloy_mesh_vis.editor));
        this.subscriptions.add(atom.config.observe('alloy-mesh-vis.jar', this.alloy_mesh_vis.jar));
        this.subscriptions.add(atom.workspace.addOpener(uri => {
            if (uri === 'atom://alloy-mesh-vis-display') {
                console.log("HEYOOOOO");
                let t = new Test();
                console.log(t);
                return t;
            }
        }));
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'alloy-mesh-vis-display:toggle': () => this.show_panel()
        }));

    },

    deactivate: function () {

        this.subscriptions.dispose();

        if (this.alloy_mesh_vis) {

            this.alloy_mesh_vis.dispose();

        }

    },

    show_panel: function () {
        console.log('SHOWING PANEL');
    }

};

class Test {

    constructor () {

    }

    getTitle () {
        return 'Test';
    }

}

function createTestView (model) {

    let view = document.createElement('div');
    view.model = model;
    return view;

}