'use babel';

import alloy from './alloy';
import alloy_config from './alloy-config';
import editor_manager from './editor-manager';

export default {

    config: alloy_config,

    alloy: null,
    manager: null,

    initialize: function () {

        // Create the alloy instance
        this.alloy = alloy();

        // Set the jar file in the alloy instance
        atom.config.observe('alloy-mesh-vis.jar', this.alloy.jar);

        // Track text editors
        this.manager = editor_manager()
            .alloy(this.alloy);
        // this.manager.on_active_editor_change(console.log);

    }

}
