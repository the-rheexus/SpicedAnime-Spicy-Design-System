import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DataTable } from "@/components/ds/data/DataTable.jsx";

const columns = [
  { key: "name", header: "Name" },
  { key: "qty", header: "Qty", align: "right" as const },
];

const rows = [
  { id: 1, name: "Alpha", qty: 2 },
  { id: 2, name: "Bravo", qty: 5 },
  { id: 3, name: "Charlie", qty: 9 },
];

describe("DataTable inline row expansion (P116 shared API)", () => {
  it("renders an expanded row as the next table row directly beneath its parent", () => {
    render(
      <DataTable
        columns={columns}
        rows={rows}
        expandedRowKeys={[2]}
        renderExpandedRow={(row) => <div>expanded for {row.name}</div>}
      />,
    );

    const expanded = screen.getByText("expanded for Bravo").closest("tr") as HTMLElement;
    expect(expanded).toHaveAttribute("data-testid", "data-table-expanded-row");

    const bravoRow = screen.getByText("Bravo").closest("tr") as HTMLElement;
    expect(bravoRow.nextElementSibling).toBe(expanded);

    // The expansion is not appended after the table body.
    const bodyRows = within(screen.getAllByRole("rowgroup")[1]).getAllByRole("row");
    expect(bodyRows.indexOf(expanded)).toBe(bodyRows.indexOf(bravoRow) + 1);
  });

  it("spans every column, including the selection column", () => {
    render(
      <DataTable
        columns={columns}
        rows={rows}
        selectable
        selected={[]}
        onSelect={() => {}}
        expandedRowKeys={[1]}
        renderExpandedRow={() => <div>body</div>}
      />,
    );
    const cell = screen.getByText("body").closest("td") as HTMLElement;
    expect(cell).toHaveAttribute("colspan", "3");
  });

  it("only expands the keys it is given", () => {
    render(
      <DataTable
        columns={columns}
        rows={rows}
        expandedRowKeys={[3]}
        renderExpandedRow={(row) => <div>panel {row.name}</div>}
      />,
    );
    expect(screen.getByText("panel Charlie")).toBeInTheDocument();
    expect(screen.queryByText("panel Alpha")).not.toBeInTheDocument();
    expect(screen.queryByText("panel Bravo")).not.toBeInTheDocument();
  });

  it("renders no expansion rows for tables that do not pass renderExpandedRow", () => {
    render(<DataTable columns={columns} rows={rows} expandedRowKeys={[1, 2, 3]} />);
    expect(screen.queryByTestId("data-table-expanded-row")).not.toBeInTheDocument();
  });
});

describe("DataTable P112 virtualization/sticky behavior stays intact", () => {
  function bigRows(count = 220) {
    return Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      name: `Row ${index + 1}`,
      qty: index,
    }));
  }

  it("windows rows and keeps a bounded sticky viewport", () => {
    render(
      <DataTable
        columns={columns}
        rows={bigRows()}
        selectable
        selected={[]}
        onSelect={() => {}}
        virtualize
        scrollHeight={576}
        virtualRowHeight={52}
      />,
    );

    const viewport = screen.getByTestId("virtualized-data-table-scroll");
    expect(viewport).toHaveStyle({ maxHeight: "576px", overflowY: "auto" });
    expect(screen.getAllByRole("row").length).toBeLessThan(40);
    expect(screen.getByText("Row 1")).toBeInTheDocument();
    expect(screen.queryByText("Row 220")).not.toBeInTheDocument();

    const header = screen.getAllByRole("columnheader")[1];
    expect(header).toHaveStyle({ position: "sticky", top: "0px" });

    fireEvent.scroll(viewport, { target: { scrollTop: 52 * 150 } });
    expect(screen.queryByText("Row 1")).not.toBeInTheDocument();
    expect(screen.getByText("Row 151")).toBeInTheDocument();
  });

  it("is unchanged for non-virtualized tables below the threshold", () => {
    render(<DataTable columns={columns} rows={bigRows(10)} />);
    expect(screen.queryByTestId("virtualized-data-table-scroll")).not.toBeInTheDocument();
    expect(screen.getByText("Row 10")).toBeInTheDocument();
  });
});
