'use babel';

export default function alloy_edge (n1, n2) {

    function edge () {

    }

    edge.id = function () {
        return n1.id() + '->' + n2.id();
    };

    edge.print = function (depth) {
        depth = depth || 0;
        console.log('\t'.repeat(depth) + edge.id());
    };

    return edge;

}