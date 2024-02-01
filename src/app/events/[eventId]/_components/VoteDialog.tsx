import React, { useState } from "react";

import {
  DialogTitle,
  Button,
  Dialog,
  DialogContent,
  InputLabel,
  Alert,
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import { useContractWrite, usePrepareContractWrite } from "wagmi";

import { PoolABI } from "@/utils/abis/Pool";

type FundDialogProps = {
  poolAddress: string;
  onRefresh: () => Promise<void>;
};

function VoteDialog({ poolAddress, onRefresh }: FundDialogProps) {
  const [open, setOpen] = useState(false);
  const [openSuccess, setOpensuccess] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleSSClose = () => {
    setOpensuccess(false);
  };

  const { config: voteConfig } = usePrepareContractWrite({
    address: poolAddress as `0x${string}`,
    abi: PoolABI,
    functionName: "vote",
    args: [1, true],
  });

  const { writeAsync: vote } = useContractWrite(voteConfig);

  const handleSubmit = async () => {
    const getTxHash = await vote?.();
    console.log("submitting", getTxHash);
    setOpensuccess(true);
    onRefresh();
    handleClose();
  };

  return (
    <React.Fragment>
      <Button
        className="w-30 m-4 flex h-10 items-center justify-center rounded-2xl bg-dark-blue p-4 pb-2 pb-2 pt-2 pt-2 text-xl font-bold text-white hover:bg-light-blue"
        onClick={handleClickOpen}
      >
        Oppose
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth={true}
        maxWidth={"xs"}
      >
        <DialogTitle>Vote</DialogTitle>
        <DialogContent>
          <InputLabel htmlFor="name">
            Are you sure you want to oppose?
          </InputLabel>
          <div className="flex flex-row justify-between">
            <Button disabled={!vote} onClick={handleSubmit}>
              Sure
            </Button>
            <Button onClick={handleClose}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Snackbar
        open={openSuccess}
        autoHideDuration={6000}
        onClose={handleSSClose}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          Oppose success!
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
}

export default VoteDialog;
