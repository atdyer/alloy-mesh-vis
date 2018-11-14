'use babel';

import style_value from './style-value';
import style_color from './style-color';

export default function default_styles (node_sig, elem_sig) {
    return [
        style_value().class(node_sig).display_name('Radius').property('r').default(20).attr(true),
        style_color().class(node_sig).display_name('Fill').property('fill').default('steelblue'),
        style_color().class(node_sig).display_name('Stroke').property('stroke').default('transparent'),
        style_value().class(node_sig).display_name('Stroke Width').property('stroke-width').default(1),
        style_color().class(elem_sig).display_name('Fill').property('fill').default('transparent'),
        style_color().class(elem_sig).display_name('Stroke').property('stroke').default('black'),
        style_value().class(elem_sig).display_name('Stroke Width').property('stroke-width').default(1)
    ];
}