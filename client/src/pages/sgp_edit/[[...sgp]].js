import { useEffect, useState } from "react";
import Head from "next/head";
import { Box, Container, Stack, Typography } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import Diagram from "../../components/Diagram";
import { useRouter } from "next/router";
import useFetch from "src/hooks/use-fetch";

const Page = () => {
  const _fetch = useFetch();
  const [data, setData] = useState(null);
  const router = useRouter();
  async function getFirewall() {
    const response = await _fetch(`/api/sgp/${router.query.sgp}`);
    const data = await response.json();
    setData(data?.sgp);
  }
  useEffect(() => {
    if (router.query.sgp) {
      getFirewall();
    }
  }, [router.query]);
  return (
    <>
      <Head>
        <title>Edit SGP | SGC</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack mb={2} spacing={1}>
                <Typography variant="h4">
                  {data?.name} ({data?.account} | {data?.region} | {data?.vpc})
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Diagram refresh={getFirewall} id={router.query.sgp} data={data} router={router} />
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
