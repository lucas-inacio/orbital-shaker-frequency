class Curve {
    MARK_SIZE = 10;

    constructor(ctx, x, y, width, height) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.margin = 20;
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

    setNumXMarks(size) {
        this.properties.numXMarks = (size >= 2) ? size : 2;
    }
    
    setNumYMarks(size) {
        this.properties.numYMarks = (size >= 2) ? size : 2;
    }

    _drawLine(samples) {
        const size = samples.length;
        const step = (this.width - 2 * this.margin) / size;
        
        this.ctx.strokeStyle = this.properties.lineColor;
        this.ctx.lineWidth = this.properties.lineWidth;
        this.ctx.beginPath();

        let yStart = samples[0] * (this.height - 2 * this.margin) / this.properties.ySpan;
        if (yStart > (this.height - this.margin)) {
            yStart -= (yStart - (this.height - this.margin));
        }
        this.ctx.moveTo(this.margin + this.x, this.y + this.height - yStart);

        for (let i = 1; i < size; ++i) {
            let yCoord = samples[i] * (this.height - 2 * this.margin) / this.properties.ySpan;

            // Don't go beyond the limits
            if (yCoord > (this.height - this.margin)) {
                yCoord -= (yCoord - (this.height - this.margin));
            }

            this.ctx.lineTo(
                this.margin + this.x + i * step, 
                this.y + this.height - yCoord);
        }
        this.ctx.stroke();
    }

    drawFrame() {
        this.ctx.strokeStyle = this.properties.frameColor;
        this.ctx.lineWidth = this.properties.lineWidth;

        this.ctx.beginPath();
        this.ctx.moveTo(this.x + this.margin, this.y);
        this.ctx.lineTo(this.x + this.margin, this.y + this.height);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.x + this.margin, this.y + this.height);
        this.ctx.lineTo(this.x + this.width - this.margin, this.y + this.height);
        this.ctx.stroke();

        // Draws marks on axes
        this.ctx.lineWidth = 3;
        this.ctx.fillStyle = 'black';
        this.ctx.font = 'bold ' + this.properties.fontSize + 'pt sans-serif';
        if (this.properties.showXMark) {
            const step = (this.width - 2 * this.margin) / this.properties.numXMarks;

            let y = this.y + this.height;
            for (let i = 1; i < this.properties.numXMarks; ++i) {
                let x = this.x + this.margin + i * step;
                this.ctx.beginPath();
                this.ctx.moveTo(x, y + this.MARK_SIZE);
                this.ctx.lineTo(x, y - this.MARK_SIZE);
                this.ctx.stroke();

                let pos = Math.round((this.properties.xSpan / this.properties.numXMarks) * i * 10) / 10;
                this.ctx.fillText(
                    '' + pos,
                    x,
                    y + 2 * this.MARK_SIZE + 2 * this.properties.fontSize + 10
                );
            }
        }

        if (this.properties.showYMark) {
            const step = (this.height - 2 * this.margin) / this.properties.numYMarks;
            const x = this.x + this.margin;
            for (let i = 1; i < this.properties.numYMarks; ++i) {
                const y = this.y + this.height - i * step;
                this.ctx.beginPath();
                this.ctx.moveTo(x - this.MARK_SIZE, y);
                this.ctx.lineTo(x + this.MARK_SIZE, y);
                this.ctx.stroke();

                let pos = Math.round((this.properties.ySpan / this.properties.numYMarks) * i * 10) / 10;
                this.ctx.fillText(
                    '' + pos, 
                    x - (this.MARK_SIZE + this.properties.fontSize + 27),
                    y + (this.MARK_SIZE + this.properties.fontSize + 12)
                );
            }
        }
    }

    draw(samples) {
        this.ctx.save();

        this.drawFrame();
        if (samples.length > 0)
            this._drawLine(samples);

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