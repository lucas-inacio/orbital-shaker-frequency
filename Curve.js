class Curve {
    constructor(pInstance, x, y, width, height) {
        this.pInstance = pInstance;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.margin = 20;
    }

    draw(samples) {
        const size = samples.length;
        const step = this.width / size;
        
        // Draws the curve
        this.pInstance.noFill();
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

            this.pInstance.vertex(
                this.margin + this.x + i * step, 
                this.y + this.height / 2 - ySignal * yCoord);
        }
            
        this.pInstance.endShape();

        // Draws frame
        this.pInstance.fill(255);
        this.pInstance.line(this.x + 2 * this.margin, this.y, this.x + 2 * this.margin, this.y + this.height);
        this.pInstance.line(this.x + this.margin, this.y + this.height / 2, this.x + this.width, this.y + this.height / 2);
    }
}

export default Curve;