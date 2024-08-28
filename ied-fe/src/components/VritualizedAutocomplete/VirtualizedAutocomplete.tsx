import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import useMediaQuery from "@mui/material/useMediaQuery";
import ListSubheader from "@mui/material/ListSubheader";
import { useTheme } from "@mui/material/styles";
import { VariableSizeList, ListChildComponentProps } from "react-window";
import Typography from "@mui/material/Typography";
import { TODO_ANY } from "../../../../ied-be/src/utils/utils";

const LISTBOX_PADDING = 8; // px

function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props;
  const dataSet = data[index];
  const inlineStyle = {
    ...style,
    top: (style.top as number) + LISTBOX_PADDING,
  };

  if (dataSet.hasOwnProperty("group")) {
    return (
      <ListSubheader key={dataSet.key} component="div" style={inlineStyle}>
        {dataSet.group}
      </ListSubheader>
    );
  }

  const { key, ...optionProps } = dataSet[0];

  return (
    <Typography key={key} component="li" {...optionProps} noWrap style={inlineStyle}>
      {`#${dataSet[2] + 1} - ${dataSet[1]}`}
    </Typography>
  );
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});
OuterElementType.displayName = "OuterElementType";

function useResetCache(data: any) {
  const ref = React.useRef<VariableSizeList>(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

// Adapter for react-window
const ListboxComponent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLElement>>(
  function ListboxComponent(props, ref) {
    const { children, ...other } = props;
    const itemData: React.ReactElement[] = [];
    (children as React.ReactElement[]).forEach(
      (item: React.ReactElement & { children?: React.ReactElement[] }) => {
        itemData.push(item);
        itemData.push(...(item.children || []));
      }
    );

    const theme = useTheme();
    const smUp = useMediaQuery(theme.breakpoints.up("sm"), {
      noSsr: true,
    });
    const itemCount = itemData.length;
    const itemSize = smUp ? 36 : 48;

    const getChildSize = (child: React.ReactElement) => {
      if (child.hasOwnProperty("group")) {
        return 48;
      }

      return itemSize;
    };

    const getHeight = () => {
      if (itemCount > 8) {
        return 8 * itemSize;
      }
      return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
    };

    const gridRef = useResetCache(itemCount);

    return (
      <div ref={ref}>
        <OuterElementContext.Provider value={other}>
          <VariableSizeList
            itemData={itemData}
            height={getHeight() + 2 * LISTBOX_PADDING}
            width="100%"
            ref={gridRef}
            outerElementType={OuterElementType}
            innerElementType="ul"
            itemSize={(index) => getChildSize(itemData[index])}
            overscanCount={5}
            itemCount={itemCount}
          >
            {renderRow}
          </VariableSizeList>
        </OuterElementContext.Provider>
      </div>
    );
  }
);

interface VirtualizeProps {
  data: TODO_ANY[];
  onOptionSelect: (option: string) => void;
}

export default function Virtualize({ data, onOptionSelect }: VirtualizeProps) {
  console.log("virtualize ", data);
  return (
    <Autocomplete
      id="virtualize-demo"
      sx={{ width: "full" }}
      disableListWrap
      ListboxComponent={ListboxComponent}
      options={data}
      getOptionLabel={(option) => option.naziv_pretrage}
      groupBy={(option) => option.naziv_pretrage[0].toUpperCase()}
      renderInput={(params) => <TextField {...params} label="Predefinisane pretrage" />}
      renderOption={(props, option, state) =>
        [props, option.naziv_pretrage, state.index] as React.ReactNode
      }
      renderGroup={(params) => params as any}
      onChange={(event, value) => onOptionSelect(value)}
    />
  );
}