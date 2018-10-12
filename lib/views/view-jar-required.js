'use babel';

export default function view_jar_required (selection) {

    let _div = null,
        _error = null,
        _picker = null,
        _visible = false;

    function _view_jar_required (selection) {

        if (!_div) {

            // Add a div to the parent
            _div = selection.append('div')
                .attr('class', 'centered')
                .style('display', _visible ? null : 'none');

            // Add an invisible file picker
            _picker = _div.append('input')
                .attr('type', 'file')
                .style('display', 'none')
                .on('change', function () {
                    let file = event.target.files[0].path;
                    if (file && file.split('.').pop() === 'jar') {
                        atom.config.set('alloy-mesh-vis.jar', file);
                    } else {
                        _view_jar_required.show_jar_error();
                    }
                });

            // Add descriptive text
            _div.append('div')
                .attr('class', 'message-lg')
                .html('<p>Set the <a href="http://alloytools.org/download.html">alloy.jar</a> location to enable Alloy features.</p>');

            // Add button to choose jar file
            _div.append('div')
                .attr('class', 'centered btn-col-9')
                .append('button')
                .attr('class', 'btn btn-lg btn-primary icon icon-file-directory')
                .text('Browse...')
                .on('click', function() {
                    if (_picker) _picker.node().click();
                });

            // Add the jar error
            _error = _div.append('div')
                .attr('class', 'message-lg text-error')
                .style('display', 'none')
                .text('Please choose a .jar file');

            return _view_jar_required;

        }

    }

    _view_jar_required.hide = function () {

        _visible = false;
        if (_div) _div.style('display', 'none');
        return _view_jar_required;

    };

    _view_jar_required.hide_jar_error = function () {

        if (_error) _error.style('display', 'none');
        return _view_jar_required;

    };

    _view_jar_required.show = function () {

        _visible = true;
        if (_div) _div.style('display', null);
        return _view_jar_required;

    };

    _view_jar_required.show_jar_error = function () {

        if (_error) _error.style('display', null);
        return _view_jar_required;

    };

    return _view_jar_required(selection);

}