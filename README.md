#dckp-gl

A low-level webgl framework based off of [twgl](https://github.com/greggman/twgl.js).
      
##Examples

Camera controls in each example: WASD to move, Arrow keys to rotate.

###[Basic](https://plefferts.github.io/dkcp-gl/examples/basic/)

Basic example - 4 single-sided quads in space representing the x, y, and z axes and the origin.

###[Transforms](https://plefferts.github.io/dkcp-gl/examples/transforms/)

Basic example but with a rotation animation applied.  Orientation is sent to the gpu every frame as a 4x4 matrix.

###[Environment](https://plefferts.github.io/dkcp-gl/examples/environment/)

Basic example with an environment background (cube framebuffer with an rgb gradient mapped to xyz).

###[Sprite](https://plefferts.github.io/dkcp-gl/examples/sprite/)

Sprite example - 3 single-sided quads from a partially transparent texture and a 4th that always faces the camera.

###[Add/Remove](https://plefferts.github.io/dkcp-gl/examples/addremove/)

Quads are allocated and deallocated each frame.

###[Noise](https://plefferts.github.io/dkcp-gl/examples/noise/)

Noise example - Viewport shows a cross-section of 3d simplex noise.

###[Geodesic](https://plefferts.github.io/dkcp-gl/examples/geodesic/)

Two geodesics (11 subdivisions) with a random color per vertex.

##Compiling

    ./node_modules/webpack/bin/webpack.js