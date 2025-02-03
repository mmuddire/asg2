class Sphere {
    constructor() {
        this.type = 'sphere';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.radius = 0.5;
        this.latSegments = 20;  // Latitude segments
        this.lonSegments = 30;  // Longitude segments
        this.matrix = new Matrix4();
    }

    render() {
        const rgba = this.color;
        const latSegments = this.latSegments;
        const lonSegments = this.lonSegments;
        const radius = this.radius;
        const pos = this.position;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Iterate over latitude segments
        for (let lat = 0; lat <= latSegments; lat++) {
            let theta1 = (lat / latSegments) * Math.PI;
            let theta2 = ((lat + 1) / latSegments) * Math.PI;

            let sinTheta1 = Math.sin(theta1);
            let cosTheta1 = Math.cos(theta1);
            let sinTheta2 = Math.sin(theta2);
            let cosTheta2 = Math.cos(theta2);

            // Iterate over longitude segments
            for (let lon = 0; lon <= lonSegments; lon++) {
                let phi1 = (lon / lonSegments) * 2 * Math.PI;
                let phi2 = ((lon + 1) / lonSegments) * 2 * Math.PI;

                let sinPhi1 = Math.sin(phi1);
                let cosPhi1 = Math.cos(phi1);
                let sinPhi2 = Math.sin(phi2);
                let cosPhi2 = Math.cos(phi2);

                // Define vertices for each triangle
                let v1 = [
                    pos[0] + radius * sinTheta1 * cosPhi1,
                    pos[1] + radius * cosTheta1,
                    pos[2] + radius * sinTheta1 * sinPhi1
                ];
                let v2 = [
                    pos[0] + radius * sinTheta2 * cosPhi1,
                    pos[1] + radius * cosTheta2,
                    pos[2] + radius * sinTheta2 * sinPhi1
                ];
                let v3 = [
                    pos[0] + radius * sinTheta2 * cosPhi2,
                    pos[1] + radius * cosTheta2,
                    pos[2] + radius * sinTheta2 * sinPhi2
                ];
                let v4 = [
                    pos[0] + radius * sinTheta1 * cosPhi2,
                    pos[1] + radius * cosTheta1,
                    pos[2] + radius * sinTheta1 * sinPhi2
                ];

                // Draw two triangles for each segment
                drawTriangle3D([v1[0], v1[1], v1[2], v2[0], v2[1], v2[2], v3[0], v3[1], v3[2]]);
                drawTriangle3D([v1[0], v1[1], v1[2], v3[0], v3[1], v3[2], v4[0], v4[1], v4[2]]);
            }
        }
    }
}
