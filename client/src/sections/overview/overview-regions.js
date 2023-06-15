import React from "react";
import { ComposableMap, Geographies, Geography, Marker, Annotation } from "react-simple-maps";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material";
import REGIONS from "./regions.json";
const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

export default function OverviewRegions({ selected = [] }) {
  return (
    <Card>
      <CardHeader title="Region Overview" />
      <CardContent>
        <ComposableMap>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography key={geo.rsmKey} geography={geo} fill="#1c2536" stroke="#ffffff" />
              ))
            }
          </Geographies>
          {REGIONS.filter((r) => selected.includes(r.code)).map((r) => {
            return (
              <>
                <Marker coordinates={[r.long, r.lat]}>
                  <circle r={8} fill="#12b981" />
                </Marker>
                {/* <Annotation
                  subject={[r.long, r.lat]}
                  dx={-10}
                  dy={40}
                  connectorProps={{
                    stroke: "#12b981",
                    strokeWidth: 3,
                    strokeLinecap: "round",
                  }}
                >
                  <text x="-8" textAnchor="end" alignmentBaseline="middle" fill="#12b981">
                    {r.code}
                  </text>
                </Annotation> */}
              </>
            );
          })}
        </ComposableMap>
      </CardContent>
    </Card>
  );
}
