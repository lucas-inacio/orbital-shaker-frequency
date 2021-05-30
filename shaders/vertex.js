export const vertexShaderSource = 
`
attribute vec2 a_position;
uniform vec2 u_resolution;
uniform vec4 u_inColor;
varying vec4 color;
void main() {
    vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clipSpace.x, -clipSpace.y, 0, 1);
    color = u_inColor;
}`;

export const textVertexShaderSource =
`
// attribute vec2 a_postition;
attribute vec4 a_texCoord;
varying vec2 v_texCoord;
uniform vec2 u_resolution;
void main() {
    // vec2 clipSpace = (a_postition / u_resolution) * 2.0 - 1.0;
    // v_texCoord = a_texCoord;
    v_texCoord = a_texCoord.zw;
    vec2 clipSpace = (vec2(a_texCoord.x, a_texCoord.y) / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clipSpace.x, -clipSpace.y, 0, 1);
}
`;