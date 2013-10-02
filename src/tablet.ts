module Croquis {
    export class Tablet {
        static get plugin() {
            var plugin = document.querySelector(
                'object[type=\'application/x-wacomtabletplugin\']');
            if (!plugin) {
                plugin = document.createElement('object');
                plugin['type'] = 'application/x-wacomtabletplugin';
                plugin['style'].position = 'absolute';
                plugin['style'].top = '-1000px';
                document.body.appendChild(plugin);
            }
            return plugin;
        }
        static get pen() {
            return Croquis.Tablet.plugin['penAPI'];
        }
        static get pressure() {
            var pen = Croquis.Tablet.pen;
            return (pen && pen.pointerType) ? pen.pressure : 1;
        }
        static get isEraser() {
            var pen = Croquis.Tablet.pen;
            return pen ? pen.isEraser : 1;
        }
    }
}