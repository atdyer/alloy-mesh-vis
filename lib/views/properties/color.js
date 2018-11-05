'use babel';

import { schemePaired } from 'd3-scale-chromatic';

export default function property_color (name) {

    let callback;
    let style = 'fill';

    function color (selection) {

    }

    color.name = function (_) {
        if (!arguments.length) return name;
        name = _;
        return color;
    };

    color.on = function (_) {
        if (!arguments.length) return callback;
        callback = _;
        return color;
    };

    color.style = function (_) {
        if (!arguments.length) return style;
        style = _;
        return color;
    };

    return color;

}