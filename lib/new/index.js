'use babel';

import alloy from './alloy';
import alloy_config from './alloy-config';

export default {

    alloy_mesh_vis: null,
    config: alloy_config,

    initialize: function () {

        // Create instance
        this.alloy_mesh_vis = alloy();

        // Connect to Atom
        atom.workspace.observeActiveTextEditor(this.alloy_mesh_vis.editor);
        atom.config.observe('alloy-mesh-vis.jar', this.alloy_mesh_vis.jar);

    }

};