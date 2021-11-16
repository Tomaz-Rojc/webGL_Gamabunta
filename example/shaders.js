const vertex = `#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec4 aNormal;

uniform mat4 uVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uMMatrix;
uniform mat4 uNMatrix;
uniform mat4 lightProj;
uniform mat4 lightView;




out vec2 vTexCoord;
out vec4 vNormal;
out vec3 vVertexPos;
out vec3 vLightPos;

out vec4 vProjectedTexCoord;

void main() {
    vTexCoord = aTexCoord;

    vec4 worldPos = uMMatrix * aPosition;

    vVertexPos = worldPos.xyz;

    //vLightPos = (uMMatrix * vec4(lightPos, 1.0)).xyz;

    vProjectedTexCoord = lightProj * lightView * worldPos;

    gl_Position = uPMatrix * uVMatrix * worldPos;


    vNormal = uNMatrix * aNormal;
}
`;

const fragment = `#version 300 es
precision mediump float;

uniform mediump sampler2D uTexture;
uniform mediump sampler2D uDepth;


uniform vec3 lightColor;
uniform vec3 uDirLight;
uniform vec3 uDirColor;
uniform vec3 lightPos;
uniform float shinnines;
uniform float flicker;

in vec2 vTexCoord;
in vec4 vNormal;
in vec3 vVertexPos;
in vec3 vLightPos;

in vec4 vProjectedTexCoord;


out vec4 oColor;


void main() {

    vec3 projCoords = vProjectedTexCoord.xyz / vProjectedTexCoord.w;
    
    projCoords = projCoords * 0.5 + 0.5;

    float closestDepth = texture(uDepth, projCoords.xy).r;

    float currentDepth = projCoords.z;

    float shadow = currentDepth > closestDepth  ? 1.0 : 0.0;


    vec3 N = normalize(vNormal).xyz;
    vec3 L = normalize(vLightPos - vVertexPos);
    vec3 D = normalize(uDirLight);

    vec3 ambient = vec3(0.1, 0.1, 0.1);

    float lambertian = max(dot(L, N), 0.0);
    float lambertian2 = max(dot(D, N), 0.0);

    float specular = 0.0;

    if(lambertian > 0.0) {
      vec3 R = reflect(-L, N);      // Reflected light vector
      vec3 V = normalize(-vVertexPos); // Vector to viewer
      // Compute the specular term
      float specAngle = max(dot(R, V), 0.0);
      specular = pow(specAngle, shinnines);
    }



    vec3 color = ambient + (lambertian * lightColor + specular * lightColor) * flicker;
    vec3 tex = texture(uTexture, vTexCoord).xyz;
    oColor = vec4((color * tex +  (lambertian2 * uDirColor) * tex) , 1.0);
}
`;

const depthv = `#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec4 aNormal;

uniform mat4 uVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uMMatrix;


void main() {
    gl_Position = uPMatrix * uVMatrix * uMMatrix * aPosition;
    //uPos = uVMatrix * uMMatrix * aPosition;
}
`;

const depthf = `#version 300 es
precision highp float;

layout(location = 0) out float fragmentdepth;

void main() {
    fragmentdepth = gl_FragCoord.z;
}
`;

const waterv = `#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec4 aNormal;

uniform mat4 uVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uMMatrix;
uniform mat4 uNMatrix;
uniform mat4 uShadowTex;

uniform vec3 lightPos;
uniform float t;


out vec2 vTexCoord;
out vec4 vNormal;
out vec3 vVertexPos;
out vec3 vLightPos;

out vec4 vProjectedTexCoord;


float rand(vec2 co){
    return sin(dot(co, vec2(0, 0)) * t * 360.0);
}


void main() {
    vTexCoord = aTexCoord;

    vec4 worldPos = uMMatrix * aPosition;

    vVertexPos = worldPos.xyz;

    vLightPos = (uMMatrix * vec4(lightPos, 1.0)).xyz;

    vProjectedTexCoord = uShadowTex * uMMatrix * aPosition;

    gl_Position = uPMatrix * uVMatrix * worldPos;


    //vNormal = vec4(rand(aNormal.xy), rand(aNormal.xz), rand(aNormal.yz), 1.0);
    vNormal = aNormal;
}
`;

const waterf = `#version 300 es
precision mediump float;

uniform mediump sampler2D uTexture;
uniform mediump sampler2D uDepth;


uniform vec3 lightColor;
uniform vec3 uDirLight;
uniform vec3 uDirColor;


in vec2 vTexCoord;
in vec4 vNormal;
in vec3 vVertexPos;
in vec3 vLightPos;

in vec4 vProjectedTexCoord;


out vec4 oColor;


void main() {

    vec3 projCoords = vProjectedTexCoord.xyz / vProjectedTexCoord.w;
    // transform to [0,1] range
    projCoords = projCoords * 0.5 + 0.5;
    // get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)
    float closestDepth = texture(uDepth, projCoords.xy).r;
    // get depth of current fragment from light's perspective
    float currentDepth = projCoords.z;
    // check whether current frag pos is in shadow
    float shadow = currentDepth > closestDepth  ? 1.0 : 0.0;


    vec3 N = normalize(vNormal).xyz;
    vec3 L = normalize(vLightPos - vVertexPos);
    vec3 D = normalize(uDirLight);

    vec3 ambient = vec3(0.1, 0.1, 0.1);

    float lambertian = max(dot(L, N), 0.0);
    float lambertian2 = max(dot(D, N), 0.0);

    float specular = 0.0;

    if(lambertian > 0.0) {
      vec3 R = reflect(-L, N);      // Reflected light vector
      vec3 V = normalize(-vVertexPos); // Vector to viewer
      // Compute the specular term
      float specAngle = max(dot(R, V), 0.0);
      specular = pow(specAngle, 100.0);
    }



    vec3 color = ambient + lambertian * lightColor  + specular * lightColor;
    vec3 tex = texture(uTexture, vTexCoord).xyz;
    oColor = vec4((color * tex +  (lambertian2 * uDirColor) * tex), 1.0);
}
`;


export default {
    simple: { vertex: vertex, fragment: fragment },
    depth: { vertex: depthv, fragment: depthf },
    water: {vertex: waterv, fragment: waterf}
};
