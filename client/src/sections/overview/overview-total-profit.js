import PropTypes from "prop-types";
import ArrowRightOnRectangleIcon from "@heroicons/react/24/solid/ArrowRightOnRectangleIcon";
import { Avatar, Card, CardContent, Stack, SvgIcon, Typography } from "@mui/material";

export const OverviewTotalProfit = (props) => {
  const { value, sx } = props;

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={3}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              Egress Rule Count
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Stack>
          <Avatar
            sx={{
              backgroundColor: "primary.main",
              height: 56,
              width: 56,
            }}
          >
            <SvgIcon>
              <ArrowRightOnRectangleIcon />
            </SvgIcon>
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
};

OverviewTotalProfit.propTypes = {
  value: PropTypes.string,
  sx: PropTypes.object,
};
