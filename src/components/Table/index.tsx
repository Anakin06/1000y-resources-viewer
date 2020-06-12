import React from "react";
import classNames from "classnames";
import {
  CellMeasurerCache,
  List,
  AutoSizer,
  ListRowProps,
} from "react-virtualized";
import CellMeasurer from "./CellMeasurer";
import styles from "./index.less";

const cache = new CellMeasurerCache({
  defaultWidth: 100,
  minWidth: 75,
  fixedHeight: true,
});

const rowRenderer = (
  data: any,
  columns: Column[],
  onRowClick: (id: number) => void,
  selectedId: number
) => (props: ListRowProps) => {
  const { columnIndex, key, parent, index, style } = props;
  const row = data[index];
  return (
    <CellMeasurer
      cache={cache}
      columnIndex={columnIndex}
      key={key}
      parent={parent}
      rowIndex={index}
    >
      {({ measure, registerChild }: any) => {
        let cls = styles.row;
        if (selectedId === index) {
          cls += " " + styles.selected;
        }
        return (
          <div
            style={style}
            ref={registerChild}
            className={cls}
            onClick={() => onRowClick(index)}
          >
            {columns.map((column, i) => {
              const value = row[column.id];
              const width = column.width ? `0 1 ${column.width}px` : "0 1 100%";
              const cellCls = classNames(
                styles.cell,
                column.align && styles[column.align]
              );
              return (
                <div key={i} className={cellCls} style={{ flex: width }}>
                  {column.format ? column.format(value) : value}
                </div>
              );
            })}
          </div>
        );
      }}
    </CellMeasurer>
  );
};

export interface Column {
  id: string;
  label: string;
  align?: "right" | "center";
  width?: number;
  format?: (value: number) => string;
}

export type TableProps = {
  columns: Column[];
  data: any[];
  selectedId: number;
  onRowClick: (rowId: number) => void;
};

export default function ReactVirtualizedTable({
  columns,
  data,
  onRowClick,
  selectedId,
}: TableProps) {
  return (
    <AutoSizer>
      {({ width, height }) => (
        <List
          className={styles.gridContainer}
          height={height}
          rowHeight={30}
          rowCount={data.length}
          width={width}
          columnWidth={cache.columnWidth}
          deferredMeasurementCache={cache}
          rowRenderer={rowRenderer(data, columns, onRowClick, selectedId)}
        />
      )}
    </AutoSizer>
  );
}
