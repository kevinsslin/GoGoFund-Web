"use client";

import { useEffect, useState } from "react";

import GetFondDialog from "../events/_components/GetFundDialog";
import Grid from "@mui/material/Grid";
import { useAccount } from "wagmi";

import { type allEventDto } from "@/lib/types/db";

import EventCard from "./_components/EventCard";

function MyEventsPage() {
  const [dbEvents, setDbEvents] = useState<allEventDto[] | null>(null);
  const { address } = useAccount();
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/myevents/${address}`);
      const data = await response.json();
      console.log(data);
      setDbEvents(data);
    };
    fetchData();
  }, [address]);
  // if (!dbEvents) {
  //   return <div>loading...</div>;
  // }
  return (
    <main className="flex min-h-screen flex-col items-center pl-32 pr-32">
      <div className="w-[80%]">
        <div className="flex justify-end">
          <GetFondDialog />
        </div>
        <Grid container spacing={3} direction="row" justifyContent="flex-start">
          {Array.isArray(dbEvents) &&
            dbEvents.map((e) => {
              // Calculate time remaining in days
              const timeRemaining =
                (e.endDate - new Date().getTime()) / (1000 * 60 * 60 * 24);
              const daysRemaining =
                timeRemaining > 0 ? Math.ceil(timeRemaining) : 0;

              // Calculate progress
              const progress =
                e.targetValue !== 0
                  ? (e.currentValue / e.targetValue) * 100
                  : 0;

              return (
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={6}
                  lg={4}
                  xl={4}
                  className="p-10"
                  key={e.displayId}
                >
                  <EventCard
                    id={e.displayId}
                    key={e.displayId}
                    name={e.title}
                    currency={e.currency}
                    progess={progress}
                    money={e.currentValue}
                    person={e.transactionCount} // TODO: Assuming this is correct; replace with actual data if available
                    time={daysRemaining}
                    isFulfilled={e.currentValue >= e.targetValue}
                    isPending={e.status === "pending"}
                  />
                </Grid>
              );
            })}
        </Grid>
      </div>
    </main>
  );
}

export default MyEventsPage;
