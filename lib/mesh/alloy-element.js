'use babel';

export default function alloy_element (id) {

    let nodes = {},
        edges = {};

    let properties = {};

    function element () {

    }

    element.id = function () {
        return id;
    };

    element.node = function (node_id, node) {
        if (arguments.length === 1) return ndoes[node_id];
        nodes[node_id] = node;
        return element;
    };

    element.nodes = function () {

    };

    element.edge = function (edge_id, edge) {
        if (arguments.length === 1) return edges[edge_id];
        edges[edge_id] = edge;
        return element;
    };

    element.properties = function () {
        return Object.keys(properties);
    };

    element.property = function (property_id, property) {
        if (arguments.length === 1) return properties[property_id];
        if (arguments.length === 2) properties[property_id] = property;
        return element;
    };

    element.print = function (depth) {
        depth = depth || 0;
        console.log('\t'.repeat(depth) + id + ' (' + element.properties().join() + ')');
        Object.values(nodes).forEach(n => n.print(depth + 1));
        Object.values(edges).forEach(e => e.print(depth + 1));
    };

    return element;

}