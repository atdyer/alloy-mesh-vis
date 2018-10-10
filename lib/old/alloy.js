'use babel';

// Libraries
import Java from 'java';
import tempmod from 'temp';
import path from 'path';

// Atom
import {Emitter} from 'atom';

export default function alloy() {

    let emitter = new Emitter();

    let is_java_loading = false,
        is_java_running = false;

    let jar;

    let Parser,
        Execute,
        Options,
        options;

    return {

        compile: function (file, on_success, on_error) {

            if (is_java_running && Parser) {

                try {

                    Parser.parseEverything_fromFile(
                        null,       // reporter
                        null,       // file cache
                        file,       // file to be parsed
                        on_success  // callback
                    );

                }

                catch (error) {

                    if (on_error) on_error(error);

                }

            }

        },

        dispose: function () {

            emitter.dispose();

        },

        execute: function (sigs, command, on_success, on_error) {

            if (is_java_running && Execute) {

                try {

                    let cmd = command.command();

                    function cb (err, res) {
                        on_success(command, err, res);
                    }

                    console.log(sigs);
                    console.log(cmd);
                    console.log(options);

                    Execute.execute_command(
                        null,       // reporter
                        sigs,       // complete list of sigs
                        cmd,        // the command to execute
                        options,    // alloy options
                        cb          // callback
                    );

                }

                catch (error) {

                    if (on_error) on_error(error);

                }

            }

        },

        jar: function (_) {

            if (!arguments.length) return jar;

            // Only allow the jar to be set once
            if (jar) {
                emitter.emit('warning',
                    'The alloy.jar file has been changed. In order for changes to take effect, Atom must be reloaded.'
                );
            }

            // Make sure we're looking at a jar file
            if (!_ || !_.split('.').pop() === 'jar') {
                emitter.emit('error', 'The Alloy jar file must have a .jar extension');
                return;
            }

            // Make sure we aren't already in the process of loading Java
            // and Java isn't already running
            if (!is_java_loading && !is_java_running) {

                // Let everyone know we're loading Java
                is_java_loading = true;
                emitter.emit('loading');

                jar = _;
                Java.classpath.push(jar);
                Java.ensureJvm(load_java);

            }
        },

        on_java_running: function (callback) {

            if (is_java_running) return callback(), null;
            return emitter.on('running', callback);

        },

        parse: function (text, on_success, on_error) {

            if (is_java_running && Parser) {

                try {

                    Parser.parseOneModule(text, on_success);

                }

                catch (error) {

                    if (on_error) on_error(error);

                }

            }

        }

    };

    function load_java() {

        let packages = [
            {
                parser: 'edu.mit.csail.sdg.alloy4compiler.parser.CompUtil',
                execute: 'edu.mit.csail.sdg.alloy4compiler.translator.TranslateAlloyToKodkod',
                options: 'edu.mit.csail.sdg.alloy4compiler.translator.A4Options'
            },
            {
                parser: 'edu.mit.csail.sdg.parser.CompUtil',
                execute: 'edu.mit.csail.sdg.translator.TranslateAlloyToKodkod',
                options: 'edu.mit.csail.sdg.translator.A4Options'
            }
        ];

        for (let i = 0; i < packages.length; ++i) {

            try {

                let p = packages[i];

                Parser = Java.import(p.parser);
                Execute = Java.import(p.execute);
                Options = Java.import(p.options);
                options = Java.newInstanceSync(p.options);
                options.solver = Options.SatSolver.SAT4J;

                is_java_loading = false;
                is_java_running = true;
                emitter.emit('running');

                break;

            }

            catch (error) {

                if (i === packages.length - 1) {

                    is_java_loading = false;
                    is_java_running = false;
                    emitter.emit('error', error);

                }

            }

        }

    }

}
