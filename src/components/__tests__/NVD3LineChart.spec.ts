import { ShallowWrapper, shallow } from "enzyme";
import { createElement } from "react";
import { time } from "d3";
import * as nv from "nvd3";

import { NVD3LineChart, Nvd3LineChartProps } from "../NVD3LineChart";

describe("NVD3LineChart", () => {

    let chartProps: Nvd3LineChartProps = {
            chartProps: {
                xAxis: {
                    axisLabel: "Time",
                    showMaxMin: true,
                    tickFormat: (v) => v.toString()
                },
                xScale: time.scale(),
                yAxis: {
                    axisLabel: "Label",
                    tickFormat: (v) => v.toString()
                }
            },
            datum: [ {
                area: true,
                color: "F00",
                key: "Series 1",
                values: [ { x: 1, y: 5 } ]
            } ],
            height: 20,
            heightUnit: "pixels",
            width: 50,
            widthUnit: "pixels"
    };

    let renderChart: ShallowWrapper<any, any>;

    beforeEach(() => {
        renderChart = shallow(createElement(NVD3LineChart, chartProps));
    });

    it("should render a structure correctly with pixels", () => {
        expect(renderChart).toBeElement(
            createElement("div",
                { className: "widget-time-series nv-chart", style: { paddingBottom: "20px", width: "50px" } },
                createElement("svg")
            )
        );
    });

    it("should render a structure correctly with percentage", () => {
        chartProps.heightUnit = "percentageOfWidth";
        chartProps.widthUnit = "percentage";
        expect(renderChart).toBeElement(
            createElement("div",
                { className: "widget-time-series nv-chart", style: { paddingBottom: "20px", width: "50px" } },
                createElement("svg")
            )
        );
    });

    it("should render with the nv-chart class", () => {
        expect(renderChart.hasClass("nv-chart")).toBe(true);
    });

    it("should add a graph", (done) => {
        spyOn(nv, "addGraph").and.callThrough();
        spyOn(nv.models, "lineChart").and.callThrough();

        const chart = renderChart.instance() as NVD3LineChart;
        chart.componentDidMount();

        expect(nv.addGraph).toHaveBeenCalled();

        setTimeout(() => {
            expect(nv.models.lineChart).toHaveBeenCalled();

            done();
        }, 100);
    });

    it("should update the chart on window resize", (done) => {
        spyOn(nv.utils, "windowResize").and.callThrough();

        const chart = renderChart.instance() as NVD3LineChart;
        chart.componentDidMount();

        setTimeout(() => {
            expect(nv.utils.windowResize).toHaveBeenCalled();

            renderChart.unmount();
            done();
        }, 100);
    });

    it("should update the chart when the component is updated", (done) => {
        spyOn(nv.models, "lineChart").and.callThrough();

        expect(nv.models.lineChart).not.toHaveBeenCalled();
        const chart = renderChart.instance() as NVD3LineChart;
        chart.componentDidMount();

        setTimeout(() => {
            expect(nv.models.lineChart).toHaveBeenCalled();
            chart.componentDidUpdate();
            expect(nv.models.lineChart).toHaveBeenCalledTimes(1);

            done();
        }, 100);
    });

    describe("with no datum", () => {
        beforeEach(() => {
            chartProps = {
                chartProps: {
                    xAxis: {
                        axisLabel: "Time",
                        showMaxMin: true,
                        tickFormat: (v) => v.toString()
                    },
                    xScale: time.scale(),
                    yAxis: { axisLabel: "Label", tickFormat: (v) => v.toString() }
                },
                datum: [],
                height: 20,
                heightUnit: "pixels",
                width: 50,
                widthUnit: "pixels"
            };
            renderChart = shallow(createElement(NVD3LineChart, chartProps));
        });

        it("renders a chart with no datum", (done) => {
            spyOn(nv.models, "lineChart").and.callThrough();

            const chart = renderChart.instance() as NVD3LineChart;
            chart.componentDidMount();

            setTimeout(() => {
                expect(nv.models.lineChart).toHaveBeenCalled();

                done();
            }, 100);
        });
    });
});
