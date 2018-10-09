'use babel';

import alloy_cli from './alloy-cli';

export default {

    initialize: function () {

        this.cli = alloy_cli();
        this.cli.on_list_commands(console.log);
        this.cli.on_model_set(console.log);
        this.cli.on_result(console.log);
        this.cli.set_model('/home/tristan/Desktop/test.als');
        this.cli.list_commands();
        this.cli.execute_command(0);
        // this.cli.next_solution();
        // this.cli.display_last();

    },

    deactivate: function () {

        if (this.cli) {
            this.cli.quit();
        }

    }

}
