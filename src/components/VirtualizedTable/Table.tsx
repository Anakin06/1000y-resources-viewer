import { Table as BasicTable } from "react-virtualized";

export default class Table extends BasicTable {
  // Remove findDOMNode
  getScrollbarWidth() {
    if (this.Grid) {
      //@ts-ignore
      const Grid = this.Grid._scrollingContainer;
      const clientWidth = Grid.clientWidth || 0;
      const offsetWidth = Grid.offsetWidth || 0;
      return offsetWidth - clientWidth;
    }
    return 0;
  }
}
