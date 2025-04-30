import { Regl } from 'regl'

type VolatilityMarkerParams = {
    strike: number
    width: number
    height: number
    dpr: number
    data: { strike: number; gamma: number }[]
    color: [number, number, number, number]
}

export const createVolatilityMarker = (regl: Regl, {
    strike, width, height, dpr, data, color,
}: VolatilityMarkerParams) => {
    const minStrike = Math.min(...data.map(p => p.strike))
    const maxStrike = Math.max(...data.map(p => p.strike))
    const xScale = (s: number) =>
        ((s - minStrike) / (maxStrike - minStrike)) * width * dpr

    const x = xScale(strike)

    return regl({
        vert: `
      precision mediump float;
      attribute vec2 position;
      uniform vec2 uResolution;
      void main() {
        vec2 zeroToOne = position / uResolution;
        vec2 clipSpace = zeroToOne * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
      }
    `,
        frag: `
      precision mediump float;
      uniform vec4 uColor;
      void main() {
        gl_FragColor = uColor;
      }
    `,
        attributes: {
            position: [
                [x, 0],
                [x, height * dpr],
            ],
        },
        count: 2,
        primitive: 'lines',
        uniforms: {
            uResolution: [width * dpr, height * dpr],
            uColor: color,
        },
    })
}
