import { Regl } from 'regl'

type GammaLineParams = {
    data: { strike: number; gamma: number }[]
    width: number
    height: number
    dpr: number
}

export const createGammaLine = (regl: Regl, { data, width, height, dpr }: GammaLineParams) => {
    const minStrike = Math.min(...data.map(p => p.strike))
    const maxStrike = Math.max(...data.map(p => p.strike))
    const maxAbsGamma = Math.max(...data.map(p => Math.abs(p.gamma))) || 1
    const baseY = height * dpr / 2

    const xScale = (strike: number) =>
        ((strike - minStrike) / (maxStrike - minStrike)) * width * dpr

    const yScale = (gamma: number) =>
        baseY - (gamma / maxAbsGamma) * baseY

    const positions = data.map(point => [
        xScale(point.strike),
        yScale(point.gamma),
    ])

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
        gl_FragColor = vec4(0.1, 0.9, 0.9, 1);
      }
    `,
        attributes: {
            position: positions,
        },
        count: positions.length,
        primitive: 'line strip',
        uniforms: {
            uResolution: [width * dpr, height * dpr],
        },
    })
}
