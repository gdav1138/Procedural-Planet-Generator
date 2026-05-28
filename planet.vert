// make this 120 for the mac:
#version 330 compatibility

// out variables to be interpolated in the rasterizer and sent to each fragment shader:

out  vec2  vST;	  // (s,t) texture coordinates
out  vec3  vN;	  // normal vector
out  vec3  vL;	  // vector from point to light
out  vec3  vE;	  // vector from point to eye
out  vec3  vMC;	  // model coordinates
out float  vLM;   // Help detect what is "land" displacements
out float  vEL;   // Used to determine elevation

// where the light is:

uniform float uNoiseAmp;  // Assist in controlling height of the continents
uniform float uNoiseFreq;
uniform float uAd, uBd, uTol;

const vec3 LIGHTPOSITION = vec3(  5., 5., 0. );

float noise(vec3 p) {
	return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

// Function for the ellipses, rather than including all the code inside main
float ellipse(vec2 st, float uAd, float uBd, float uTol, vec3 noiseMC) {
	float aR = uAd/2.;
	float bR = uBd/2.;
	int numins = int( st.s / uAd );
	int numint = int( st.t / uBd );
	float sC = numins * uAd + aR;
	float tC = numint * uBd + bR;
	float ds = st.s - sC;
	float dt = st.t - tC;

	float d = (ds*ds)/(aR*aR) + (dt*dt)/(bR*bR);

	// Use noise on the ellipse to break and distort them
	float noiseFactor = noise(noiseMC * 10.0);
	d += (noiseFactor - 0.5) * 0.6;

	return smoothstep( 1.-uTol, 1.+uTol, d );
}

void
main( )
{
	vST = gl_MultiTexCoord0.st;
	vMC = gl_Vertex.xyz;

	// Use noise to break and distort ellipse
	vec3 noiseMC = vMC * uNoiseFreq;

	// Use ellipses function to help detect what is "land"
	vLM = ellipse(vST, uAd, uBd, uTol, noiseMC);

	// Apply displacement only where there is "land"
	float displacement = noise(vMC * uNoiseFreq) * uNoiseAmp * (1.0 - vLM);

	// Store the elevation for use in the fragment shader
	vEL = displacement;

	vec3 displacedPOS = vMC + displacement * normalize(gl_Normal);  // Apply displacement along the normals

	vec4 ECposition = gl_ModelViewMatrix * vec4(displacedPOS, 1.0);			// eye coordinate position
	vN = normalize( gl_NormalMatrix * gl_Normal );							// normal vector
	vL = LIGHTPOSITION - ECposition.xyz;									// vector from the point to the light position
	vE = vec3( 0., 0., 0. ) - ECposition.xyz;								// vector from the point to the eye position
	gl_Position = gl_ModelViewProjectionMatrix * vec4(displacedPOS, 1.0);
}
