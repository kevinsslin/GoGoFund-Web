"use client";

import { useState } from "react";

import ClickAwayListener from "@mui/material/ClickAwayListener";
import Input from "@mui/material/Input";
import Typography from "@mui/material/Typography";
import { useAccount } from "wagmi";

import { updateEvent } from "./actions";

type Props = {
  eventTargetValue: number;
  eventId: string;
};

function EditValue({ eventTargetValue, eventId }: Props) {
  const [currentValue, setCurrentValue] = useState(eventTargetValue);
  const [editingValue, setEditingValue] = useState(false);

  const { address } = useAccount();

  const handleUpdateName = async () => {
    if (currentValue === null) {
      alert("List amount cannot be empty");
      return;
    }

    const updatedEvent = await updateEvent(address, eventId, {
      targetValue: currentValue,
    });
    if (updatedEvent) {
      setCurrentValue(updatedEvent.targetValue);
    }
    setEditingValue(false);
  };

  return (
    <>
      {editingValue ? (
        <ClickAwayListener onClickAway={handleUpdateName}>
          <Input
            autoFocus
            type="number"
            value={currentValue}
            onChange={(e) => setCurrentValue(Number(e.target.value))}
            placeholder="Enter a new amount..."
            sx={{ width: "50%" }}
          />
        </ClickAwayListener>
      ) : (
        <button
          onClick={() => setEditingValue(true)}
          className="rounded-md p-2 hover:bg-white/10"
        >
          <Typography className="break-all text-start text-lg">
            {currentValue != null ? currentValue : eventTargetValue}
          </Typography>
        </button>
      )}
    </>
  );
}

export default EditValue;
