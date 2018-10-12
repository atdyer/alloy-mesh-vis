'use babel';

export default {

    alloy: null,
    cli: null,
    panel: null,

    initialize: function () {

        this.cli = alloy_cli();

        this.panel = alloy_panel()
            .element(document.createElement('div'));

        this.alloy = alloy(this.cli, this.panel);

    }

};