class Curve {

    TYPE_BAR = 1;
    TYPE_LINE = 2;
    MARK_SIZE = 10;

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
            fill: { r: 0, g: 0, b: 0},
            numXMarks: 2,
            numYMarks: 2,
            showXMark: false,
            showYMark: false,
        }
    }

    showXMark(show) {
        this.properties.showXMark = show;
    }

    showYMark(show) {
        this.properties.showYMark = show;
    }

    setNumXMarks(size) {
        this.properties.numXMarks = (size >= 2) ? size : 2;
    }
    
    setNumYMarks(size) {
        this.properties.numYMarks = (size >= 2) ? size : 2;
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

    _drawLine(samples) {
        const size = samples.length;
        const step = (this.width -  2 * this.margin) / size;
        this.pInstance.beginShape();
        
        for (let i = 0; i < size; ++i) {
            const xCoord = i * step;
            const yCoord = samples[i].y * (this.height / 2 - this.margin);
            const ySignal = (yCoord / Math.abs(yCoord)) || 0;
            yCoord = Math.abs(yCoord);

            // Don't go beyond the limits
            if (xCoord >= (this.width - this.margin)) break;
            if (yCoord > (this.height / 2 - this.margin)) {
                yCoord -= (yCoord - (this.height / 2 - this.margin));
            }

            this.pInstance.vertex(                
                this.margin + this.x + i * step,
                this.y + this.height / 2 - ySignal * yCoord);
        }
            
        this.pInstance.endShape();
    }

    _drawBar(samples) {
        const size = samples.length;
        const step = (this.width - 2 * this.margin) / size;
        
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

            x = this.margin + this.x + i * step;
            y = this.y + this.height / 2 - ySignal * yCoord;
            this.pInstance.line(x, this.y + this.height / 2, x, y);
        }

    }

    drawCurve(samples) {
        
        // Draws the curve
        this.pInstance.noFill();
        this.pInstance.stroke(
            this.properties.lineColor.r,
            this.properties.lineColor.g,
            this.properties.lineColor.b);
        this.drawCurveRef(samples);
    }

    drawFrame() {
        // Draws frame
        this.pInstance.noFill(255);
        this.pInstance.stroke(
            this.properties.frameColor.r,
            this.properties.frameColor.g,
            this.properties.frameColor.b);
        this.pInstance.line(this.x + this.margin, this.y, this.x + this.margin, this.y + this.height);
        this.pInstance.line(this.x + this.margin, this.y + this.height / 2, this.x + this.width - this.margin, this.y + this.height / 2);

        // Draws marks on axes
        this.pInstance.strokeWeight(3);
        if (this.properties.showXMark) {
            const step = (this.width - 2 * this.margin) / this.properties.numXMarks;

            y = this.y + this.height / 2;
            for (let i = 1; i < this.properties.numXMarks; ++i) {
                x = this.x + this.margin + i * step;
                this.pInstance.line(x, y + this.MARK_SIZE, x, y - this.MARK_SIZE);
            }
        }

        if (this.properties.showYMark) {
            const step = (this.height - 2 * this.margin) / this.properties.numYMarks;
            x = this.x + this.margin;
            for (let i = 1; i < this.properties.numYMarks; ++i) {
                y = this.y + this.margin + i * step;
                this.pInstance.line(x - this.MARK_SIZE, y, x + this.MARK_SIZE, y);
            }
        }
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

    setLineWeight(weight) {
        this.properties.lineWeight = weight;
    }
}

export default Curve;