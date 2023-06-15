import React from "react";
import { Controller } from "react-hook-form";
import { SvgIcon } from "@mui/material";
import { InputAdornment, OutlinedInput } from "@mui/material";

export default function Input({ name, placeholder, control, icon, type = "text" }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <OutlinedInput
          fullWidth
          type={type}
          placeholder={placeholder}
          startAdornment={
            <InputAdornment position="start">
              <SvgIcon color="action" fontSize="small">
                {icon}
              </SvgIcon>
            </InputAdornment>
          }
          {...field}
        />
      )}
    />
  );
}
