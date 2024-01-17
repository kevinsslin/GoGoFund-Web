"use client";

import { useEffect, useState } from "react";

import type { allEventDto } from "@/lib/types/db";
import EventSelect from "./_components/EventSelect";

function EventsPage() {
  const [dbEvents, setDbEvents] = useState<allEventDto[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/events");
      const data = await response.json();
      console.log(data);
      const now = new Date().getTime();
      setDbEvents(data.filter((e: { endDate: number }) => e.endDate > now));
    };
    fetchData();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center pl-32 pr-32">
      <div className="w-[100%]">
        {/* <Grid container spacing={3} direction="row" justifyContent="flex-start">
          {dbEvents.map((e) => {
            // Calculate time remaining in days
            const timeRemaining =
              (e.endDate - new Date().getTime()) / (1000 * 60 * 60 * 24);
            const daysRemaining =
              timeRemaining > 0 ? Math.ceil(timeRemaining) : 0;

            // Calculate progress
            const progress =
              e.targetValue !== 0 ? (e.currentValue / e.targetValue) * 100 : 0;

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
                  person={e.transactionCount} // Assuming this is correct; replace with actual data if available
                  time={daysRemaining}
                  isFulfilled={e.currentValue >= e.targetValue}
                  isPending={e.status === "pending"}
                />
              </Grid>
            );
          })}
        </Grid> */}
        <EventSelect events={dbEvents}/>
      </div>
    </main>
  );
}

export default EventsPage;
