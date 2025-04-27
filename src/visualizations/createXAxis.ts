import { Regl } from 'regl'

type XAxisParams = {
    width: number
    height: number
    dpr: number
    y: number
}

export const createXAxis = (regl: Regl, { width, height, dpr, y }: XAxisParams) => {
    return regl({
        vert: `
      precision mediump float;
      attribute vec2 position;
      uniform vec2 uResolution;
      void main() {
        vec2 zeroToOne = position / uResolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
      }
    `,
        frag: `
      precision mediump float;
      void main() {
        gl_FragColor = vec4(0.5, 0.5, 0.5, 0.8);
      }
    `,
        attributes: {
            position: [
                [0, y],
                [width * dpr, y],
            ],
        },
        count: 2,
        primitive: 'lines',
        uniforms: {
            uResolution: [width * dpr, height * dpr],
        },
    })
}
