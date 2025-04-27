import { Regl } from 'regl'

type GammaGlowParams = {
    data: { strike: number; gamma: number }[]
    width: number
    height: number
    dpr: number
}

export const createGammaGlow = (regl: Regl, { data, width, height, dpr }: GammaGlowParams) => {
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
      uniform float uExpand;
      void main() {
        vec2 pos = position;
        pos.y += uExpand;
        vec2 zeroToOne = pos / uResolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
      }
    `,
        frag: `
      precision mediump float;
      uniform float uAlpha;
      void main() {
        vec3 glowColor = vec3(1.0, 1.0, 1.0);
        gl_FragColor = vec4(glowColor, uAlpha);
      }
    `,
        attributes: {
            position: positions,
        },
        count: positions.length,
        primitive: 'line strip',
        uniforms: {
            uResolution: [width * dpr, height * dpr],
            uExpand: regl.prop<{ expand: number; alpha: number }, 'expand'>('expand'),
            uAlpha: regl.prop<{ expand: number; alpha: number }, 'alpha'>('alpha'),
        },
    })
}
