import { useEffect, useState } from "react";
import Head from "next/head";
import { Box, Container, Unstable_Grid2 as Grid } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { OverviewBudget } from "src/sections/overview/overview-budget";
import { OverviewSales } from "src/sections/overview/overview-sales";
import { OverviewTasksProgress } from "src/sections/overview/overview-tasks-progress";
import { OverviewTotalCustomers } from "src/sections/overview/overview-total-customers";
import { OverviewTotalProfit } from "src/sections/overview/overview-total-profit";
import { useRouter } from "next/router";
import useFetch from "src/hooks/use-fetch";
import OverviewRegions from "src/sections/overview/overview-regions";
const Page = () => {
  const [data, setData] = useState(null);
  const _fetch = useFetch();
  const router = useRouter();
  async function getMetrics() {
    const response = await _fetch(`/api/metrics`);
    const data = await response.json();
    setData(data);
  }
  useEffect(() => {
    getMetrics();
  }, []);
  return (
    <>
      <Head>
        <title>Overview | SGC</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid xs={12} sm={6} lg={3}>
              <OverviewTotalCustomers sx={{ height: "100%" }} value={data?.policies || 0} />
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <OverviewBudget sx={{ height: "100%" }} value={data?.security_groups || 0} />
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <OverviewTasksProgress sx={{ height: "100%" }} value={data?.ingress_rules || 0} />
            </Grid>
            <Grid xs={12} sm={6} lg={3}>
              <OverviewTotalProfit sx={{ height: "100%" }} value={data?.egress_rules || 0} />
            </Grid>
            <Grid xs={12} lg={8}>
              <OverviewRegions selected={Object.keys(data?.regions || [])} />
            </Grid>
            <Grid xs={12} md={6} lg={4}>
              <OverviewSales
                labels={Object.keys(data?.accounts || [])}
                chartSeries={[
                  {
                    name: "accounts",
                    data: Object.values(data?.accounts || []),
                  },
                ]}
                sx={{ height: "100%" }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
