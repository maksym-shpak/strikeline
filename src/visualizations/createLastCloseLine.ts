import { Regl } from 'regl'

type LastCloseLineParams = {
  lastClose: number | null
  width: number
  height: number
  dpr: number
  data: { strike: number; gamma: number }[]
}

export const createLastCloseLine = (regl: Regl, { lastClose, width, height, dpr, data }: LastCloseLineParams) => {
  const minStrike = Math.min(...data.map(p => p.strike))
  const maxStrike = Math.max(...data.map(p => p.strike))

  const xScale = (strike: number) =>
    ((strike - minStrike) / (maxStrike - minStrike)) * width * dpr

  const x = xScale(lastClose || 0)

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
        gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
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
    },
  })
}
