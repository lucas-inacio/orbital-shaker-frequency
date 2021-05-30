const vertexShaderSource = 
`
attribute vec2 a_position;
uniform vec2 u_resolution;
uniform vec4 a_inColor;
varying vec4 color;
void main() {
    vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clipSpace.x, -clipSpace.y, 0, 1);
    color = a_inColor;
}`;

export default vertexShaderSource;