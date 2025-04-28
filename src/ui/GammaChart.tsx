import { useEffect, useRef, useState } from 'react'
import reglConstructor from 'regl'
import { useGammaExposure } from '../data/useGammaExposure'
import { createBackgroundHeatmap } from '../visualizations/createBackgroundHeatmap'
import { createXAxis } from '../visualizations/createXAxis'
import { createGammaLine } from '../visualizations/createGammaLine'
import { createGammaGlow } from '../visualizations/createGammaGlow'
import { createStrikeMarkers } from '../visualizations/createStrikeMarkers'
import { createLastCloseLine } from '../visualizations/createLastCloseLine'


const GammaChart = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const data = useGammaExposure(200)
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    })

    const [lastClose, setLastClose] = useState<number | null>(null)

    useEffect(() => {
        if (data.length === 0 || lastClose !== null) return

        const maxGammaPoint = data.reduce((prev, curr) =>
            Math.abs(curr.gamma) > Math.abs(prev.gamma) ? curr : prev
        )

        const range = 50 // діапазон навколо найбільшого gamma
        const minStrike = maxGammaPoint.strike - range
        const maxStrike = maxGammaPoint.strike + range

        const randomClose = minStrike + Math.random() * (maxStrike - minStrike)
        setLastClose(randomClose)
    }, [data, lastClose])

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || data.length === 0) return

        const { width, height } = dimensions
        const dpr = window.devicePixelRatio || 1
        canvas.width = width * dpr
        canvas.height = height * dpr
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`

        const regl = reglConstructor({ canvas })

        const backgroundHeatmap = createBackgroundHeatmap(regl, { data, width, height, dpr })
        const xAxis = createXAxis(regl, { width, height, dpr, y: height * dpr / 2 })
        const gammaGlow = createGammaGlow(regl, { data, width, height, dpr })
        const gammaLine = createGammaLine(regl, { data, width, height, dpr })
        const strikeMarkers = createStrikeMarkers(regl, { data, width, height, dpr })
        const lastCloseLine = createLastCloseLine(regl, { lastClose, width, height, dpr, data })


        regl.clear({ color: [0, 0, 0, 1], depth: 1 })
        regl._gl.enable(regl._gl.BLEND)
        regl._gl.blendFunc(regl._gl.SRC_ALPHA, regl._gl.ONE_MINUS_SRC_ALPHA)

        xAxis()
        strikeMarkers()

        gammaGlow({ expand: 3, alpha: 0.05 })
        gammaGlow({ expand: 2, alpha: 0.1 })
        gammaGlow({ expand: 1, alpha: 0.2 })
        gammaLine()
        lastCloseLine()


        backgroundHeatmap()

        return () => {
            regl.destroy()
        }
    }, [data, dimensions])

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full block"
        />
    )
}

export default GammaChart
