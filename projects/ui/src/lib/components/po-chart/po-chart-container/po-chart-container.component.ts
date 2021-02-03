import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { PoChartType } from '../enums/po-chart-type.enum';
import { PoLineChartSeries } from '../interfaces/po-chart-line-series.interface';
import { PoChartContainerSize } from '../interfaces/po-chart-container-size.interface';
import { PoChartOptions } from '../interfaces/po-chart-options.interface';
import { PoChartAxisOptions } from '../interfaces/po-chart-axis-options.interface';
import { PoChartColorService } from '../services/po-chart-color.service';
import { PoChartMathsService } from '../services/po-chart-maths.service';
import { PoChartMinMaxValues } from '../interfaces/po-chart-min-max-values.interface';

@Component({
  selector: 'po-chart-container',
  templateUrl: './po-chart-container.component.html'
})
export class PoChartContainerComponent implements OnChanges {
  private _options: PoChartOptions;
  private _series = [];

  axisOptions: PoChartAxisOptions;
  range: PoChartMinMaxValues;
  seriesByType;
  viewBox: string;

  private chartSeries: Array<any>;

  @Input('p-categories') categories: Array<string>;

  @Input('p-type') type: PoChartType;

  @Input('p-container-size') containerSize: PoChartContainerSize;

  @Output('p-serie-click') serieClick = new EventEmitter<any>();

  @Output('p-serie-hover') serieHover = new EventEmitter<any>();

  @Input('p-options') set options(value: PoChartOptions) {
    if (value instanceof Object && !(value instanceof Array)) {
      this._options = value;

      this.verifyAxisOptions(this._options);
    }
  }

  get options() {
    return this._options;
  }

  @Input('p-series') set series(value: Array<any>) {
    this._series = value;

    const seriesColors = this.colorService.getSeriesColor(this._series, PoChartType.Line);

    this.chartSeries = this._series.map((serie, index) => {
      return { ...serie, color: seriesColors[index] };
    });
    this.range = this.getRange(this.chartSeries, this.options);
    this.setSeriesByType(this.chartSeries);
  }

  get series() {
    return this._series;
  }

  get isTypeCircular() {
    return this.type === PoChartType.Pie || this.type === PoChartType.Donut;
  }

  constructor(private colorService: PoChartColorService, private mathsService: PoChartMathsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.type || changes.containerSize) {
      this.setViewBox();
    }
  }

  private getRange(series, options: PoChartOptions = {}) {
    const allowNegativeValues = this.type === PoChartType.Line;
    const domain = this.mathsService.calculateMinAndMaxValues(series, allowNegativeValues);

    const minValue =
      !allowNegativeValues && !options.axis?.minRange
        ? 0
        : options.axis?.minRange < domain.minValue
        ? options.axis?.minRange
        : domain.minValue;
    const maxValue = options.axis?.maxRange > domain.maxValue ? options.axis?.maxRange : domain.maxValue;
    const updatedDomainValues = { minValue: !allowNegativeValues && minValue < 0 ? 0 : minValue, maxValue };

    return { ...domain, ...updatedDomainValues };
  }

  onSerieClick(event: any) {
    this.serieClick.emit(event);
  }

  onSerieHover(event: any) {
    this.serieHover.emit(event);
  }

  private setSeriesByType(series: Array<any>) {
    this.seriesByType = {
      [PoChartType.Column]: series.filter(serie => serie?.type === PoChartType.Column),
      [PoChartType.Line]: series.filter(serie => serie?.type === PoChartType.Line)
    };
  }

  private setViewBox() {
    const { svgWidth, svgHeight } = this.containerSize;
    const viewBoxWidth = this.isTypeCircular ? svgHeight : svgWidth;
    // Tratamento necessário para que não corte o vetor nas extremidades
    const offsetXY = 1;

    this.viewBox = `${offsetXY} -${offsetXY} ${viewBoxWidth} ${this.containerSize.svgHeight}`;
  }

  private verifyAxisOptions(options: PoChartOptions): void {
    if (options.hasOwnProperty('axis')) {
      this.range = this.getRange(this.chartSeries, this.options);
      this.axisOptions = {
        ...this.axisOptions,
        ...options.axis
      };
    }
  }
}
