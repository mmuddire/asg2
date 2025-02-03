class Sphere {
    constructor() {
        this.type = 'sphere';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.radius = 0.5;
        this.latSegments = 15;
        this.lonSegments = 15;
        this.matrix = new Matrix4();
        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.indexCount = 0;
        
        this.generateGeometry();
    }

    generateGeometry() {
        const vertices = [];
        const indices = [];
        const latSegments = this.latSegments;
        const lonSegments = this.lonSegments;

        for (let lat = 0; lat <= latSegments; lat++) {
            const theta = lat * Math.PI / latSegments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let lon = 0; lon <= lonSegments; lon++) {
                const phi = lon * 2 * Math.PI / lonSegments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                vertices.push(
                    cosPhi * sinTheta,  // X
                    cosTheta,           // Y
                    sinPhi * sinTheta   // Z
                );
            }
        }

        for (let lat = 0; lat < latSegments; lat++) {
            for (let lon = 0; lon < lonSegments; lon++) {
                const first = (lat * (lonSegments + 1)) + lon;
                const second = first + lonSegments + 1;

                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        
        this.indexCount = indices.length;
    }

    render() {
        const transform = new Matrix4(this.matrix)
            .translate(this.position[0], this.position[1], this.position[2])
            .scale(this.radius, this.radius, this.radius);

        gl.uniform4fv(u_FragColor, this.color);
        gl.uniformMatrix4fv(u_ModelMatrix, false, transform.elements);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    }
}