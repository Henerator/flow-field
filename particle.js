class Particle {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.speed = createVector(0, 0);
        this.updatePreviousPosition();
    }

    update() {
        this.updatePreviousPosition();
        this.position.add(this.speed);
    }

    updatePreviousPosition() {
        this.previousPosition = this.position.copy();
    }

    applyForce(force) {
        this.speed.add(force);
    }

    draw(color) {
        stroke(color);
        strokeWeight(10);
        point(this.position);
    }

    drawMagic(color, opacity) {
        const { x: x1, y: y1 } = this.previousPosition;
        const { x: x2, y: y2 } = this.position;
        stroke(color, opacity);
        strokeWeight(1);
        line(x1, y1, x2, y2);
    }
}