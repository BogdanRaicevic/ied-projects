import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { VariableSizeList, type ListChildComponentProps } from "react-window";
import Typography from "@mui/material/Typography";
import type { TODO_ANY } from "../../../../ied-be/src/utils/utils";

const LISTBOX_PADDING = 8; // px

function renderRow(props: ListChildComponentProps) {
	const { data, index, style } = props;
	const dataSet = data[index];
	const inlineStyle = {
		...style,
		top: (style.top as number) + LISTBOX_PADDING,
	};

	const { key, ...optionProps } = dataSet[0];

	return (
		<Typography
			key={key}
			component="li"
			{...optionProps}
			noWrap
			style={inlineStyle}
		>
			{`${dataSet[1]}`}
		</Typography>
	);
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
	const outerProps = React.useContext(OuterElementContext);
	return <div ref={ref} {...props} {...outerProps} />;
});
OuterElementType.displayName = "OuterElementType";

function useResetCache(data: TODO_ANY) {
	const ref = React.useRef<VariableSizeList>(null);
	React.useEffect(() => {
		if (ref.current != null) {
			ref.current.resetAfterIndex(0, true);
		}
	}, [data]);
	return ref;
}

// Adapter for react-window
const ListboxComponent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
	const { children, ...other } = props;
	const itemData: React.ReactElement[] = [];

	// TODO: Refactor this to use for...of
	(children as React.ReactElement[]).forEach(
		(item: React.ReactElement & { children?: React.ReactElement[] }) => {
			itemData.push(item);
			itemData.push(...(item.children || []));
		},
	);

	const theme = useTheme();
	const smUp = useMediaQuery(theme.breakpoints.up("sm"), {
		noSsr: true,
	});
	const itemCount = itemData.length;
	const itemSize = smUp ? 36 : 48;

	const getChildSize = (child: React.ReactElement) => {
		// biome-ignore lint: // lint/suspicious/noPrototypeBuiltins
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
});

interface VirtualizeProps {
	data: TODO_ANY[];
	onOptionSelect: (option: string) => void;
}

export default function VirtualizedAutocomplete({
	data,
	onOptionSelect,
}: VirtualizeProps) {
	return (
		<Autocomplete
			id="virtualize-demo"
			disableListWrap
			ListboxComponent={ListboxComponent}
			options={data}
			getOptionLabel={(option) => option.naziv_pretrage}
			renderInput={(params) => (
				<TextField {...params} label="Predefinisane pretrage" />
			)}
			renderOption={(props, option, state) =>
				[props, option.naziv_pretrage, state.index] as React.ReactNode
			}
			renderGroup={(params) => params as TODO_ANY}
			onChange={(_event, value) => onOptionSelect(value)}
		/>
	);
}
