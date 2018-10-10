'use babel';

export default function view_java_loading (selection) {

    let _div = null;

    function _view_java_loading (selection) {

        if (selection) {

            // Add a div to the parent
            _div = selection.append('div')
                .style('display', 'none');

            // Add a message
            _div.append('div')
                .attr('class', 'message-lg')
                .text('Preparing for takeoff.');

            // Add a spinner
            _div.append('div')
                .attr('class', 'centered')
                .append('span')
                .attr('class', 'loading loading-spinner-medium');

        }

        return _view_java_loading;

    }

    _view_java_loading.hide = function () {

        if (_div) _div.style('display', 'none');
        return _view_java_loading;

    };

    _view_java_loading.show = function () {

        if (_div) _div.style('display', null);
        return _view_java_loading;

    };

    return _view_java_loading(selection);

}