'use babel';

function property_static (id) {

    let value;

    function property () {

    }

    property.id = function () {
        return id;
    };

    property.type = function () {
        return 'static';
    };

    property.value = function (_) {
        if (!arguments.length) return value;
        value = _;
        return property;
    };

    return property;

}

function property_dynamic (id) {

    let value = {};

    function property () {

    }

    property.id = function () {
        return id;
    };

    property.type = function () {
        return 'dynamic';
    };

    property.value = function (t, v) {
        if (!arguments.length) return value;
        if (arguments.length === 1) return value[t];
        if (arguments.length === 2) value[t] = v;
        return property;
    };

    return property;

}

export {
    property_static,
    property_dynamic
};