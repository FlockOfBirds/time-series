import { select, time } from "d3";
import { LineChart, Nvd3ResizeHandler, addGraph, models, utils } from "nvd3";
import { Component, DOM } from "react";

import { Series } from "./TimeSeries";

import "nvd3/build/nv.d3.css";

interface Nvd3LineChartProps {
    forceY?: number[];
    height?: number;
    width?: number;
    chartProps: ChartProps;
    datum: Series[];
}

interface ChartProps {
    xAxis: Axis;
    xScale: time.Scale<number, number>;
    yAxis: Axis;
}

interface Axis {
    axisLabel?: string;
    showMaxMin?: boolean;
    tickFormat: (d: number) => string;
}

class NVD3LineChart extends Component<Nvd3LineChartProps, {}> {
    static defaultProps: Partial<Nvd3LineChartProps> = { datum: [] };
    private chart: LineChart;
    private resizeHandler: Nvd3ResizeHandler;
    private svg: Node;
    private intervalID: number | null;

    render() {
        const style = {
            height: this.props.height,
            width: this.props.width
        };

        return DOM.div({ className: "widget-time-series nv-chart", style },
            DOM.svg({ ref: node => this.svg = node })
        );
    }

    componentDidMount() {
        addGraph(() => this.renderChart());
        this.fixChartRendering();
    }

    componentDidUpdate() {
        this.renderChart();
    }

    componentWillUnmount() {
        if (this.resizeHandler) {
            this.resizeHandler.clear();
        }
    }

    private renderChart() {
        this.chart = this.chart || models.lineChart();
        this.configureChart(this.chart, this.props.chartProps);

        this.chart.showLegend(true)
            .showXAxis(true)
            .showYAxis(true)
            .useInteractiveGuideline(true)
            .duration(350)
            .forceY(this.props.forceY || []);

        select(this.svg).datum(this.props.datum).call(this.chart);

        if (!this.resizeHandler) {
            this.resizeHandler = utils.windowResize(() => {
                if (this.chart.update) this.chart.update();
            });
        }

        return this.chart;
    }

    private fixChartRendering() {
        this.intervalID = setInterval(() => {
            if (this.svg && this.svg.parentElement && this.svg.parentElement.offsetHeight !== 0 && this.intervalID) {
                if (this.chart.update) this.chart.update();
                clearInterval(this.intervalID);
                this.intervalID = null;
            }

            select(window).on("mouseout." + this.chart.id(), () => {
                setTimeout(() => {
                this.chart.tooltip.hidden(true);
                this.chart.interactiveLayer.tooltip.hidden(true);
                }, 1000);
            });
            select(window).on("touchstart." + this.chart.id(), () => {
                setTimeout(() => {
                this.chart.tooltip.hidden(true);
                this.chart.interactiveLayer.tooltip.hidden(true);
                }, 1000);
            });
            
        }, 100);
    }

    private isPlainObject(object: any): boolean {
        if (typeof object === "object" && object !== null) {
            const proto = Object.getPrototypeOf(object);
            return proto === Object.prototype || proto === null;
        }

        return false;
    }

    private configureChart(chart: any, options: any) {
        for (const optionName in options) {
            if (options.hasOwnProperty(optionName)) {
                const optionValue = options[optionName];
                if (this.isPlainObject(optionValue)) {
                    this.configureChart(chart[optionName], optionValue);
                } else if (typeof chart[optionName] === "function") {
                    chart[optionName](optionValue);
                }
            }
        }
    }
}

export { Axis, ChartProps, NVD3LineChart, Nvd3LineChartProps };