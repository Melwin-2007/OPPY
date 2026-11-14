import * as THREE from 'three';

export interface WheelUniforms {
  uWheelAngle: { value: number };
}

export function injectWheelRotationShader(
  material: THREE.MeshStandardMaterial,
  uniforms: WheelUniforms
): void {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWheelAngle = uniforms.uWheelAngle;

    shader.vertexShader = `
      uniform float uWheelAngle;

      void rotateWheelAxle(inout vec3 pos, inout vec3 norm, vec3 hubCenter, float angle) {
        float dx = abs(pos.x - hubCenter.x);
        float dyz = length(vec2(pos.y - hubCenter.y, pos.z - hubCenter.z));
        if (dx < 0.14 && dyz < 0.165) {
          float cy = pos.y - hubCenter.y;
          float cz = pos.z - hubCenter.z;
          float cosA = cos(angle);
          float sinA = sin(angle);
          pos.y = hubCenter.y + (cy * cosA - cz * sinA);
          pos.z = hubCenter.z + (cy * sinA + cz * cosA);
          float ny = norm.y;
          float nz = norm.z;
          norm.y = ny * cosA - nz * sinA;
          norm.z = ny * sinA + nz * cosA;
        }
      }
    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      rotateWheelAxle(transformed, transformedNormal, vec3(-0.520, 0.151,  0.605), uWheelAngle);
      rotateWheelAxle(transformed, transformedNormal, vec3( 0.522, 0.151,  0.605), uWheelAngle);
      rotateWheelAxle(transformed, transformedNormal, vec3(-0.525, 0.127, -0.065), uWheelAngle);
      rotateWheelAxle(transformed, transformedNormal, vec3( 0.525, 0.127, -0.065), uWheelAngle);
      rotateWheelAxle(transformed, transformedNormal, vec3(-0.531, 0.140, -0.606), uWheelAngle);
      rotateWheelAxle(transformed, transformedNormal, vec3( 0.528, 0.145, -0.606), uWheelAngle);
      `
    );
  };
}
