import MyTable from "../components/MyTable";
import PageTitle from "../components/PageTitle";
import IndeterminateCheckbox from "../components/IndeterminateCheckbox";
import { companiesData, fakeRadnaMesta } from "../fakeData/companyData";
import Grid from "@mui/material/Unstable_Grid2";

export default function Pretrage() {
  const gradovi = [
    { parent: "SVI Gradovi" },
    {
      parent: "Aleksinac",
      children: ["Aleksinacki rudnik", "Loćika", "Subotinac", "Trnjane"],
    },
    {
      parent: "Aleksandrovac",
      children: ["Gornji Stupanj", "Tranavci", "Sljivovo"],
    },
    {
      parent: "Beograd",
      children: [
        "Novi Beograd",
        "Zemun",
        "Borca",
        "Palilula",
        "Vozdovac",
        "Rakovica",
        "Zvezdara",
        "Savski venac",
        "Stari grad",
        "Cukarica",
        "Vracar",
      ],
    },
  ];

  const delatnosti = [
    {
      parent: "Delatnost",
      children: [
        "Advokati",
        "Arhiv",
        "Banke",
        "Proizvodnja",
        "Trgovina",
        "Usluge",
        "Saobracaj",
        "Poljoprivreda",
        "Građevinarstvo",
        "Turizam",
        "IT",
      ],
    },
  ];

  const tipoviFirmi = [
    {
      parent: "Tip firme",
      children: ["Doo", "Ado", "jkp", "inostranstvo", "jp", "Nvo", "Ad", "Ostalo"],
    },
  ];

  const velicineFirmi = [
    {
      parent: "Sve velicine firmi",
      children: ["Mikro", "Mala", "Srednja", "Velika", "Korporacija"],
    },
  ];

  // merge this into one array
  const arrayNames = ["gradovi", "delatnosti", "tipoviFirmi", "radnaMesta", "velicineFirmi"];
  const arrays = [gradovi, delatnosti, tipoviFirmi, fakeRadnaMesta, velicineFirmi];

  const components = arrays.map((array, index) => {
    return (
      <Grid key={arrayNames[index]} xs={12} sm={2}>
        <div style={{ maxHeight: "300px", overflow: "auto" }}>
          {array.map((item, index) => (
            <IndeterminateCheckbox key={arrayNames[index]} options={item} />
          ))}
        </div>
      </Grid>
    );
  });

  return (
    <>
      <PageTitle title={"Pretrage"} />
      <Grid container spacing={2}>
        {components}
      </Grid>
      <MyTable data={companiesData}></MyTable>
    </>
  );
}
