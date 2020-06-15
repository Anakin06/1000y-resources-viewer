import React from "react";
import Table from "./Table";
import CellMeasurer from "./CellMeasurer";
import {
  CellMeasurerCache,
  Column as BasicColumn,
  AutoSizer,
  RowMouseEventHandlerParams,
} from "react-virtualized";

import styles from "./index.less";
import classNames from "classnames";

export interface Column {
  id: string;
  label: string;
  align?: "right" | "center";
  width?: number;
  format?: (value: number) => string;
}

const cache = new CellMeasurerCache({
  defaultWidth: 100,
  minWidth: 100,
  fixedHeight: true,
});

export type TableProps = {
  columns: Column[];
  data: any[];
  selectedId: number;
  rowHeight?: number;
  headerHeight?: number;
  onRowClick?: (rowId: number) => void;
};

function headerRenderer({ width, label, align }: any) {
  const cls = classNames(
    styles.th,
    styles.cell,
    {
      [styles.cellauto]: !width,
    },
    align && styles[align]
  );
  return <div className={cls}>{label}</div>;
}

const cellRender = (columns: Column[]) => (props: any) => {
  const { columnIndex, key, parent, index, style } = props;
  const value = props.rowData[props.dataKey];
  const column = columns[columnIndex];
  const width = column.width;
  const cls = classNames(
    styles.cell,
    {
      [styles.cellauto]: !width,
    },
    column.align && styles[column.align]
  );
  return (
    <CellMeasurer
      cache={cache}
      columnIndex={columnIndex}
      key={key}
      parent={parent}
      rowIndex={index}
    >
      {({ measure, registerChild }: any) => {
        return (
          <div style={style} ref={registerChild} className={cls}>
            {value}
          </div>
        );
      }}
    </CellMeasurer>
  );
};

export default ({
  data,
  columns,
  onRowClick: rowClickHandler,
  selectedId,
  rowHeight = 30,
  headerHeight = 30,
}: TableProps) => {
  const _cellRender = cellRender(columns);
  const onRowClick = (n: RowMouseEventHandlerParams) =>
    rowClickHandler && rowClickHandler(n.index);
  const getRowClassName = ({ index }: { index: number }) =>
    classNames(
      styles.row,
      index !== -1 && index === selectedId ? styles.selected : null
    );
  return (
    <AutoSizer>
      {({ width, height }) => (
        <Table
          height={height}
          rowHeight={rowHeight}
          rowCount={data.length}
          width={width}
          headerHeight={headerHeight}
          rowGetter={({ index }) => data[index]}
          headerClassName={styles.head}
          rowClassName={getRowClassName}
          onRowClick={onRowClick}
        >
          {columns.map(({ id, width, ...others }, index) => {
            return (
              <BasicColumn
                flexGrow={!!width ? 0 : 1}
                key={id}
                dataKey={id}
                width={width || 0}
                headerRenderer={(props) =>
                  headerRenderer({ ...props, id, width, ...others })
                }
                cellRenderer={_cellRender}
                {...others}
              ></BasicColumn>
            );
          })}
        </Table>
      )}
    </AutoSizer>
  );
};
