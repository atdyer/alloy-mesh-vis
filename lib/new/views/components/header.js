'use babel';

export default function header_component () {

    let icon,
        icon_cb,
        icon_tooltip,
        title;

    function view (selection) {

        selection
            .attr('class', 'header');

        selection.append('div')
            .attr('class', 'title')
            .text(title);

        if (icon) {

            let icon_div = selection.append('div')
                .attr('class', 'icon icon-button')
                .classed(icon, true)
                .on('click', icon_cb);

            atom.tooltips.add(icon_div.node(), {
                title: icon_tooltip,
                placement: 'top'
            });

        }

        return view;

    }

    view.icon = function (icon_string, tooltip, cb) {

        if (!arguments.length) return icon;
        icon = icon_string;
        icon_tooltip = tooltip;
        icon_cb = cb;
        return view;

    };

    view.title = function (_) {
        if (!arguments.length) return title;
        title = '' + _;
        return view;
    };

    return view;

}