import { select, time } from "d3";
import { LineChart, Nvd3ResizeHandler, addGraph, models, utils } from "nvd3";
import { Component, createElement } from "react";

import { Series } from "./TimeSeries";
import { HeightUnit, WidthUnit } from "../TimeSeries";

import "nvd3/build/nv.d3.css";

interface Nvd3LineChartProps {
    forceY?: number[];
    height: number;
    width: number;
    chartProps: ChartProps;
    datum: Series[];
    heightUnit: HeightUnit;
    widthUnit: WidthUnit;
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
    private svg: SVGElement;
    private intervalID: number | null;

    render() {
        const style: {paddingBottom?: string; width: string, height?: string} = {
            width: this.props.widthUnit === "percentage" ? `${this.props.width}%` : `${this.props.width}px`
        };

        if (this.props.heightUnit === "percentageOfWidth") {
            style.paddingBottom = `${this.props.height}%`;
        } else if (this.props.heightUnit === "pixels") {
            style.paddingBottom = `${this.props.height}px`;
        } else if (this.props.heightUnit === "percentageOfParent") {
            style.height = `${this.props.height}%`;
        }

        return createElement("div", { className: "widget-time-series nv-chart", style },
            createElement("svg", { ref: node => this.svg = node as SVGElement })
        );
    }

    componentDidMount() {
        // Add height and display styles to react wrapper
        // Avoided use of clientHeight because content-area varies depending on styling.
        const reactWrapper = this.svg && this.svg.parentElement && this.svg.parentElement.parentElement;

        if (this.props.heightUnit === "percentageOfParent" && reactWrapper) {
            reactWrapper.style.height = "100%";
            reactWrapper.style.display = "flex";
        }

        addGraph(() => this.renderChart(), this.chartEvents);
        this.fixChartRendering();
    }

    componentDidUpdate() {
        this.renderChart();
    }

    componentWillUnmount() {
        this.resizeHandler.clear();
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

        if (this.props.widthUnit === "percentage") {
            select(this.svg).datum(this.props.datum).call(this.chart);
        } else {
            select(this.svg).datum(this.props.datum).call(this.chart).style({ width: this.props.width });
        }

        this.resizeHandler = utils.windowResize(() => {
            if (this.chart) this.chart.update();
        });

        return this.chart;
    }

    private chartEvents(chart: LineChart) {
        // Setup hide events for tool tip based on timer.
        // This bugs of NVD3 is showing in iOS, in some cases they stay.
        select(window).on("mouseout." + chart.id(), () => {
            setTimeout(() => {
                chart.tooltip.hidden(true);
                chart.interactiveLayer.tooltip.hidden(true);
            }, 1000);
        });

        select(window).on("touchstart." + chart.id(), () => {
            setTimeout(() => {
                chart.tooltip.hidden(true);
                chart.interactiveLayer.tooltip.hidden(true);
            }, 1000);
        });

        select(window).on("touchend." + chart.id(), () => {
            setTimeout(() => {
                chart.tooltip.hidden(true);
                chart.interactiveLayer.tooltip.hidden(true);
            }, 1000);
        });
    }

    private fixChartRendering() {
        // Fix issue in tab view the dirty way
        this.intervalID = setInterval(() => {
            if (this.svg && this.svg.parentElement && this.svg.parentElement.offsetHeight !== 0 && this.intervalID) {
                if (this.chart && this.chart.update) this.chart.update();
                clearInterval(this.intervalID);
                this.intervalID = null;
            }
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
