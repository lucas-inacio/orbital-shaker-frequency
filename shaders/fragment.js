export const fragmentShaderSource =
`
precision highp float;
varying vec4 color;
void main() {
    gl_FragColor = color;
}`;

export const textFragmentShaderSource =
`
#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform sampler2D u_texture;
varying vec2 v_texCoord;
void main() {
    // float sample = texture2D(u_texture, v_texCoord).r;
    // float scale = 1.0 / fwidth(sample);
    // float signedDistance = (sample - 0.5) * scale;
    // float color = clamp(signedDistance + 0.5, 0.0, 1.0);
    // float alpha = clamp(signedDistance + 0.5 + scale * 0.125, 0.0, 1.0);
    // gl_FragColor = vec4(color, color, color, 1) * alpha;
    vec4 texColor = texture2D(u_texture, v_texCoord);
    if (texColor.r < 0.1 && texColor.g < 0.1 && texColor.b < 0.1)
        discard;
    else if (texColor.r > 0.5 && texColor.g > 0.5 && texColor.b > 0.5)
        texColor = vec4(0, 0, 0, 1);
    gl_FragColor = texColor;
}
`;