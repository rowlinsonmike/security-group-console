import Head from "next/head";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import { Box, Button, Container, Stack, SvgIcon, Typography } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { useRouter } from "next/router";
import Input from "../components/Input";
import { useForm } from "react-hook-form";
import EnvelopeIcon from "@heroicons/react/24/solid/EnvelopeIcon";
import KeyIcon from "@heroicons/react/24/solid/KeyIcon";
import useFetch from "src/hooks/use-fetch";
import { toast } from "react-hot-toast";
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
        <title>Create User | SGC</title>
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
                <Typography variant="h4">Create User</Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack sx={{ width: "50%" }} spacing={2}>
            <Input name="email" placeholder="email" icon={<EnvelopeIcon />} control={control} />
            <Input
              name="password"
              type="password"
              placeholder="password"
              icon={<KeyIcon />}
              control={control}
            />
            <Button
              sx={{ marginLeft: "auto !important", maxWidth: 200 }}
              onClick={async () => {
                const toastId = toast.loading("Creating User...");
                await new Promise((r) => setTimeout(() => r(), 1500));
                let payload = { ...getValues() };
                let response = await _fetch("/api/users", {
                  method: "POST",
                  body: JSON.stringify(payload),
                });
                let responseBody = await response.json();
                toast.dismiss(toastId);
                if (responseBody?.id) {
                  router.push(`/users`);
                } else {
                  toast.error("Failed to create user");
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
