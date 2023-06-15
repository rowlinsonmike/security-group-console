import Head from "next/head";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import { Box, Button, Container, Stack, SvgIcon, Typography } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { useRouter } from "next/router";
import Input from "../components/Input";
import { useForm } from "react-hook-form";
import TagIcon from "@heroicons/react/24/solid/TagIcon";
import MapIcon from "@heroicons/react/24/solid/MapIcon";
import BuildingIcon from "@heroicons/react/24/solid/BuildingOffice2Icon";
import WifiIcon from "@heroicons/react/24/solid/WifiIcon";
import useFetch from "src/hooks/use-fetch";
import toast from "react-hot-toast";

const Page = () => {
  const router = useRouter();
  const _fetch = useFetch();
  const { control, getValues } = useForm({
    defaultValues: {
      name: "",
      account: "",
      region: "",
      vpc: "",
    },
  });
  return (
    <>
      <Head>
        <title>Create SGP | SGC</title>
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
                <Typography variant="h4">Create Security Group Policy</Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack sx={{ width: "50%" }} spacing={2}>
            <Input name="name" placeholder="Name" icon={<TagIcon />} control={control} />
            <Input
              name="account"
              placeholder="Account Id"
              icon={<BuildingIcon />}
              control={control}
            />
            <Input name="region" placeholder="Region" icon={<MapIcon />} control={control} />
            <Input name="vpc" placeholder="VPC Id" icon={<WifiIcon />} control={control} />

            <Button
              sx={{ marginLeft: "auto !important", maxWidth: 200 }}
              onClick={async () => {
                const toastId = toast.loading("Creating SGP...");
                await new Promise((r) => setTimeout(() => r(), 1500));
                let payload = { ...getValues(), config: {}, html: "" };
                let response = await _fetch("/api/sgp", {
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                  },
                  method: "POST",
                  body: JSON.stringify(payload),
                });
                let responseBody = await response.json();
                toast.dismiss(toastId);
                if (responseBody?.id) {
                  router.push(`/sgp_edit/${responseBody.id}`);
                }
              }}
              startIcon={
                <SvgIcon fontSize="small">
                  <PlusIcon />
                </SvgIcon>
              }
              variant="contained"
            >
              Save
            </Button>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
