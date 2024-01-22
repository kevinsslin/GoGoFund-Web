"use client";

import { useState } from "react";
import React from "react";

import { useParams } from "next/navigation";

import { DialogTitle } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import { useAccount, useContractWrite, usePrepareContractWrite } from "wagmi";

import { PoolFactoryABI } from "@/utils/abis/PoolFactory";
import { POOL_FACTORY_ADDRESS } from "@/utils/addresses";

// Define formData list
interface FormData {
  address: string;
  price: number;
  name: string;
  description: string;
  totalAmount: number;
  imageSrc: string;
}

interface NFTDialogProps {
  onRefresh: () => Promise<void>;
}

function GetFondDialog({ onRefresh }: NFTDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { address } = useAccount();
  const { eventId } = useParams();
  const [resultAddress, setResultAddress] = useState("");
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [formData, setFormData] = useState<FormData>({
    address: address?.toString() || "",
    name: "",
    description: "",
    price: 0,
    totalAmount: 0,
    imageSrc: "",
  });

  const [poolData, setPoolData] = useState({
    poolJson: "",
  });

  // Define handleChange to update formData
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    // Update formData with the new value
    const updatedValue =
      name === "price" || name === "totalAmount" ? parseInt(value, 10) : value;

    setFormData((prevState) => ({
      ...prevState,
      [name]: updatedValue,
    }));
  };

  // Define handleSubmit to create a new event
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Submitting:", formData);

    try {
      const response = await fetch(`/api/nfts/${eventId}`, {
        method: "POST",
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error from API:", errorData.error);
      } else {
        await onRefresh();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const { config, error } = usePrepareContractWrite({
    address: POOL_FACTORY_ADDRESS as `0x${string}`,
    abi: PoolFactoryABI,
    functionName: "createPool",
    args: [poolData.poolJson],
    onSuccess: (data) => {
      console.log("Successdata", data);
      setResultAddress(data.result?.toString() || "");
    },
  });

  const { writeAsync: publish } = useContractWrite(config);
  const handlePublish = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/${address}/publish`);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error from API:", errorData.error);
        // Handle error: Display it in UI, etc.
      } else {
        const tempData = await response.json();
        setPoolData({
          poolJson: tempData,
        });
        console.log(poolData);
        await publish?.();
        if (error) {
          console.log("error");
          console.log(error);
        }
        console.log("isContractSuccess");
        await fetch(`/api/myevents/${address}/${eventId}/publish`, {
          method: "PUT",
          body: JSON.stringify({ eventAddress: resultAddress }),
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <React.Fragment>
      <button
        className="h-15 m-4 flex w-64 items-center justify-center rounded-2xl bg-dark-blue p-4 text-xl font-bold text-white"
        onClick={handleClickOpen}
      >
        Add Product
      </button>
      <button
        className="h-15 m-4 flex w-64 items-center justify-center rounded-2xl bg-dark-blue p-4 text-xl font-bold text-white"
        onClick={handlePublish}
      >
        Publish
      </button>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth={true}
        maxWidth={"md"}
      >
        <DialogTitle>Create Product</DialogTitle>
        <DialogContent className="space-y-2">
          <InputLabel htmlFor="name">Product Name : </InputLabel>
          <TextField
            autoFocus
            margin="dense"
            id="NFT Name"
            name="name"
            type="text"
            fullWidth
            variant="standard"
            onChange={handleChange}
            required
            className="pb-2"
          />
          <InputLabel htmlFor="name">Price : </InputLabel>
          <TextField
            autoFocus
            margin="dense"
            id="Price"
            name="price"
            type="number"
            variant="standard"
            onChange={handleChange}
            fullWidth
            required
            className="pb-2"
          />
          <InputLabel htmlFor="name">Total Amount : </InputLabel>
          <TextField
            autoFocus
            margin="dense"
            id="Total Amount"
            name="totalAmount"
            type="number"
            fullWidth
            variant="standard"
            onChange={handleChange}
            required
            className="pb-2"
          />
          <InputLabel htmlFor="name">Description : </InputLabel>
          <TextField
            autoFocus
            margin="dense"
            id="Description"
            name="description"
            type="string"
            fullWidth
            variant="standard"
            onChange={handleChange}
            required
            className="pb-2"
          />
          <form onSubmit={handleSubmit} className="flex justify-center">
            <Button type="submit" onClick={handleClose}>
              Submit
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}

export default GetFondDialog;
