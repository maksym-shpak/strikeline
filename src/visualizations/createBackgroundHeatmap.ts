import { Regl } from 'regl'

type BackgroundHeatmapParams = {
    data: { strike: number; gamma: number }[]
    width: number
    height: number
    dpr: number
}

export const createBackgroundHeatmap = (regl: Regl, { data, width, height, dpr }: BackgroundHeatmapParams) => {
    const minStrike = Math.min(...data.map(p => p.strike))
    const maxStrike = Math.max(...data.map(p => p.strike))
    const maxAbsGamma = Math.max(...data.map(p => Math.abs(p.gamma))) || 1

    const xScale = (strike: number) =>
        ((strike - minStrike) / (maxStrike - minStrike)) * width * dpr

    const gammaByX = data.map(point => ({
        x: xScale(point.strike),
        gamma: point.gamma,
    }))

    const positions: number[][] = []
    const gammas: number[] = []

    gammaByX.forEach(({ x, gamma }) => {
        positions.push([x, 0])
        gammas.push(gamma)
        positions.push([x, height * dpr])
        gammas.push(gamma)
    })

    return regl({
        vert: `
      precision mediump float;
      attribute vec2 position;
      attribute float gamma;
      varying float vGamma;
      uniform float uWidth, uHeight;
      void main() {
        float x = (position.x / uWidth) * 2.0 - 1.0;
        float y = (position.y / uHeight) * 2.0 - 1.0;
        vGamma = gamma;
        gl_Position = vec4(x, y, 0, 1);
      }
    `,
        frag: `
      precision mediump float;
      varying float vGamma;
      uniform float uMinGamma;
      uniform float uMaxGamma;

      vec3 colormap(float g) {
        float norm = clamp((g - uMinGamma) / (uMaxGamma - uMinGamma), 0.0, 1.0);
        float t = norm;

        vec3 minColor = vec3(1.0, 0.15, 0.57); // #ff2591
        vec3 midColor = vec3(0.05, 0.05, 0.05); // #0c0c0c
        vec3 maxColor = vec3(0.77, 0.22, 1.0); // #c539ff

        if (t < 0.5) {
          float tt = t * 2.0;
          return mix(minColor, midColor, tt);
        } else {
          float tt = (t - 0.5) * 2.0;
          return mix(midColor, maxColor, tt);
        }
      }

      void main() {
        vec3 color = colormap(vGamma);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
        attributes: {
            position: positions,
            gamma: gammas,
        },
        count: positions.length,
        primitive: 'triangle strip',
        uniforms: {
            uWidth: width * dpr,
            uHeight: height * dpr,
            uMinGamma: -maxAbsGamma,
            uMaxGamma: maxAbsGamma,
        },
    })
}
