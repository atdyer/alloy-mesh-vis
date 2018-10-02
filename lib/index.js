'use babel';

import alloy from './alloy';
import alloy_config from './alloy-config';

export default {

  alloy: null,
  config: alloy_config,

  initialize: function () {

    // Create the alloy instance
    this.alloy = alloy();

    // Set the jar file in the alloy instance
    atom.config.observe('alloy-mesh-vis.jar', this.alloy.jar);

  }

}
