import { useEffect, useRef, useState } from 'react'
import reglConstructor from 'regl'
import { useGammaExposure } from '../data/useGammaExposure'
import { createBackgroundHeatmap } from '../visualizations/createBackgroundHeatmap'

const GammaChart = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const data = useGammaExposure(200)

    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    })

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

        const drawBackgroundHeatmap = createBackgroundHeatmap(regl, {
            data,
            width,
            height,
            dpr,
        })

        regl.clear({ color: [0, 0, 0, 1], depth: 1 })
        drawBackgroundHeatmap()

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
