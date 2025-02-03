class Cylinder {
    constructor() {
        this.type = 'cylinder';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.segments = 50;
    }

    render() {
        const rgba = this.color;
        const segments = this.segments;
        
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        const radius = 0.5;
        const height = 1.0;
        const angleStep = 360 / segments;

        // Draw side surface
        for (let angle = 0; angle < 360; angle += angleStep) {
            const angle1 = angle * Math.PI / 180;
            const angle2 = (angle + angleStep) * Math.PI / 180;

            const x1 = radius * Math.cos(angle1);
            const y1 = radius * Math.sin(angle1);
            const x2 = radius * Math.cos(angle2);
            const y2 = radius * Math.sin(angle2);

            drawTriangle3D([x1, y1, 0,  x2, y2, 0,  x2, y2, height]);
            drawTriangle3D([x1, y1, 0,  x2, y2, height,  x1, y1, height]);
        }

        // Draw top cap (lighter shade)
        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
        for (let angle = 0; angle < 360; angle += angleStep) {
            const angle1 = angle * Math.PI / 180;
            const angle2 = (angle + angleStep) * Math.PI / 180;

            const x1 = radius * Math.cos(angle1);
            const y1 = radius * Math.sin(angle1);
            const x2 = radius * Math.cos(angle2);
            const y2 = radius * Math.sin(angle2);

            drawTriangle3D([0, 0, height,  x1, y1, height,  x2, y2, height]);
        }

        // Draw bottom cap (darker shade)
        gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
        for (let angle = 0; angle < 360; angle += angleStep) {
            const angle1 = angle * Math.PI / 180;
            const angle2 = (angle + angleStep) * Math.PI / 180;

            const x1 = radius * Math.cos(angle1);
            const y1 = radius * Math.sin(angle1);
            const x2 = radius * Math.cos(angle2);
            const y2 = radius * Math.sin(angle2);

            drawTriangle3D([0, 0, 0,  x2, y2, 0,  x1, y1, 0]);
        }
    }
}