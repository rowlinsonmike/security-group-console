import ChartPieIcon from "@heroicons/react/24/solid/ChartPieIcon";
import MapIcon from "@heroicons/react/24/solid/MapIcon";
import UserCircleIcon from "@heroicons/react/24/solid/UserCircleIcon";
import { SvgIcon } from "@mui/material";

export const items = [
  {
    title: "Overview",
    path: "/",
    icon: (
      <SvgIcon fontSize="small">
        <ChartPieIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Security Group Policies",
    path: "/sgp",
    icon: (
      <SvgIcon fontSize="small">
        <MapIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Users",
    path: "/users",
    icon: (
      <SvgIcon fontSize="small">
        <UserCircleIcon />
      </SvgIcon>
    ),
  },
];
