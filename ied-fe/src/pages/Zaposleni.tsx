// import SelectSeminar from "../components/SelectSeminar";
import { Box, Button, Grid, TextField } from "@mui/material";
import PaginatedList from "../components/PaginatedList/PaginatedList";
export default function Zaposleni() {
	// const handleSeminarSelect = (seminarId: string) => {
	//   console.log("zaposleni seminarId: ", seminarId);
	// };

	return (
		<div>
			<h1>Zaposleni</h1>

			<h3>Pretraga po parametrima</h3>
			<Box sx={{ m: 1 }}>
				<Grid container spacing={3}>
					<Grid size={4}>
						<TextField
							fullWidth
							sx={{ m: 1 }}
							id="email"
							label="Email"
							variant="outlined"
						/>
						<TextField
							fullWidth
							sx={{ m: 1 }}
							id="naziv-firme"
							label="Naiv Firme"
							variant="outlined"
						/>
						<TextField
							fullWidth
							sx={{ m: 1 }}
							id="id-sertifikata"
							label="ID sertifikata"
							variant="outlined"
						/>
						<TextField
							fullWidth
							sx={{ m: 1 }}
							id="ime"
							label="Ime"
							variant="outlined"
						/>
						<TextField
							fullWidth
							sx={{ m: 1 }}
							id="prezime"
							label="Prezime"
							variant="outlined"
						/>
					</Grid>
					{/* <Grid size={4}>
            {fakeRadnaMesta.map((item, index) => (
              <IndeterminateCheckbox key={index} options={item} />
            ))}
          </Grid> */}

					{/* <Grid size={4}>
            <SelectSeminar onSeminarSelect={handleSeminarSelect}></SelectSeminar>
          </Grid> */}
				</Grid>
				<Button variant="contained">Pretrazi</Button>
			</Box>
			<PaginatedList></PaginatedList>
		</div>
	);
}
