import React, { useState, useEffect } from "react";

import {
  DialogTitle,
  Button,
  Dialog,
  DialogContent,
  InputLabel,
  TextField,
  Alert,
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";

import type { nft } from "@/lib/types/db";
import { PoolABI } from "@/utils/abis/Pool";

type FundDialogProps = {
  eventId: string;
  poolAddress: string;
  nfts: nft[];
};

function FundDialog({ eventId, poolAddress, nfts }: FundDialogProps) {
  const [open, setOpen] = useState(false);
  const [openSuccess, setOpensuccess] = useState(false);
  const { address } = useAccount();
  const [formData, setFormData] = useState({
    to: address || "",
    amounts: new Array(nfts?.length).fill(""),
  });
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const newTotalPrice = formData.amounts.reduce((acc, amount, index) => {
      const nftPrice = nfts[index]?.price || 0;
      return acc + nftPrice * (Number(amount) || 0);
    }, 0);
    setTotalPrice(newTotalPrice);
  }, [formData, nfts]);

  const handleInputChange = (index: number, value: string) => {
    setFormData((prevData) => {
      const updatedAmounts = [...prevData.amounts];
      updatedAmounts[index] = value;
      return { ...prevData, amounts: updatedAmounts };
    });
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleSSClose = () => {
    setOpensuccess(false);
  };
  const filteredNftsAndAmounts = nfts
    .map((nft, index) => ({
      nftId: nft.id,
      quantity: Number(formData.amounts[index]),
    }))
    .filter((item) => item.quantity > 0);

  const filteredNfts = filteredNftsAndAmounts.map((item) => item.nftId);
  const filteredAmounts = filteredNftsAndAmounts.map((item) => item.quantity);

  const { config: mintBatchConfig } = usePrepareContractWrite({
    address: poolAddress as `0x${string}`,
    abi: PoolABI,
    functionName: "mintBatch",
    args: [formData.to, filteredNfts, filteredAmounts],
  });

  const { config: mintConfig } = usePrepareContractWrite({
    address: poolAddress as `0x${string}`,
    abi: PoolABI,
    functionName: "mint",
    args: [formData.to, filteredNfts[0], filteredAmounts[0]],
  });

  // const { write:mintBatch, isSuccess:isMintBatchSuccess } = useContractWrite(mintBatchConfig ? mintBatchConfig : mintConfig);
  const { writeAsync: mint } = useContractWrite(
    mintConfig ? mintConfig : mintBatchConfig,
  );

  const handleSubmit = async () => {
    const getTxHash = await mint?.();
    console.log("submitting", getTxHash);
    await fetch("/api/email", {
      method: "POST",
      body: JSON.stringify({
        storeName: eventId,
        address: address?.toString(),
        items: filteredNftsAndAmounts,
      }),
    });
    setOpensuccess(true);
    handleClose();
  };

  return (
    <React.Fragment>
      <Button
        className="w-30 m-4 flex h-10 items-center justify-center rounded-2xl bg-dark-blue p-4 pb-2 pb-2 pt-2 pt-2 text-xl font-bold text-white hover:bg-light-blue"
        onClick={handleClickOpen}
      >
        Fund
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth={true}
        maxWidth={"xs"}
      >
        <DialogTitle>Order</DialogTitle>
        <DialogContent>
          {nfts.map((nft, index) => (
            <div key={nft.id}>
              <InputLabel htmlFor={`tokenId-${nft.id}`}>
                {`Token ID: ${nft.id}, Price: ${nft.price}`}
              </InputLabel>
              <TextField
                value={formData.amounts[index]}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className="pb-2"
                fullWidth
                variant="standard"
                type="number"
              />
            </div>
          ))}
          <div className="flex flex-row justify-between">
            <p className="pt-2 text-xl font-bold">Total Price: {totalPrice}</p>
            <Button disabled={!mint} onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Snackbar
        open={openSuccess}
        autoHideDuration={6000}
        onClose={handleSSClose}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          Mint NFT success!
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
}

export default FundDialog;
