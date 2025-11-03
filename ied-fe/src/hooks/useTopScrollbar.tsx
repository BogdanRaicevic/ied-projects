import { type MRT_TableInstance, MRT_TopToolbar } from "material-react-table";
import { useRef } from "react";

export function useTopScrollbar<TData extends Record<string, any>>() {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const topToolbarRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  const scrollbarProps = {
    renderTopToolbar: ({ table }: { table: MRT_TableInstance<TData> }) => (
      <div
        ref={topToolbarRef}
        style={{ overflowX: "auto" }}
        onScroll={(e) => {
          if (tableContainerRef.current && !isSyncingScroll.current) {
            isSyncingScroll.current = true;
            tableContainerRef.current.scrollLeft = e.currentTarget.scrollLeft;
            requestAnimationFrame(() => {
              isSyncingScroll.current = false;
            });
          }
        }}
      >
        <div style={{ width: `${table.getTotalSize()}px` }}>
          <MRT_TopToolbar table={table} />
        </div>
      </div>
    ),
    muiTableContainerProps: {
      ref: tableContainerRef,
      onScroll: (e: React.UIEvent<HTMLDivElement>) => {
        if (topToolbarRef.current && !isSyncingScroll.current) {
          isSyncingScroll.current = true;
          topToolbarRef.current.scrollLeft = e.currentTarget.scrollLeft;
          requestAnimationFrame(() => {
            isSyncingScroll.current = false;
          });
        }
      },
    },
  };

  return scrollbarProps;
}
