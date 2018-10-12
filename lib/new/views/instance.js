'use babel';

import header_component from './components/header';

export default function instance_view (selection) {

    let div,
        header,
        visible = false;

    function view (selection) {

        if (!div) {

            // Add a div to the parent
            div = selection.append('div')
                .style('display', visible ? null : 'none');

            // Add the header
            header = div.append('div')
                .call(header_component()
                    .title('Alloy Instance'));

        }

        return view;

    }

    view.hide = function () {

        visible = false;
        if (div) div.style('display', 'none');
        return view;

    };

    view.show = function () {

        visible = true;
        if (div) div.style('display', null);
        return view;

    };

    return view(selection);

}