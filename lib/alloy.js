'use babel';

// Libraries
import Java from 'java';
import tempmod from 'temp';
import path from 'path';

// Atom
import {Emitter} from 'atom';

export default function alloy () {

  let emitter = new Emitter(),
      is_java_loading = false,
      is_java_running = false,
      jar = null,
      Parser = null,
      Execute = null,
      Options = null,
      options = null;

  console.log('Created alloy instance');

  return {

    jar: function (_) {

      if (!arguments.length) return jar;

      // Only allow the jar to be set once
      if (jar) {
        emitter.emit('warning',
          `The alloy.jar file has been changed. In order for changes to take
           effect, Atom must be reloaded.`
        );
      }

      // Make sure we're looking at a jar file
      if (!_ || !_.split('.').pop() === 'jar') {
        emitter.emit('error',
          `The Alloy jar file must have a .jar extension`
        );
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
    }

  };

  function load_java () {

    try {

      // Parser = Java.import('edu.mit.csail.sdg.alloy4compiler.parser.CompUtil');
      // Execute = Java.import('edu.mit.csail.sdg.alloy4compiler.translator.TranslateAlloyToKodkod');
      // Options = Java.import('edu.mit.csail.sdg.alloy4compiler.translator.A4Options');

      Parser = Java.import('edu.mit.csail.sdg.parser.CompUtil');
      Execute = Java.import('edu.mit.csail.sdg.translator.TranslateAlloyToKodkod');
      Options = Java.import('edu.mit.csail.sdg.translator.A4Options');

      // Create instances of classes that aren't static
      options = Java.newInstanceSync('edu.mit.csail.sdg.translator.A4Options');
      options.solver = Options.SatSolver.SAT4J;

      // Finish
      is_java_loading = false;
      is_java_running = true;

      console.log('Java ready.');

    }

    catch (error) {

      is_java_loading = false;
      is_java_running = false;
      emitter.emit('error', error);
      console.error(error);

    }

  }

}
