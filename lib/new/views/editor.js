'use babel';

import header_component from './components/header';

export default function editor_view (selection) {

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
                    .title('Alloy Commands'));

        }

        return view;

    }

    view.disable = function () {

    };

    view.enable = function () {

    };

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