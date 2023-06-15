import { useCallback, useEffect, useRef, useState } from "react";
import Head from "next/head";
import TrashIcon from "@heroicons/react/24/solid/TrashIcon";
import CheckIcon from "@heroicons/react/24/solid/CheckIcon";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import { Box, Button, Container, Stack, SvgIcon, Typography } from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { UsersTable } from "src/sections/users/users_table";
import { useRouter } from "next/navigation";
import useFetch from "src/hooks/use-fetch";
import toast from "react-hot-toast";
const Page = () => {
  const [page, setPage] = useState(0);
  const _fetch = useFetch();
  const dialog = useRef();
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [active, setActive] = useState(null);
  const [users, setUsers] = useState([]);
  async function deleteUser(id) {
    const response = await _fetch(`/api/users/${id}`, { method: "delete" });
    const result = await response.json();
    if (result?.user) {
      fetchUsers();
    }
  }
  async function fetchUsers() {
    const response = await _fetch("/api/users");
    const users = await response.json();
    setUsers(users);
  }
  useEffect(() => {
    fetchUsers();
  }, []);
  const router = useRouter();
  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(event.target.value);
  }, []);

  return (
    <>
      <Head>
        <title>Users | SGC</title>
      </Head>
      <dialog ref={dialog} id="delete-diag">
        <h1>Are you sure?</h1>
        <Stack direction="row" spacing={2}>
          <Button
            sx={{ maxWidth: 150 }}
            onClick={async () => {
              const toastId = toast.loading("Deleting User...");
              await new Promise((r) => setTimeout(() => r(), 1500));
              await deleteUser(active);
              setActive(null);
              toast.dismiss(toastId);
              dialog?.current?.close();
            }}
            startIcon={
              <SvgIcon fontSize="small">
                <TrashIcon />
              </SvgIcon>
            }
            variant="contained"
          >
            Delete
          </Button>
          <Button
            sx={{ maxWidth: 150 }}
            onClick={async () => {
              setActive(null);
              dialog?.current?.close();
            }}
            startIcon={
              <SvgIcon fontSize="small">
                <CheckIcon />
              </SvgIcon>
            }
            variant="contained"
          >
            Cancel
          </Button>
        </Stack>
      </dialog>
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
                <Typography variant="h4">Users</Typography>
              </Stack>
              <div>
                <Button
                  onClick={() => router.push("/create_user")}
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
            {/* <CustomersSearch /> */}
            <UsersTable
              onClick={(f) => {
                setActive(f?.id);
                dialog?.current?.showModal();
              }}
              count={users.length}
              items={users}
              onDeselectAll={() => {}}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              page={page}
              rowsPerPage={rowsPerPage}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
