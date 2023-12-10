import { TextField } from "@mui/material";
import { useState } from "react";

const CustomInput = ({ val, onChange }) => {
  const [value, setValue] = useState(val);

  return (
    <TextField
      value={value}
      onChange={(event) => {
        setValue(event.target.value);
        onChange(event.target.value);
      }}
    />
  );
};

export default CustomInput;
