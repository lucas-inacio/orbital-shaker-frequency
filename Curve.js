class Curve {

    TYPE_BAR = 1;
    TYPE_LINE = 2;
    MARK_SIZE = 10;

    constructor(ctx, x, y, width, height) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.margin = 20;
        this.drawCurveRef = this._drawLine;
        this.properties = {
            lineColor: 'red',
            frameColor: 'black', 
            lineWidth: 6,
            fontSize: 20,
            numXMarks: 2,
            numYMarks: 2,
            showXMark: false,
            showYMark: false,
            showXNumbers: false,
            showYNumbers: false,
            xSpan: 1,
            ySpan: 1
        }
    }

    setXSpan(xSpan) {
        this.properties.xSpan = xSpan;
    }

    setYSpan(ySpan) {
        this.properties.ySpan = ySpan;
    }

    showXMark(show) {
        this.properties.showXMark = show;
    }

    showYMark(show) {
        this.properties.showYMark = show;
    }

    showXNumbers(show) {
        this.properties.showXNumbers = show;
    }

    showYNumbers(show) {
        this.properties.showYNumbers = show;
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
        
        this.ctx.strokeStyle = this.properties.lineColor;
        this.ctx.lineWidth = this.properties.lineWidth;
        this.ctx.beginPath();

        let yStart = samples[0].y * (this.height / 2 - this.margin) / this.properties.ySpan * 2;
        let yStartSignal = (yStart / Math.abs(yStart)) || 0;
        if (yStart > (this.height / 2 - this.margin)) {
            yStart -= (yStart - (this.height / 2 - this.margin));
        }
        this.ctx.moveTo(this.margin + this.x, this.y + this.height / 2 - yStartSignal * yStart);

        for (let i = 1; i < size; ++i) {
            let xCoord = i * step;
            let yCoord = samples[i].y * (this.height / 2 - this.margin) / this.properties.ySpan * 2;
            let ySignal = (yCoord / Math.abs(yCoord)) || 0;
            yCoord = Math.abs(yCoord);

            // Don't go beyond the limits
            if (xCoord >= (this.width - this.margin)) break;
            if (yCoord > (this.height / 2 - this.margin)) {
                yCoord -= (yCoord - (this.height / 2 - this.margin));
            }

            this.ctx.lineTo(
                this.margin + this.x + i * step, 
                this.y + this.height / 2 - ySignal * yCoord);
        }
        this.ctx.stroke();
    }

    _drawBar(samples) {
        const size = samples.length;
        const step = (this.width - 2 * this.margin) / size;

        this.ctx.strokeStyle = this.properties.lineColor;
        this.ctx.lineWidth = this.properties.lineWidth;

        for (let i = 0; i < size; ++i) {
            // const xCoord = i * step;
            const yCoord = samples[i].y * (this.height / 2 - this.margin);
            const ySignal = yCoord / Math.abs(yCoord);
            yCoord = Math.abs(yCoord);

            // Don't go beyond the limits
            // if (xCoord >= (this.width - this.margin)) break;
            if (yCoord > (this.height / 2 - this.margin)) {
                yCoord -= (yCoord - (this.height / 2 - this.margin));
            }

            x = this.margin + this.x + i * step;
            y = this.y + this.height / 2 - ySignal * yCoord;
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.y + this.height / 2);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        }

    }

    drawCurve(samples) {
        this.drawCurveRef(samples);
    }

    drawFrame() {
        this.ctx.strokeStyle = this.properties.frameColor;
        this.ctx.lineWidth = this.properties.lineWidth;

        this.ctx.beginPath();
        this.ctx.moveTo(this.x + this.margin, this.y);
        this.ctx.lineTo(this.x + this.margin, this.y + this.height);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.x + this.margin, this.y + this.height / 2);
        this.ctx.lineTo(this.x + this.width - this.margin, this.y + this.height / 2);
        this.ctx.stroke();

        // Draws marks on axes
        this.ctx.lineWidth = 3;
        this.ctx.fillStyle = 'black';
        this.ctx.font = 'bold ' + this.properties.fontSize + 'pt sans-serif';
        if (this.properties.showXMark) {
            const step = (this.width - 2 * this.margin) / this.properties.numXMarks;

            let y = this.y + this.height / 2;
            for (let i = 1; i < this.properties.numXMarks; ++i) {
                let x = this.x + this.margin + i * step;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y + this.MARK_SIZE);
                this.ctx.lineTo(x, y - this.MARK_SIZE);
                this.ctx.stroke();

                if (this.properties.showXNumbers) {
                    let pos = Math.round((this.properties.xSpan / this.properties.numXMarks) * i * 10) / 10;
                    this.ctx.fillText(
                        '' + pos,
                        x,
                        y + 2 * this.MARK_SIZE + 2 * this.properties.fontSize + 10
                    );
                }
            }
        }

        if (this.properties.showYMark) {
            const step = (this.height - 2 * this.margin) / this.properties.numYMarks;
            x = this.x + this.margin;
            for (let i = 1; i < this.properties.numYMarks; ++i) {
                y = this.y + this.margin + i * step;
                this.ctx.beginPath();
                this.ctx.moveTo(x - this.MARK_SIZE, y);
                this.ctx.lineTo(x + this.MARK_SIZE, y);
                this.ctx.stroke();

                if (this.properties.showYNumbers) {
                    let pos = Math.round(-(this.properties.ySpan / this.properties.numYMarks) * (i - this.properties.numYMarks / 2) * 10) / 10;
                    this.ctx.fillText(
                        '' + pos, 
                        x - (this.MARK_SIZE + this.properties.fontSize + 27),
                        y + (this.MARK_SIZE + this.properties.fontSize + 12)
                    );
                }
            }
        }
    }

    draw(samples) {
        this.ctx.save();

        this.drawFrame();
        if (samples.length > 0)
            this.drawCurve(samples);

        this.ctx.restore();
    }

    setLineColor(lineColor) {
        this.properties.lineColor = lineColor;
    }

    setFrameColor(frameColor) {
        this.properties.frameColor = frameColor;
    }

    setLineWidth(lineWidth) {
        this.properties.lineWidth = lineWidth;;
    }
}

export default Curve;