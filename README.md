# Procedural Planet Generator

A real-time 3D planet renderer built with OpenGL and custom GLSL shaders. The planet's continents, oceans, grasslands, rocky peaks, and snow caps are generated entirely through shader math, with no pre-built textures or heightmaps. Built as a final project for Oregon State University's Shaders course.



https://github.com/user-attachments/assets/0f217783-7839-4ba3-a3de-2701f8b763ee



## Context

This project was built on top of a course-provided OpenGL framework that handles windowing, camera controls, input, and the rendering loop (`FinalProject.cpp`). The framework also includes utility libraries for sphere generation, lighting setup, OBJ file loading, and texture handling.

**My primary contributions are the GLSL shaders** (`planet.vert` and `planet.frag`) and the `planet.glib` configuration, which together define how the planet's terrain is generated, displaced, colored, and lit. I also extended the main C++ file with keyframed animation (flight paths with pitch/yaw/roll), additional scene objects, and lighting configuration.

## How the Shaders Work

The planet starts as a smooth sphere. Everything that makes it look like a planet happens in the vertex and fragment shaders.

### Vertex Shader — Terrain Generation (`planet.vert`)

The vertex shader is responsible for determining *where* land exists and *how high* it rises:

1. **Continent placement** — An ellipse function tiles across the sphere's texture coordinates to define regions that will become land vs. ocean. Noise is applied to the ellipse boundaries to break them up into irregular, natural-looking coastlines rather than geometric shapes.

2. **Vertex displacement** — Where the ellipse function identifies "land," vertices are pushed outward along their normals by a noise-driven displacement value. This physically raises the terrain above the ocean surface, creating visible topography on the sphere's silhouette.

3. **Data passed to fragment shader** — The shader outputs the land/ocean classification (`vLM`) and the displacement amount (`vEL`) as varyings, so the fragment shader can color the surface based on what kind of terrain it is and how high it sits.

### Fragment Shader — Surface Appearance (`planet.frag`)

The fragment shader determines what each pixel *looks like* based on the data received from the vertex stage:

1. **Elevation-based coloring** — The displacement value (`vEL`) drives a series of `mix()` calls that blend between ocean blue, grassland green, rocky brown, and snow white depending on how far the vertex was displaced. Low displacement gets grass, mid-range gets rock, and high peaks get snow.

2. **Snow caps via threshold** — A separate uniform (`uThreshold`) controls a land-mass cutoff that renders as snow, allowing interactive adjustment of where snow appears on the planet.

3. **Per-fragment Phong lighting** — The standard ambient + diffuse + specular model is computed per-fragment using interpolated normals, light vectors, and eye vectors from the vertex shader. This gives the terrain realistic shading that responds to light direction.

### Shader Configuration (`planet.glib`)

The `.glib` file configures [glman](https://web.engr.oregonstate.edu/~mjb/glman/) (Oregon State's GLSL shader viewer) with uniform slider ranges so the planet's appearance can be tuned interactively at runtime, allowing for adjustments of continent size, terrain height, noise frequency, snow threshold, and lighting coefficients without the need to recompile.

## Built With

- **C++ / OpenGL** — Rendering framework and scene management (course-provided scaffolding)
- **GLSL 330** — Custom vertex and fragment shaders (my work)
- **glman** — Oregon State's shader development and viewing tool
- **GLM** — OpenGL math library for matrix and vector operations

## Key Files

| File | Description | Attribution |
|------|-------------|-------------|
| `planet.vert` | Vertex shader — terrain generation, displacement, coastline noise | My work |
| `planet.frag` | Fragment shader — elevation coloring, Phong lighting | My work |
| `planet.glib` | Shader configuration and uniform slider definitions | My work |
| `FinalProject.cpp` | Main application — scene setup, animation, rendering loop | Course framework + my extensions |
| `glm/` | OpenGL math library | Third-party library |

## Running It

This project was built to run with [glman](https://web.engr.oregonstate.edu/~mjb/glman/), Oregon State's GLSL shader viewer, on Windows. To see just the shader output:

1. Install glman from the link above
2. Open `planet.glib` in glman
3. Use the sliders to adjust terrain generation parameters in real time

To run the full scene (with animated objects, lighting, and camera controls), compile `FinalProject.cpp` with the OpenGL dependencies and run the resulting executable.

## What I Learned

This project was my introduction to thinking about rendering as a pipeline. Data flows from the vertex stage to the fragment stage, and design decisions at each step constrain what's possible at the next. Writing the terrain generation logic in the vertex shader and the coloring logic in the fragment shader forced me to think carefully about what data to compute where, what to pass between stages, and how to keep the shader math efficient enough for real-time rendering.
