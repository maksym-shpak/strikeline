import { useMemo } from "react";

export const useVolatilityPoints = (data: { strike: number; gamma: number }[]) => {
    return useMemo(() => {
        if (data.length < 2) return { high: null, low: null }

        const diffs = data.slice(1).map((point, i) => ({
            strike: point.strike,
            dGamma: (point.gamma - data[i].gamma) / (point.strike - data[i].strike),
        }))

        const high = diffs.reduce((a, b) =>
            Math.abs(b.dGamma) > Math.abs(a.dGamma) ? b : a
        )

        const low = diffs.reduce((a, b) =>
            Math.abs(b.dGamma) < Math.abs(a.dGamma) ? b : a
        )

        return { high, low }
    }, [data])
}
