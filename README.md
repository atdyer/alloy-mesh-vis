# alloy-mesh-vis package

# Dependencies

In order to call Java code from the Atom editor, this package uses the
[node-java](https://www.npmjs.com/package/java) package. The node-java
package itself has two prerequisites in order for it to be installed correctly.

  * A JDK must be installed
  * Python 2 must be the version used when the ```python``` command is called

## Ubuntu

My Ubuntu 18.04 installation had no JDK installed and numerous Python versions
installed. To install the JDK, simply use the command:

```bash
$ sudo apt-get install default-jdk
```

I have Anaconda Python installed, which has edited my ```.bashrc``` file to
include Anaconda Python in the system path. Simply comment out the line added
by the Anaconda installation, which may be similar to this:

```bash
export PATH="/home/tristan/Downloads/python/bin:$PATH"
```

by adding a ```#``` symbol at the beginning of the line. Verify that Python 2
is the version now being used by opening a new terminal and typing the
command ```python -V```. After the package has been installed you may change
the Python version as you please.

If Python 3 is still being used you may need to use another method, such as
[update-alternatives](http://web.mit.edu/6.00/www/handouts/pybuntu.html), to
change the version of Python being used.
