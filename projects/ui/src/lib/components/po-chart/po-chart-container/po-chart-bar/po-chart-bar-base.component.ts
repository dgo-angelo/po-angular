import { Directive, EventEmitter, Input, Output } from '@angular/core';

import { PoChartMathsService } from '../../services/po-chart-maths.service';

import { PoBarChartSeries } from '../../interfaces/po-chart-bar-series.interface';
import { PoChartContainerSize } from '../../interfaces/po-chart-container-size.interface';
import { PoColumnChartSeries } from '../../interfaces/po-chart-column-series.interface';
import { PoChartMinMaxValues } from '../../interfaces/po-chart-min-max-values.interface';
import { PoChartBarCoordinates } from '../../interfaces/po-chart-bar-coordinates.interface';

@Directive()
export abstract class PoChartBarBaseComponent {
  seriesPathsCoordinates: Array<Array<PoChartBarCoordinates>>;

  protected seriesGreaterLength: number;

  private _containerSize: PoChartContainerSize = {};
  private _range: PoChartMinMaxValues;
  private _series: Array<PoBarChartSeries | PoColumnChartSeries> = [];

  @Input('p-categories') categories: Array<string>;

  @Input('p-range') set range(value: PoChartMinMaxValues) {
    if (value instanceof Object && !(value instanceof Array)) {
      this._range = value;

      this.calculateSeriesPathsCoordinates(this.containerSize, this._series, this._range);
    }
  }

  get range() {
    return this._range;
  }

  @Input('p-container-size') set containerSize(value: PoChartContainerSize) {
    this._containerSize = value;

    this.calculateSeriesPathsCoordinates(this._containerSize, this.series, this.range);
  }

  get containerSize() {
    return this._containerSize;
  }

  @Input('p-series') set series(seriesList: Array<PoBarChartSeries | PoColumnChartSeries>) {
    const seriesDataArrayFilter = seriesList.filter(serie => {
      return Array.isArray(serie.data);
    });

    if (seriesDataArrayFilter.length) {
      this._series = seriesDataArrayFilter;
      this.seriesGreaterLength = this.mathsService.seriesGreaterLength(this.series);
      this.calculateSeriesPathsCoordinates(this.containerSize, seriesDataArrayFilter, this.range);
    } else {
      this._series = [];
    }
  }

  get series() {
    return this._series;
  }

  @Output('p-bar-click') barClick = new EventEmitter<any>();

  @Output('p-bar-hover') barHover = new EventEmitter<any>();

  constructor(protected mathsService: PoChartMathsService) {}

  onSerieBarClick(selectedItem: any) {
    this.barClick.emit(selectedItem);
  }

  onSerieBarHover(selectedItem: any) {
    this.barHover.emit(selectedItem);
  }

  trackBy(index) {
    return index;
  }

  private calculateSeriesPathsCoordinates(
    containerSize: PoChartContainerSize,
    series: Array<PoBarChartSeries | PoColumnChartSeries>,
    range: PoChartMinMaxValues
  ) {
    this.seriesPathsCoordinates = series.map((serie: PoBarChartSeries | PoColumnChartSeries, seriesIndex) => {
      if (Array.isArray(serie.data)) {
        let pathCoordinates: Array<PoChartBarCoordinates> = [];

        serie.data.forEach((serieValue, serieDataIndex) => {
          if (this.mathsService.verifyIfFloatOrInteger(serieValue)) {
            const coordinates = this.barCoordinates(seriesIndex, serieDataIndex, containerSize, range, serieValue);

            const category = this.serieCategory(serieDataIndex, this.categories);
            const label = serie['label'];
            const color = serie['color'];
            const tooltipLabel = this.serieLabel(serieValue, label);

            pathCoordinates = [
              ...pathCoordinates,
              { category, color, label, tooltipLabel, data: serieValue, coordinates }
            ];
          }
        });

        return pathCoordinates;
      }
    });
  }

  private serieCategory(index: number, categories: Array<string> = []) {
    return categories[index] ?? undefined;
  }

  private serieLabel(serieValue: number, label: string) {
    const hasLabel = label !== null && label !== undefined && label !== '';

    return hasLabel ? `${label}: ${serieValue}` : serieValue.toString();
  }

  protected abstract barCoordinates(
    seriesIndex: number,
    serieDataIndex: number,
    containerSize: PoChartContainerSize,
    range: PoChartMinMaxValues,
    serieValue: number
  );
}
