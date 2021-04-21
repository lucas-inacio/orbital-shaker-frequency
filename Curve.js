class Curve {

    TYPE_BAR = 1;
    TYPE_LINE = 2;

    constructor(pInstance, x, y, width, height) {
        this.pInstance = pInstance;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.margin = 20;
        this.drawCurveRef = this._drawLine;
        this.properties = {
            lineColor: { r: 0, g: 0, b: 0}, 
            lineWeight: 3,
            frameColor: { r: 0, g: 0, b: 0},
            fill: { r: 0, g: 0, b: 0}
        }
    }

    setType(type) {
        if (type === this.TYPE_BAR) {
            this.type = this.TYPE_BAR;
            this.drawCurveRef = this._drawBar;
        } else if (type === this.TYPE_LINE) {
            this.type = this.TYPE_LINE;
            this.drawCurveRef = this._drawLine;
        } else {
            throw new Error('Wrong line type');
        }
    }

    _drawLine(x, y) {
        this.pInstance.vertex(x, y);
    }

    _drawBar(x, y) {
        this.pInstance.line(x, this.y + this.height / 2, x, y);
    }

    drawCurve(samples) {
        const size = samples.length;
        const step = this.width / size;
        
        // Draws the curve
        this.pInstance.noFill();
        this.pInstance.stroke(
            this.properties.lineColor.r,
            this.properties.lineColor.g,
            this.properties.lineColor.b);
        this.pInstance.beginShape();
        
        for (let i = 0; i < size; ++i) {
            const xCoord = i * step;
            const yCoord = samples[i].y * (this.height / 2 - this.margin);
            const ySignal = yCoord / Math.abs(yCoord);
            yCoord = Math.abs(yCoord);

            // Don't go beyond the limits
            if (xCoord >= (this.width - this.margin)) break;
            if (yCoord > (this.height / 2 - this.margin)) {
                yCoord -= (yCoord - (this.height / 2 - this.margin));
            }

            this.drawCurveRef(
                this.margin + this.x + i * step,
                this.y + this.height / 2 - ySignal * yCoord);
        }
            
        this.pInstance.endShape();
    }

    drawFrame() {
        // Draws frame
        this.pInstance.fill(255);
        this.pInstance.stroke(
            this.properties.frameColor.r,
            this.properties.frameColor.g,
            this.properties.frameColor.b);
        this.pInstance.line(this.x + this.margin, this.y, this.x + this.margin, this.y + this.height);
        this.pInstance.line(this.x + this.margin, this.y + this.height / 2, this.x + this.width, this.y + this.height / 2);
    }

    draw(samples) {
        this.pInstance.strokeWeight(this.properties.lineWeight);
        this.drawCurve(samples);
        this.drawFrame();
    }

    setLineColor(r, g, b) {
        this.properties.lineColor.r = r;
        this.properties.lineColor.g = g;
        this.properties.lineColor.b = b;
    }

    setFrameColor(r, g, b) {
        this.properties.frameColor.r = r;
        this.properties.frameColor.g = g;
        this.properties.frameColor.b = b;
    }
}

export default Curve;