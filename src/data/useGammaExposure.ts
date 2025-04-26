import { useEffect, useRef, useState } from 'react'

type GammaPoint = {
    strike: number
    gamma: number
}

const STRIKE_MIN = 4000
const STRIKE_MAX = 6200
const STEP = 25
const BASE_VOL = 40_000_000

const generateInitialGamma = (spot: number): GammaPoint[] => {
    const result: GammaPoint[] = []
    for (let strike = STRIKE_MIN; strike <= STRIKE_MAX; strike += STEP) {
        const distance = Math.abs(strike - spot)
        const wave = Math.sin((strike - spot) / 100) * 0.6 + Math.cos((strike - spot) / 200) * 0.4
        const decay = Math.exp(-Math.pow(distance / 500, 2))
        const noise = (Math.random() - 0.5) * 0.2
        const gamma = BASE_VOL * decay * wave * (1 + noise)
        result.push({ strike, gamma })
    }
    return result
}

export const useGammaExposure = (interval = 100): GammaPoint[] => {
    const [data, setData] = useState<GammaPoint[]>([])
    const ref = useRef<GammaPoint[]>([])

    useEffect(() => {
        const spot = 5200 + Math.sin(Date.now() / 1000) * 150
        const initial = generateInitialGamma(spot)
        ref.current = initial
        setData(initial)

        const update = () => {
            const copy = [...ref.current]
            for (let i = 0; i < 10; i++) {
                const idx = Math.floor(Math.random() * copy.length)
                const delta =
                    (Math.random() - 0.5) * (1_000_000 + Math.random() * 2_000_000) // simulate trade impact
                copy[idx] = {
                    ...copy[idx],
                    gamma: copy[idx].gamma + delta,
                }
            }
            ref.current = copy
            setData(copy)
        }

        const id = setInterval(update, interval)
        return () => clearInterval(id)
    }, [interval])

    return data
}
