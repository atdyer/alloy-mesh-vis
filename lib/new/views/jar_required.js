'use babel';

export default function jar_required_view (selection) {

    let div,
        error,
        picker,
        visible = false;

    function view (selection) {

        if (!div) {

            // Add a div to the parent
            div = selection.append('div')
                .attr('class', 'centered')
                .style('display', visible ? null : 'none');

            // Add an invisible file picker
            picker = div.append('input')
                .attr('type', 'file')
                .style('display', 'none')
                .on('change', on_jar_picked);

            // Add some descriptive text
            div.append('div')
                .attr('class', 'message-lg')
                .html('<p>Set the alloy.jar location to enable Alloy features.</p>');

            // Add a button for picking the jar file
            div.append('div')
                .attr('class', 'centered btn-col-9')
                .append('button')
                .attr('class', 'btn btn-lg btn-primary icon icon-file-directory')
                .text('Browse...')
                .on('click', () => picker.node().click());

            // Add the error message
            error = div.append('div')
                .attr('class', 'message-lg text-error')
                .style('display', 'none')
                .text('Please choose a .jar file');

            return view;

        }

    }

    view.hide = function () {

        visible = false;
        if (div) div.style('display', 'none');
        return view;

    };

    view.hide_error = function () {

        if (error) error.style('display', 'none');
        return view;

    };

    view.show = function () {

        visible = true;
        if (div) div.style('display', null);
        return view;

    };

    view.show_error = function () {

        if (error) error.style('display', null);
        return view;

    };


    return view(selection);


    function on_jar_picked () {

        let file = event.target.files[0].path;
        if (file && file.split('.').pop() === 'jar') {
            atom.config.set('alloy-mesh-vis.jar', file);
        } else {
            view.show_error();
        }

    }

}