"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import { useParams } from "next/navigation";

import ProductIntro from "../../../components/ProductIntro";
import EditDescription from "../_components/EditDescription";
import EditTitle from "../_components/EditTitle";
import EditValue from "../_components/EditValue";
import NFTDialog from "../_components/NFTDialog";
import Divider from "@mui/material/Divider";

import type { eventDetailDto } from "@/lib/types/db";

function MyEventsIdPage() {
  const { eventId } = useParams();
  const [dbEvents, setDbEvents] = useState<eventDetailDto | null>(null);
  const refreshData = async () => {
    const response = await fetch(`/api/events/${eventId}`);
    const data = await response.json();
    setDbEvents(data);
  };
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/events/${eventId}`);
      console.log(response);
      const data = await response.json();
      console.log(data);
      setDbEvents(data);
    };
    fetchData();
  }, [eventId]);

  if (!dbEvents) {
    return <div>loading...</div>;
  }
  const endDate = new Date(Number(dbEvents.endDate)).toLocaleDateString(
    "en-US",
  );
  const startDate = new Date(Number(dbEvents.startDate)).toLocaleDateString(
    "en-US",
  );
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex w-[50%] flex-col justify-start pb-8 pl-8 pr-8">
        <p className="flex justify-start p-2 text-4xl font-bold">Information</p>
        <Divider
          variant="middle"
          orientation="horizontal"
          sx={{ borderWidth: 1 }}
        />
      </div>
      <div className="flex flex-row justify-center">
        <div className="pr-24">
          <Image
            src="/events.jpeg"
            alt="event"
            width={400}
            height={400}
            className="p-5 "
          />
        </div>
        <div>
          <EditTitle eventId={eventId as string} eventTitle={dbEvents.title} />
          <div className="flex flex-col p-2">
            <div className="flex flex-row space-x-4">
              <p className="flex items-center justify-center text-lg">
                目標額 {dbEvents.currency} $
                {dbEvents.status === "pending" ? (
                  <EditValue
                    eventId={eventId as string}
                    eventTargetValue={dbEvents.targetValue}
                  />
                ) : (
                  dbEvents.targetValue
                )}
              </p>
            </div>
            <p className="pt-2 text-lg">
              已募集 {dbEvents.currency} ${dbEvents.currentValue}
            </p>
          </div>
          <p className="p-2 text-lg">
            募資期間 {startDate} – {endDate}
          </p>
          <NFTDialog onRefresh={refreshData} />
        </div>
      </div>
      <div className="flex w-[50%] flex-col justify-start p-8">
        <p className="flex justify-start p-2 text-4xl font-bold">Description</p>
        <Divider
          variant="middle"
          orientation="horizontal"
          sx={{ borderWidth: 1 }}
        />
        <EditDescription
          eventDescription={dbEvents.description}
          eventId={eventId as string}
        />
      </div>
      <div className="justify-cent flex w-[50%] flex-col p-8">
        <ProductIntro nfts={dbEvents.nfts} />
      </div>
    </main>
  );
}

export default MyEventsIdPage;
