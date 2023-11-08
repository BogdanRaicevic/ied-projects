import MyTable from "../components/MyTable";
import PageTitle from "../components/PageTitle";
import IndeterminateCheckbox from "../components/IndeterminateCheckbox";
import { companiesData } from "../fakeData/companyData";
import { FormControl, Grid } from "@mui/material";

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

  const radnaMesta = [
    { parent: "Sva radna mesta" },
    { parent: "Administracija" },
    { parent: "Budzet", children: ["LPA", "NBF", "NOU", "Sekretar"] },
  ];

  const velicineFirmi = [
    { parent: "Sve velicine firmi", children: ["Mikro", "Mala", "Srednja", "Velika", "Korporacija"] },
  ];

  const arrays = [gradovi, delatnosti, tipoviFirmi, radnaMesta, velicineFirmi];

  const components = arrays.map((array, index) => {
    return (
      <Grid key={index} item xs={12} sm={2}>
        <div style={{ maxHeight: "300px", overflow: "auto" }}>
          {array.map((item, index) => (
            <IndeterminateCheckbox key={index} options={item} />
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
