window.TradingApp.Indicators = (function () {
    const redColor = '#ff4444';
    const greenColor = '#00c851';
    const blueColor = '#304ffe';
    const openRangeBreakoutPriceLines = (openingCandle) => {
        let high = openingCandle.high;
        let low = openingCandle.low;
        let range = high - low;
        let priceLines = [];

        const commonPriceLineSettings = {
            lineWidth: 2,
            lineStyle: LightweightCharts.LineStyle.Solid,
            axisLabelVisible: true
            // title: 'open price',
        };
        priceLines.push({
            price: openingCandle.open,
            color: blueColor,
            ...commonPriceLineSettings
        });
        priceLines.push({
            price: high,
            color: greenColor,
            ...commonPriceLineSettings
        });
        priceLines.push({
            price: low,
            color: redColor,
            ...commonPriceLineSettings
        });
        const dashLineSettings = {
            lineWidth: 2,
            lineStyle: LightweightCharts.LineStyle.LargeDashed,
            axisLabelVisible: false
        };
        for (let i = 1; i <= 3; i++) {
            priceLines.push({
                price: high + range * i,
                color: greenColor,
                ...dashLineSettings
            });
            priceLines.push({
                price: low - range * i,
                color: redColor,
                ...dashLineSettings
            });
        }
        return priceLines;
    };

    const createOpenRangeSeries = (chart) => {
        // add from low to high: low3R, low2R, low1R, low, open, high, high1R, ...
        let lineSeriesList = []
        const lineSettings = {
            lineWidth: 1,
            crosshairMarkerVisible: false,
            priceLineVisible: false
        }
        for (let i = 0; i < 3; i++) {
            let s = chart.addLineSeries({
                color: redColor,
                lineStyle: LightweightCharts.LineStyle.LargeDashed,
                ...lineSettings
            });
            lineSeriesList.push(s);
        }
        let colors = [redColor, blueColor, greenColor];
        colors.forEach(color => {
            lineSeriesList.push(chart.addLineSeries({
                color: color,
                lineStyle: LightweightCharts.LineStyle.Solid,
                ...lineSettings
            }));
        });
        for (let i = 0; i < 3; i++) {
            let s = chart.addLineSeries({
                color: greenColor,
                lineStyle: LightweightCharts.LineStyle.LargeDashed,
                ...lineSettings
            });
            lineSeriesList.push(s);
        }
        return lineSeriesList;
    };

    const drawIndicatorsForNewlyClosedCandle = (end, candles, widget) => {
        let threshold = 3;
        // only check after market open for now
        if (candles[end].minutesSinceMarketOpen < 0 ||
            candles[end].minutesSinceMarketOpen > 60) {
            return;
        }

        let higherLowCount = 0;
        let start = end;
        while (start - 1 >= 0) {
            if (candles[start - 1].minutesSinceMarketOpen >= 0 &&
                candles[start].low > candles[start - 1].low) {
                higherLowCount++;
            } else {
                break;
            }
            start--;
        }
        if (higherLowCount === threshold) {
            // draw first time, start from beginning.
            widget.higherLowSeries = widget.chart.addLineSeries(window.TradingApp.ChartSettings.cloudLineSettings);
            for (let i = start; i <= end; i++) {
                widget.higherLowSeries.update({
                    time: candles[i].time,
                    value: candles[i].low
                });
            }
        } else if (higherLowCount > threshold) {
            widget.higherLowSeries.update({
                time: candles[end].time,
                value: candles[end].low
            });
        }
    }

    return {
        openRangeBreakoutPriceLines,
        createOpenRangeSeries,
        drawIndicatorsForNewlyClosedCandle
    }
})();