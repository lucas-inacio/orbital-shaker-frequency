import vertexShaderSource from './shaders/vertex';
import fragmentShaderSource from './shaders/fragment';
import { createShader, createProgram } from './gl-utils/gl-utils';

class Curve {
    MARK_SIZE = 10;

    constructor(gl, x, y, width, height, screenWidth, screenHeight) {
        this.gl = gl;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.margin = 80;
        this.properties = {
            lineColor: [1, 0, 0, 1],
            frameColor: [0, 0, 0, 1], 
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
        this.positions = [];

        const vertex = createShader(this.gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragment = createShader(this.gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        this.program = createProgram(this.gl, vertex, fragment);
        this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
        this.colorLocation = this.gl.getUniformLocation(this.program, 'a_inColor');
        this.positionBuffer = this.gl.createBuffer();
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

    updateLineData(samples) {
        let positions = [];
        const size = samples.length;
        const step = (this.width - 2 * this.margin) / size;

        for (let i = 0; i < size; ++i) {
            let yCoord = samples[i] * (this.height - 2 * this.margin) / this.properties.ySpan;

            // Don't go beyond the limits
            if (yCoord > (this.height - 2 * this.margin)) {
                yCoord -= (yCoord - (this.height - 2 * this.margin));
            }
            
            positions.push(this.margin + this.x + i * step); 
            positions.push(this.y + this.height - this.margin - yCoord);
        }

        return positions;
    }

    drawFrame() {
        // this.gl.strokeStyle = this.properties.frameColor;
        // this.gl.lineWidth = this.properties.lineWidth;
        const lines = [
            this.x + this.margin, this.y + this.margin,
            this.x + this.margin, this.y + this.height - this.margin,
            this.x + this.margin, this.y + this.height - this.margin,
            this.x + this.width - this.margin, this.y + this.height - this.margin
        ];
        
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(lines), this.gl.DYNAMIC_DRAW);
        this.gl.uniform4f(this.colorLocation, 0, 0, 0, 1);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.LINES, 0, lines.length / 2);

        // this.gl.beginPath();
        // this.gl.moveTo(this.x + this.margin, this.y);
        // this.gl.lineTo(this.x + this.margin, this.y + this.height);
        // this.gl.stroke();
        
        // this.gl.beginPath();
        // this.gl.moveTo(this.x + this.margin, this.y + this.height);
        // this.gl.lineTo(this.x + this.width - this.margin, this.y + this.height);
        // this.gl.stroke();

        // // Draws marks on axes
        // this.gl.lineWidth = 3;
        // this.gl.fillStyle = 'black';
        // this.gl.font = 'bold ' + this.properties.fontSize + 'pt sans-serif';
        // if (this.properties.showXMark) {
        //     const step = (this.width - 2 * this.margin) / this.properties.numXMarks;

        //     let y = this.y + this.height;
        //     for (let i = 1; i < this.properties.numXMarks; ++i) {
        //         let x = this.x + this.margin + i * step;
        //         this.gl.beginPath();
        //         this.gl.moveTo(x, y + this.MARK_SIZE);
        //         this.gl.lineTo(x, y - this.MARK_SIZE);
        //         this.gl.stroke();

        //         let pos = Math.round((this.properties.xSpan / this.properties.numXMarks) * i * 10) / 10;
        //         this.gl.fillText(
        //             '' + pos,
        //             x,
        //             y + 2 * this.MARK_SIZE + 2 * this.properties.fontSize + 10
        //         );
        //     }
        // }

        // if (this.properties.showYMark) {
        //     const step = (this.height - 2 * this.margin) / this.properties.numYMarks;
        //     const x = this.x + this.margin;
        //     for (let i = 1; i < this.properties.numYMarks; ++i) {
        //         const y = this.y + this.height - i * step;
        //         this.gl.beginPath();
        //         this.gl.moveTo(x - this.MARK_SIZE, y);
        //         this.gl.lineTo(x + this.MARK_SIZE, y);
        //         this.gl.stroke();

        //         let pos = Math.round((this.properties.ySpan / this.properties.numYMarks) * i * 10) / 10;
        //         this.gl.fillText(
        //             '' + pos, 
        //             x - (this.MARK_SIZE + this.properties.fontSize + 27),
        //             y + (this.MARK_SIZE + this.properties.fontSize + 12)
        //         );
        //     }
        // }
    }

    draw(samples) {
        this.gl.useProgram(this.program);
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.uniform2f(this.resolutionLocation, this.screenWidth, this.screenHeight);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.lineWidth(6);
        this.drawFrame();
        if (samples.length > 0) {
            const positions = this.updateLineData(samples);
            // Add color
            positions.push(1);
            positions.push(0);
            positions.push(0);
            positions.push(1);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.DYNAMIC_DRAW);
            this.gl.uniform4f(this.colorLocation, 1, 0, 0, 1);
            this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
            this.gl.drawArrays(this.gl.LINE_STRIP, 0, (positions.length - 4) / 2);
        }
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