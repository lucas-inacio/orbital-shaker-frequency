import { fontMap } from './font-map';

export function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success)
        return shader;

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

export function createProgram(gl, vertex, fragment) {
    let program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success)
        return program;
    
    console.log(gl.getShaderInfoLog(program));
    gl.deleteProgram(program);
}

export function computeTextVertices(text, x , y, scale=1) {
    const vertices = [];
    let startX = x;
    for (let character of text) {
        let c = fontMap.characters[character];
        const x0 = (startX - c.originX) * scale;
        const y0 = (y - c.originY) * scale;
        const s0 = (c.x / fontMap.width);
        const t0 = (c.y  / fontMap.height);

        const x1 = (startX - c.originX + c.width) * scale;
        const y1 = (y - c.originY) * scale;
        const s1 = ((c.x + c.width) / fontMap.width);
        const t1 = (c.y / fontMap.height);
    
        const x2 = (startX - c.originX) * scale;
        const y2 = (y - c.originY + c.height) * scale;
        const s2 = (c.x / fontMap.width);
        const t2 = ((c.y + c.height) / fontMap.height);
    
        const x3 = (startX - c.originX + c.width) * scale;
        const y3 = (y - c.originY + c.height) * scale;
        const s3 = ((c.x + c.width) / fontMap.width);
        const t3 = ((c.y + c.height) / fontMap.height);
        vertices.push(
            x0, y0, s0, t0,
            x1, y1, s1, t1,
            x3, y3, s3, t3,
            x0, y0, s0, t0,
            x3, y3, s3, t3,
            x2, y2, s2, t2,
        );

        startX += c.advance;
    }

    return vertices;
}