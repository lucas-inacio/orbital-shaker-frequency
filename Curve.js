class Curve {
    constructor(pInstance, x, y, width, height) {
        this.pInstance = pInstance;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(samples) {
        const size = samples.length;
        const step = this.width / size;
        this.pInstance.noFill();
        this.pInstance.rect(this.x, this.y, this.width, this.height);
        this.pInstance.beginShape();
        this.pInstance.vertex(this.x, this.y + this.height);
        for (let i = 0; i < size; ++i)
            this.pInstance.vertex(this.x + i * step, this.y + this.height / 2 - samples[i].y * this.height / 2);

        this.pInstance.endShape();
    }
}

export default Curve;