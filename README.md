# alloy-mesh-vis

An Atom Editor plugin that greatly simplifies the visualization of meshes created
using the [mesh.als](http://www4.ncsu.edu/~jwb/alloy/) model of an ADCIRC finite
element mesh.

# Dependencies

In order to interact with Alloy behind the scenes, the plugin requires a special
version of Alloy, available 
[here](https://github.com/atdyer/org.alloytools.alloy/raw/master/org.alloytools.alloy.dist.jar).
This version is identical to Alloy version 5, but includes a special command-line
interface that enables simple communication with the plugin.

Additionally, you'll need Java installed, just as you would when using Alloy
as a standalone program. If you can run Alloy using the command

```bash
java -jar org.alloytools.alloy.dist.jar
```

then you should be good to go.

# History

A previous version of this plugin used the [node-java](https://www.npmjs.com/package/java)
package to communicate with Alloy, but it proved to be extremely buggy and often left you
wading through dependency hell. This lead to the development of a simple command-line
interface, which is accessed using [Node Child Processes](https://nodejs.org/api/child_process.html).
