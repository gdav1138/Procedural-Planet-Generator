// make this 120 for the mac:
#version 330 compatibility

// lighting uniform variables -- these can be set once and left alone:
uniform float   uKa, uKd, uKs;	    // coefficients of each type of lighting -- make sum to 1.0
uniform vec4    uColor;		        // object color
uniform vec4    uSpecularColor;	    // light color
uniform float   uShininess;	        // specular exponent

// square-equation uniform variables -- these should be set every time Display( ) is called:

uniform float   uS0, uT0, uD;
uniform float	uAd, uBd;
uniform float   uSc, uTc;
uniform float	uTol;
uniform float   uThreshold;     // Determine a "threshold" before ocean meets land.
uniform float   uRad;           // Radius of the telescopic lens
uniform float   uMag;           // Magnification scale
uniform sampler3D Noise3;
uniform float uNoiseFreq, uNoiseAmp;

// in variables from the vertex shader and interpolated in the rasterizer:

in  vec2  vST;                  // texture coords
in  vec3  vN;                   // normal vector
in  vec3  vL;                   // vector from point to light
in  vec3  vE;                   // vector from point to eye
in  vec3  vMC;			        // model coordinates
in float  vLM;                  // Land mass variables
in float  vEL;                  // Elevation data

const vec3 PLANETCOLOR          = vec3( 0., 0.3, 1.0 );    // color to make the planet
const vec3 LANDCOLOR            = vec3( 0.4, 0.3, 0.1 );   // color to make the continents
const vec3 GRASSCOLOR           = vec3( 0.2, 0.6, 0.2 );   // color to make lower elevations into grass
const vec3 ROCKCOLOR            = vec3( 0.4, 0.3, 0.1 );   // color to make rocky terrain
const vec3 SNOWCOLOR            = vec3( 1.0, 1.0, 1.0 );   // color to make snowy areas
const vec3 SPECULARCOLOR        = vec3( 1., 1., 1. );

float noise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

void
main( )
{
    vec3 myColor;

    // If statement to help determine colors for elevation
    if (vLM < uThreshold) {
        myColor = SNOWCOLOR;
    } else if (vEL < 0.015) {
        myColor = mix(PLANETCOLOR, GRASSCOLOR, (vEL - 0.005) / 0.01);
    } else if (vEL < 0.03) {
        myColor = mix(GRASSCOLOR, ROCKCOLOR, (vEL - 0.015) / 0.015);
    } else {
        myColor = mix(ROCKCOLOR, SNOWCOLOR, (vEL - 0.03) / 0.02);
    }

//     // Compute distance from uSc and uTc
//     float dx = vST.s - uSc;
//     float dy = vST.t - uTc;
//     float dist = sqrt(dx*dx + dy*dy);
//
//     // Apply magnification effect inside uRad
//     if (dist < uRad) {
//         float magnificationScale = uMag;
//         vec2  magCoords = vec2((vST.s - uSc) * magnificationScale + uSc, (vST.t - uTc) * magnificationScale + uTc);
//
//         vec3  magColor = mix(PLANETCOLOR, SNOWCOLOR, noise(vec3(magCoords, 0.0)));
//
//         myColor = mix(myColor, magColor, 0.8);
//
//     }

	// now use myColor in the per-fragment lighting equations:

    vec3 Normal    = normalize(vN);
    vec3 Light     = normalize(vL);
    vec3 Eye       = normalize(vE);

    vec3 ambient = uKa * myColor;

    float dd = max( dot(Normal,Light), 0. );       // only do diffuse if the light can see the point
    vec3 diffuse = uKd * dd * myColor;

    float s = 0.;
    if( dd > 0. )                                  // only do specular if the light can see the point
    {
            vec3 ref = normalize(  reflect( -Light, Normal )  );
            float cosphi = dot( Eye, ref );
            if( cosphi > 0. )
                    s = pow( max( cosphi, 0. ), uShininess );
    }
    vec3 specular = uKs * s * SPECULARCOLOR.rgb;
    gl_FragColor = vec4( ambient + diffuse + specular,  1. );
}

