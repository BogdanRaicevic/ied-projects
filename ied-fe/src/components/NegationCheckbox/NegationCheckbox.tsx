import { Close, CancelPresentation } from "@mui/icons-material";
import { Checkbox, FormControlLabel, Box } from "@mui/material";

interface CustomCheckboxProps {
	negationChecked: boolean;
	onNegationChange: (value: string) => void;
	value: string;
}

export const NegationCheckbox = ({
	negationChecked,
	onNegationChange,
	value,
}: CustomCheckboxProps) => {
	const handleClick = () => {
		onNegationChange(value);
	};

	return (
		<Box sx={{ cursor: "pointer" }}>
			<FormControlLabel
				name="negation"
				sx={{ bgcolor: negationChecked ? "salmon" : "white", borderRadius: 1 }}
				control={
					<Checkbox
						checked={negationChecked}
						onClick={handleClick}
						icon={<Close />} // Icon when unchecked
						checkedIcon={<CancelPresentation sx={{ color: "brown" }} />} // Icon when checked
					/>
				}
				label={<Box sx={{ paddingRight: 2 }}>Negacija</Box>}
			/>
		</Box>
	);
};
