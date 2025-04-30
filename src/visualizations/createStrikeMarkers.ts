import { Regl } from 'regl'

type StrikeMarkersParams = {
  data: { strike: number; gamma: number }[]
  width: number
  height: number
  dpr: number
}

export const createStrikeMarkers = (regl: Regl, { data, width, height, dpr }: StrikeMarkersParams) => {
  const minStrike = Math.min(...data.map(p => p.strike))
  const maxStrike = Math.max(...data.map(p => p.strike))

  const baseY = height * dpr / 2
  const markerSize = 6 * dpr

  const xScale = (strike: number) =>
    ((strike - minStrike) / (maxStrike - minStrike)) * width * dpr

  const positions: number[][] = []

  data.forEach(point => {
    const x = xScale(point.strike)
    positions.push([x, baseY - markerSize / 2])
    positions.push([x, baseY + markerSize / 2])
  })

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
        gl_FragColor = vec4(0.7, 0.7, 0.7, 0.7);
      }
    `,
    attributes: {
      position: positions,
    },
    count: positions.length,
    primitive: 'lines',
    uniforms: {
      uResolution: [width * dpr, height * dpr],
    },
  })
}
