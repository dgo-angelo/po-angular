import { PoChartType } from '../enums/po-chart-type.enum';

/**
 * @usedBy PoChartComponent
 *
 * @description
 *
 * Interface das series dinâmicas do `po-chart` que possibilita desenhar gráficos dos tipos `bar`, `column`, `line`, `donut` e `pie`
 */
export interface PoChartSerie {
  /**
   * @optional
   *
   * @description
   *
   * Define a lista de valores para a série.
   *
   * > Se passado valor `null` em determinado item da lista, a iteração irá ignorá-lo.
   */
  data: number | Array<number>;

  /** Rótulo referência da série;. */
  label: string;

  /**
   * @optional
   *
   * @description
   *
   * Define o texto que será exibido ao passar o mouse por cima das séries do *chart*.
   *
   * > Caso não seja informado um valor para o *tooltip*, será exibido da seguinte forma: 
   * `donut`: `label`: valor proporcional ao total em porcentagem.
   * `bar`, `column`, `line` e `pie`: `label`: `data`.
   */
  tooltip?: string;

  /**
   * @optional
   *
   * @description
   *
   * Define em qual tipo de gráfico que será exibida a série. É possível combinar séries dos tipos `column` e `line` no mesmo gráfico. Para isso, basta criar as séries com as configurações:
   * - Serie A: `{ p-type: ChartType.Column, data: ... }`;
   * - Série B: `{ p-type: ChartType.Line, data: ... }`.
   * 
   * > Se utilizada a propriedade `p-type`, dispensa-se a definição desta propriedade. 
   * 
   * Se tanto `p-type` e `{ type }` não forem declarados, o padrão será:
   * - `column`: se passado um *array* em `data`;
   * - `pie`: se usar `data` como *number*.
   */
  type?: PoChartType;
}
