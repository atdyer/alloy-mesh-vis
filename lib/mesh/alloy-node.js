'use babel';

export default function alloy_node (id) {

    let properties = {};

    function node () {

    }

    node.id = function () {
        return id;
    };

    node.properties = function () {
        return Object.keys(properties);
    };

    node.property = function (property_id, property) {
        if (arguments.length === 1) return properties[property_id];
        if (arguments.length === 2) properties[property_id] = property;
        return node;
    };

    node.print = function (depth) {
        depth = depth || 0;
        console.log('\t'.repeat(depth) + id + ' (' + node.properties().join() + ')');
    };

    return node;

}