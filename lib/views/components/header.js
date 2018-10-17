'use babel';

export default function header_component () {

    let icon,
        icon_cb,
        icon_tooltip,
        title;

    let div_title,
        div_icon;

    function view (selection) {

        selection
            .attr('class', 'header');

        div_title = selection.append('div')
            .attr('class', 'title')
            .text(title);

        if (icon) {

            div_icon = selection.append('div')
                .attr('class', 'icon icon-button')
                .classed(icon, true)
                .classed('active', true)
                .on('click', icon_cb);

            atom.tooltips.add(div_icon.node(), {
                title: icon_tooltip,
                placement: 'top'
            });

        }

        return view;

    }

    view.disable = function () {
        if (div_icon) div_icon
            .classed('active', false)
            .on('click', null);
    };

    view.enable = function () {
        if (div_icon && icon_cb) div_icon
            .classed('active', true)
            .on('click', icon_cb);
    };

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
        if (div_title) div_title.text(title);
        return view;
    };

    return view;

}