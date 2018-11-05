'use babel';

export default function property_width (name) {

    let callback;
    let style = 'stroke-width';

    function width (selection) {

    }

    width.name = function (_) {
        if (!arguments.length) return name;
        name = _;
        return width;
    };

    width.on = function (_) {
        if (!arguments.length) return callback;
        callback = _;
        return width;
    };

    width.style = function (_) {
        if (!arguments.length) return style;
        style = _;
        return width;
    };

    return width;

}