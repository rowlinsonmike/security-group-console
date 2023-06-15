import {
  Box,
  Card,
  Stack,
  Table,
  TableBody,
  IconButton,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  SvgIcon,
} from "@mui/material";
import TrashIcon from "@heroicons/react/24/solid/TrashIcon";

import { Scrollbar } from "src/components/scrollbar";

export const UsersTable = (props) => {
  const { items = [], onClick = () => {}, selected = [] } = props;

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items?.map((item) => {
                const isSelected = selected.includes(item.id);
                return (
                  <TableRow hover key={item.id} selected={isSelected}>
                    <TableCell padding="checkbox">
                      <IconButton onClick={() => onClick(item)}>
                        <SvgIcon fontSize="small">
                          <TrashIcon />
                        </SvgIcon>
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Stack alignItems="center" direction="row" spacing={2}>
                        <Typography variant="subtitle2">{item.email}</Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Scrollbar>
    </Card>
  );
};
