var chart = LightweightCharts.createChart(
    document.getElementById("chart"),
    window.TradingApp_Settings_Tradingview.chartSettings
);

var candleSeries = chart.addCandlestickSeries(window.TradingApp_Settings_Tradingview.candlestickSeriesSettings);
var vwapSeries = chart.addLineSeries({
    color: '#6a1b9a',
    lineWidth: 1,
    crosshairMarkerVisible: false
});

function myClickHandler(param) {
    if (!param.point) {
        return;
    }

    console.log(`Click at ${param.point.x}, ${param.point.y}. The time is ${param.time}.`);
    console.log(param.time)
}

chart.subscribeClick(myClickHandler);

function myKeyDownHandler(param) {
    console.log(param)
}

document.getElementById("chart").addEventListener('keydown', myKeyDownHandler);

function myCrosshairMoveHandler(param) {
    console.log(param);
    if (!param.point) {
        return;
    }

    console.log(`Crosshair moved to ${param.point.x}, ${param.point.y}. The time is ${param.time}.`);
}

chart.subscribeClick(myCrosshairMoveHandler);
let openingCandle;
window.TradingApp.DB.initialize();

let candles = window.TradingApp.DB.candles;
let vwap = window.TradingApp.DB.vwap;
vwapSeries.setData(vwap);
console.log(vwap)
for (let i = 0; i < candles.length; i++) {
    let d = new Date(candles[i].time * 1000);
    // UTC 22:30 is market open time
    if (d.getHours() == 22 && d.getMinutes() == 30) {
        openingCandle = candles[i];
    }
}

candleSeries.setData(candles);
window.TradingApp.Indicators.openRangeBreakoutPriceLines(openingCandle).forEach(priceLine => {
    candleSeries.createPriceLine(priceLine);
});
let lastCandle = candles[candles.length - 1];
let lastCandleClose = lastCandle.close;

setInterval(function () {
    lastCandle.close = lastCandleClose + Math.random() - 0.5;
    lastCandle.high = Math.max(lastCandle.high, lastCandle.close);
    lastCandle.low = Math.min(lastCandle.low, lastCandle.close);
    candleSeries.update(lastCandle);
}, 200);