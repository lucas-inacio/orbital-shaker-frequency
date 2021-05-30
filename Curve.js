import { textVertexShaderSource, vertexShaderSource } from './shaders/vertex';
import { fragmentShaderSource, textFragmentShaderSource } from './shaders/fragment';
import { createShader, createProgram, computeTextVertices } from './gl-utils/gl-utils';
import { Asset } from 'expo-asset';

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
        this.margin = 100;
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
    }

    initGLResources() {
        const vertex = createShader(this.gl, this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragment = createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        this.program = createProgram(this.gl, vertex, fragment);
        this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
        this.colorLocation = this.gl.getUniformLocation(this.program, 'u_inColor');
        this.positionBuffer = this.gl.createBuffer();

        // Set up text
        const vertexText = createShader(this.gl, this.gl.VERTEX_SHADER, textVertexShaderSource);
        const fragmentText = createShader(this.gl, this.gl.FRAGMENT_SHADER, textFragmentShaderSource);
        this.textProgram = createProgram(this.gl, vertexText, fragmentText);

        this.textBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.text), this.gl.STATIC_DRAW);
        this.textLocation = this.gl.getUniformLocation(this.textProgram, 'u_texture');
        this.textResolutionLocation = this.gl.getUniformLocation(this.gl.textProgram, 'u_resolution');
        this.textCoordLocation = this.gl.getAttribLocation(this.textProgram, 'a_texCoord');
        
        this.texture = this.gl.createTexture();
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.fontTexture);
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

    async setup() {
        this.fontTexture = Asset.fromModule(require('./assets/font.png'));
        await this.fontTexture.downloadAsync();
        this.showYMark(true);
        this.setNumYMarks(8);
        this.setYSpan(280);
        this.buildFrame();
        this.initGLResources();
    }

    buildFrame() {
        // Axes
        this.lines = [
            this.x + this.margin, this.y + this.margin,
            this.x + this.margin, this.y + this.height - this.margin,
            this.x + this.margin, this.y + this.height - this.margin,
            this.x + this.width - this.margin, this.y + this.height - this.margin
        ];

        this.text = [];

        // Draw marks on axes
        const step = (this.height - 2 * this.margin) / this.properties.numYMarks;
        const x = this.x + this.margin;
        for (let i = 1; i < this.properties.numYMarks; ++i) {
            const y = this.y + this.height - this.margin - i * step;
            this.lines.push(x - this.MARK_SIZE, y, x + this.MARK_SIZE, y);

            // Compute text vertices;
            const posString = '' + Math.round((this.properties.ySpan / this.properties.numYMarks) * i * 10) / 10;
            this.text.push(
                ...computeTextVertices(
                    posString,
                    x - (this.MARK_SIZE + this.properties.fontSize + 50),
                    y
                ));
        }
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

    drawText() {
        this.gl.useProgram(this.textProgram);
        this.gl.uniform2f(this.textResolutionLocation, this.screenWidth, this.screenHeight);
        this.gl.uniform1i(this.textLocation, 0);
        
        this.gl.enableVertexAttribArray(this.textCoordLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textBuffer);
        this.gl.vertexAttribPointer(this.textCoordLocation, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.text.length / 4);
    }

    drawFrame() {       
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.lines), this.gl.STATIC_DRAW);
        this.gl.uniform4f(this.colorLocation, 0, 0, 0, 1);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.LINES, 0, this.lines.length / 2);
    }

    draw(samples) {
        this.drawText();
        this.gl.useProgram(this.program);
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.uniform2f(this.resolutionLocation, this.screenWidth, this.screenHeight);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.lineWidth(6);
        this.drawFrame();
        if (samples.length > 0) {
            const positions = this.updateLineData(samples);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.DYNAMIC_DRAW);
            this.gl.uniform4f(this.colorLocation, 1, 0, 0, 1);
            this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
            this.gl.drawArrays(this.gl.LINE_STRIP, 0, positions.length / 2);
        }
        this.gl.disableVertexAttribArray(this.positionLocation);
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