import { FormControl, TextField, InputAdornment, Button, Divider } from "@mui/material";
import { Box } from "@mui/system";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid2";
import {
  Metadata,
  CompanySchema,
  InputTypesSchema,
  Company,
} from "../../../schemas/companySchemas";
import { z } from "zod";

import AutocompleteSingle from "../../Autocomplete/Single";
import { useFetchData } from "../../../hooks/useFetchData";
import { companyFormMetadata } from "./metadata";

type CompanyFormProps = {
  inputCompany: Company;
};

export const CompanyForm: React.FC<CompanyFormProps> = ({ inputCompany }) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    // control,
    reset,
  } = useForm<Company>({
    resolver: zodResolver(CompanySchema),
    defaultValues: inputCompany || {},
  });

  // TODO: add types
  const [company, setCompany] = useState(inputCompany);

  const {
    tipoviFirme: fetchedTipoviFirme,
    velicineFirme: fetchedVelicineFirme,
    stanjaFirme: fetchedStanjaFirme,
    mesta: fetchedMesta,
  } = useFetchData();

  const [tipoviFirme, setTipoviFirme] = useState([]);
  const [stanjaFirme, setStanjaFirme] = useState([]);
  const [velicinieFirme, setVelicineFirme] = useState([]);
  const [mesta, setMesta] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      setTipoviFirme(fetchedTipoviFirme || []);
      setStanjaFirme(fetchedStanjaFirme || []);
      setVelicineFirme(fetchedVelicineFirme || []);
      setMesta(fetchedMesta || []);
    };

    fetchData();
  }, [fetchedStanjaFirme, fetchedTipoviFirme, fetchedVelicineFirme, fetchedMesta]);

  useEffect(() => {
    setCompany(inputCompany);
    reset(inputCompany);
  }, [inputCompany, reset]);

  const onSubmit = (data: Company) => {
    console.log("hi");
    console.log(data);
  };

  const onError = (errors: any, e: any) => console.log("Company form errors: ", errors, e);

  function renderFiled(item: Metadata, errors: any) {
    // console.log("render file", item);
    if (item.inputType === InputTypesSchema.enum.Text) {
      return (
        <TextField
          {...register(item.key as keyof Company)}
          label={item.label}
          InputProps={{
            startAdornment: <InputAdornment position="start">{item.inputAdornment}</InputAdornment>,
          }}
          name={item.key}
          defaultValue={company[item.key as keyof Company]}
          error={Boolean(errors[item.key])}
          helperText={errors[item.key]?.message}
        />
      );
    }

    if (item.inputType === InputTypesSchema.enum.TextMultiline) {
      return (
        <TextField
          {...register(item.key as keyof Company)}
          label={item.label}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ pt: 1.5 }}>
                {item.inputAdornment}
              </InputAdornment>
            ),
            sx: { alignItems: "flex-start" },
          }}
          name={item.key}
          multiline
          rows={10}
          defaultValue={company[item.key as keyof Company]}
          error={errors[item.key]}
          helperText={errors[item.key]?.message}
        />
      );
    }

    // console.log("item", item);

    if (item.inputType === InputTypesSchema.enum.Select) {
      let optionsData: string[] = [];
      switch (item.key) {
        case "tip_firme":
          optionsData = tipoviFirme;
          break;
        case "velicina":
          optionsData = velicinieFirme;
          break;
        case "stanje_firme":
          optionsData = stanjaFirme;
          break;
        case "mesto":
          optionsData = mesta;
          break;
        default:
          break;
      }

      return (
        <AutocompleteSingle
          data={optionsData}
          id={item.key}
          placeholder={item.label}
          preselected={company[item.key as keyof Company] as string}
        ></AutocompleteSingle>
      );
    }
  }

  const inputItems = (inputType: z.infer<typeof InputTypesSchema>) => {
    return companyFormMetadata
      .filter((element) => element.inputType === inputType)
      .map((item: Metadata) => {
        return (
          <FormControl fullWidth key={item.key}>
            {renderFiled(item, errors)}
          </FormControl>
        );
      });
  };

  return (
    <Box onSubmit={handleSubmit(onSubmit, onError)} component="form" sx={{ mt: 4 }}>
      <Grid container m={0} spacing={2}>
        {inputItems(InputTypesSchema.enum.Text).map((item) => {
          return (
            <Grid key={item.key} size={{ xs: 12, md: 6, lg: 4 }}>
              {item}
            </Grid>
          );
        })}
        <Divider sx={{ width: "100%", my: 4 }} />
        {inputItems(InputTypesSchema.enum.Select).map((item) => {
          return (
            <Grid key={item.key} size={{ xs: 12, md: 6, lg: 4 }}>
              {item}
            </Grid>
          );
        })}
        <Divider sx={{ width: "100%", my: 4 }} />
        {inputItems(InputTypesSchema.enum.TextMultiline).map((item) => {
          return (
            <Grid key={item.key} size={{ xs: 12 }}>
              {item}
            </Grid>
          );
        })}
        <Button sx={{ my: 2 }} size="large" variant="contained" color="success" type="submit">
          Sačuvaj
        </Button>
        <Divider sx={{ width: "100%", my: 2 }} />
      </Grid>
    </Box>
  );
};
