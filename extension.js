/*jshint esnext:true */
/*global imports */

const St = imports.gi.St;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;

let clockDisplay, originalParent, newBox, actor, timeoutID;

function init() {
    clockDisplay = Main.panel.statusArea.dateMenu._clockDisplay;
}

function enable() {
    if (!originalParent) {
        originalParent = clockDisplay.get_parent();
        newBox = new St.BoxLayout();
        actor = new St.DrawingArea({style_class: 'analog-clock-area', reactive: true});
        actor.connect('repaint', redraw);
    }

    timeoutID = Mainloop.timeout_add_seconds(30, function () {
        actor.queue_repaint();
        return true;
    });
    clockDisplay.reparent(newBox);
    originalParent.add_child(newBox);
    newBox.insert_child_at_index(actor, 0);
}

function disable() {
    originalParent.remove_actor(newBox);
    clockDisplay.reparent(originalParent);
    Mainloop.source_remove(timeoutID);
}

function redraw(area) {
    // The crux of this function is taken from the 'Analog Neon Clock' extension.

    let now = new Date();
    let sec = now.getSeconds();
    let min = now.getMinutes();
    let hour = now.getHours();
    let [width, height] = area.get_surface_size();
    let cr = area.get_context();
    try {
        Clutter.cairo_set_source_color(cr, actor.get_theme_node().get_foreground_color());
    } catch (e) {
        return;
    }
    cr.translate(Math.floor(width/2), Math.floor(height/2));

    // Dial circle
    cr.arc(0, 0, Math.floor(height/2) - 3, 0, 7);
    cr.setLineWidth(1.5);
    cr.stroke();
    cr.setLineWidth(1);

    // Central dot
    cr.arc(0, 0, 1.5, 0, 7);
    cr.fill();

    // Hours hand
    drawHand(cr, (hour + sec/3600 + min/60) * Math.PI/6, Math.floor(height * 0.3));

    // Minutes hand
    drawHand(cr, (min + sec/60) * Math.PI/30, Math.floor(height * 0.45));
}

function drawHand(cr, angle, size) {
    cr.save();
    cr.rotate(angle);
    cr.moveTo(-1.3, 0);
    cr.lineTo(0, -size);
    cr.lineTo(1.3, 0);
    cr.fill();
    cr.restore();
}
