'use babel';

import alloy from './alloy';
import alloy_config from './alloy-config';

import { CompositeDisposable } from 'atom';

export default {

    alloy_mesh_vis: null,
    config: alloy_config,
    subscriptions: null,

    initialize: function () {

        // Create instance
        this.alloy_mesh_vis = alloy();

        // Connect to Atom
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(atom.workspace.observeActiveTextEditor(this.alloy_mesh_vis.editor));
        this.subscriptions.add(atom.config.observe('alloy-mesh-vis.jar', this.alloy_mesh_vis.jar));

    },

    deactivate: function () {

        this.subscriptions.dispose();

        if (this.alloy_mesh_vis) {

            this.alloy_mesh_vis.dispose();

        }

    }

};