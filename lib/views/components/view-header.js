'use babel';

export default function view_header () {

    let _title = '';
    let _icon = '';
    let _icon_callback = function () {};

    function _view_header (selection) {

        let _div = selection.attr('class', 'header');

        _div.append('div')
            .attr('class', 'title')
            .text(_title);

        let icon_div = _div.append('div')
            .attr('class', 'icon icon-button ' + _icon)
            .on('click', _icon_callback);

        atom.tooltips.add(icon_div.node(), {
            title: 'Run All',
            placement: 'top'
        });

        return _view_header;

    }

    _view_header.title = function (title) {

        if (!arguments.length) return _title;
        _title = title;
        return _view_header;

    };

    _view_header.icon = function (icon, callback) {

        if (!arguments.length) return _icon;
        _icon = icon;
        _icon_callback = callback || function () {};
        return _view_header;

    };

    return _view_header;

}