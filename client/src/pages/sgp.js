import { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { subDays, subHours } from "date-fns";
import ArrowDownOnSquareIcon from "@heroicons/react/24/solid/ArrowDownOnSquareIcon";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import { Box, Button, Container, Stack, SvgIcon, Typography } from "@mui/material";
import { useSelection } from "src/hooks/use-selection";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { FirewallsTable } from "src/sections/firewalls/firewall_table";
import { applyPagination } from "src/utils/apply-pagination";
import { useRouter } from "next/navigation";
import useFetch from "src/hooks/use-fetch";

const Page = () => {
  const _fetch = useFetch();
  const [firewalls, setFirewalls] = useState([]);
  async function fetchFirewalls() {
    const response = await _fetch("/api/sgp");
    const firewalls = await response.json();
    setFirewalls(firewalls);
  }
  useEffect(() => {
    fetchFirewalls();
  }, []);
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Security Group Policies | SGC</title>
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
              <Stack spacing={1}>
                <Typography variant="h4">Security Group Policies</Typography>
              </Stack>
              <div>
                <Button
                  onClick={() => router.push("/create_sgp")}
                  startIcon={
                    <SvgIcon fontSize="small">
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                >
                  Add
                </Button>
              </div>
            </Stack>
            <FirewallsTable
              onClick={(f) => router.push(`/sgp_edit/${f.id}`)}
              count={firewalls.length}
              items={firewalls}
              rowsPerPage={firewalls.length}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
