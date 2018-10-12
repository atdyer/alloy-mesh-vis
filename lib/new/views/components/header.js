'use babel';

export default function header_component () {

    let title;

    function view (selection) {

        selection
            .attr('class', 'header');

        selection.append('div')
            .attr('class', 'title')
            .text(title);

        return view;

    }

    view.title = function (_) {
        if (!arguments.length) return title;
        title = '' + _;
        return view;
    };

    return view;

}