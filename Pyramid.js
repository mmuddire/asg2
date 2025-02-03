class Pyramid {
    constructor() {
        this.type = 'pyramid';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Base 
        drawTriangle3D([ -0.5,-0.5,0.0,  0.5,-0.5,0.0, 0.0,0.5,0.0 ]);
        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        
        // Front face
        drawTriangle3D([ -0.5, -0.5, 0.0,  0.5, -0.5, 0.0,  0.0, 0.0, 0.7 ]);
        
        // Left face
        drawTriangle3D([ -0.5, -0.5, 0.0,  0.0, 0.5, 0.0,  0.0, 0.0, 0.7 ]);
        gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
        
        // Right face
        drawTriangle3D([ 0.5, -0.5, 0.0,  0.0, 0.5, 0.0,  0.0, 0.0, 0.7 ]);
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    }
}