import { Typography } from "@mui/material";
import { green, orange } from "@mui/material/colors";
import { Box } from "@mui/system";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import type { SeminarDetail } from "ied-shared";
import { useMemo } from "react";

const chartColors = {
  online: green[500],
  offline: orange[800],
};

export default function FirmaSeminarCharts({
  data,
}: {
  data: SeminarDetail[];
}) {
  const chartData = useMemo(() => {
    const onlineData: number[] = [];
    const offlineData: number[] = [];
    const xAxisData: string[] = [];
    let totalOnlineRevenue = 0;
    let totalOfflineRevenue = 0;

    data.forEach((seminar) => {
      const onlineRevenue =
        (seminar.onlineUcesnici || 0) * (seminar.onlineCena || 0);
      const offlineRevenue =
        (seminar.offlineUcesnici || 0) * (seminar.offlineCena || 0);

      onlineData.push(onlineRevenue);
      offlineData.push(offlineRevenue);
      xAxisData.push(seminar.naziv || "N/A");

      totalOnlineRevenue += onlineRevenue;
      totalOfflineRevenue += offlineRevenue;
    });

    const pieChartData = [
      { id: 0, label: "Online Zarada", value: totalOnlineRevenue },
      { id: 1, label: "Offline Zarada", value: totalOfflineRevenue },
    ];

    return { onlineData, offlineData, xAxisData, pieChartData };
  }, [data]);

  if (!data || data.length === 0) {
    return <Box>Nema podataka za prikaz grafikona!</Box>;
  }

  const totalRevenue = chartData.pieChartData.reduce(
    (acc, item) => acc + item.value,
    0,
  );

  if (totalRevenue === 0) {
    return <Box>Nema podataka za prikaz grafikona!</Box>;
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        flexWrap: "wrap",
        maxWidth: 1100,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 300 }}>
        <Typography variant="h6" textAlign="center">
          Ukupna Zarada: {totalRevenue.toLocaleString()} RSD
        </Typography>
        <PieChart
          series={[
            {
              data: chartData.pieChartData,
              faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
              valueFormatter: (item) =>
                `${item.value.toLocaleString()} RSD (${(
                  (item.value / totalRevenue) * 100
                ).toFixed(2)}%)`,
            },
          ]}
          height={200}
          hideLegend={true}
          colors={[chartColors.online, chartColors.offline]}
        />
      </Box>
      <Box sx={{ flex: 2, minWidth: 400 }}>
        <BarChart
          series={[
            {
              data: chartData.onlineData,
              label: "Online Zarada",
              stack: "total",
              valueFormatter: (value) =>
                `${value?.toLocaleString() ?? "0"} RSD`,
            },
            {
              data: chartData.offlineData,
              label: "Offline Zarada",
              stack: "total",
              valueFormatter: (value) =>
                `${value?.toLocaleString() ?? "0"} RSD`,
            },
          ]}
          xAxis={[
            {
              data: chartData.xAxisData,
              scaleType: "band",
              tickLabelStyle: {
                angle: 15,
                textAnchor: "start",
                fontSize: 12,
              },
            },
          ]}
          height={400}
          margin={{ top: 40, bottom: 80, left: 80, right: 10 }}
          slotProps={{
            legend: {
              position: { vertical: "top", horizontal: "center" },
            },
          }}
          colors={[chartColors.online, chartColors.offline]}
        />
      </Box>
    </Box>
  );
}
