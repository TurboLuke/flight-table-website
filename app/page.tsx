"use client";

import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import {
  ColumnDef,
  SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender
} from "@tanstack/react-table";
import { minutesToHHMM, parsePandasTimedeltaToMinutes, parseHHMMToMinutes } from "../lib/parseDuration";

type Row = {
  direction: string;
  start_date: string;
  weekday: string;

  leg1_flight: string;
  leg1_dep: string;
  leg1_arr: string;

  leg2_flight: string;
  leg2_dep: string;
  leg2_arr: string;

  layover: string;
  total_time: string;

  price_sum: number;
  currency: string;
};

type RowComputed = Row & {
  layover_min: number | null;
  total_min: number | null;
};

export default function Page() {
  const [rows, setRows] = useState<RowComputed[]>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "start_date", desc: false },
    { id: "price_sum", desc: false }
  ]);

  useEffect(() => {
    fetch("/all_connections.csv")
      .then((r) => r.text())
      .then((text) => {
        const parsed = Papa.parse<Row>(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true
        });

        const data = (parsed.data || []).map((r: any) => ({
          ...r,
          layover_min: parsePandasTimedeltaToMinutes(r.layover),
          total_min: parsePandasTimedeltaToMinutes(r.total_time),
          price_sum: Number(r.price_sum)
        }));

        setRows(data);
      });
  }, []);

  const columns = useMemo<ColumnDef<RowComputed>[]>(() => [
    { accessorKey: "direction", header: "Route" },
    { accessorKey: "start_date", header: "Date" },
    { accessorKey: "weekday", header: "Weekday" },
    { accessorKey: "leg1_flight", header: "Leg1" },
    { accessorKey: "leg1_dep", header: "Dep 1" },
    { accessorKey: "leg2_flight", header: "Leg2" },
    { accessorKey: "leg2_dep", header: "Dep 2" },
    {
      accessorKey: "layover_min",
      header: "Layover",
      cell: (i) => minutesToHHMM(i.getValue<number>())
    },
    {
      accessorKey: "total_min",
      header: "Total",
      cell: (i) => minutesToHHMM(i.getValue<number>())
    },
    { accessorKey: "price_sum", header: "Price" },
    { accessorKey: "currency", header: "Cur" }
  ], []);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } }
  });

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Flight Connections 🐷</h1>

      <div className="overflow-auto rounded-xl border">
        <table className="min-w-full">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="cursor-pointer border-b px-3 py-2 text-left text-sm font-semibold"
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => {
              const r = row.original;
              const priceOk = typeof r.price_sum === "number" && r.price_sum < 60;
              const layoverOk = typeof r.layover_min === "number" && r.layover_min < 120;
              const arrMin = parseHHMMToMinutes(r.leg2_arr);
              const arrivalOk = arrMin != null && arrMin >= 6 * 60 && arrMin <= 18 * 60;
              const highlight = priceOk  || arrivalOk  || layoverOk;

              return (
                <tr key={row.id} className={highlight ? "bg-green-100" : "odd:bg-neutral-50"}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
