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
    
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteProgram(program);
}