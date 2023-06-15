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
import ChevronRightIcon from "@heroicons/react/24/solid/ChevronRightIcon";

import { Scrollbar } from "src/components/scrollbar";

export const FirewallsTable = (props) => {
  const { items = [], onClick = () => {}, selected = [] } = props;

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox"></TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>VPC</TableCell>
                <TableCell>Region</TableCell>
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
                          <ChevronRightIcon />
                        </SvgIcon>
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Stack alignItems="center" direction="row" spacing={2}>
                        <Typography variant="subtitle2">{item.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{item.account}</TableCell>
                    <TableCell>{item.vpc}</TableCell>
                    <TableCell>{item.region}</TableCell>
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
