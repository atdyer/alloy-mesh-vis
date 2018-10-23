'use babel';

import { select } from 'd3-selection';

export default function header_component () {

    let title,
        icons = [];

    let div_title,
        div_icon;

    function view (selection) {

        selection
            .attr('class', 'header');

        div_title = selection.append('div')
            .attr('class', 'title')
            .text(title);

        if (icons.length) {

            div_icon = selection.selectAll('div.icon')
                .data(icons);

            div_icon
                .exit()
                .remove();

            div_icon = div_icon
                .enter()
                .append('div')
                .attr('class', 'icon icon-button')
                .merge(div_icon);

            div_icon.each(function (icon) {

                select(this)
                    .classed(icon.type, true)
                    .classed('active', true)
                    .on('click', icon.callback);

                atom.tooltips.add(this, {
                    title: icon.tooltip,
                    placement: 'top'
                });

            });

        }

        return view;

    }

    view.disable = function () {
        if (div_icon) div_icon.each(function () {
            select(this).classed('active', false);
        });
    };

    view.enable = function () {
        if (div_icon) div_icon.each(function () {
            select(this).classed('active', true);
        });
    };

    view.icon = function (icon, tooltip, cb) {
        icons.push({
            type: icon,
            tooltip: tooltip,
            callback: cb
        });

        return view;
    };

    view.icons = function () {
        return div_icon;
    };

    view.title = function (_) {
        if (!arguments.length) return title;
        title = '' + _;
        if (div_title) div_title.text(title);
        return view;
    };

    return view;

}