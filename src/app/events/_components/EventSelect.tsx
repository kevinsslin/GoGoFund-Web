"use client";
import * as React from 'react';
import { Tabs, Tab, Typography, Box, Grid } from '@mui/material';
import type { allEventDto } from '@/lib/types/db';
import EventCard from "./EventCard";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function EventGrid({ events }: { events: allEventDto[] }) {
  console.log(events);
  return (
    <Grid container spacing={3} direction="row" justifyContent="flex-start">
      {events && events.map(e => {
        // Calculations (time remaining, progress, etc.)
        const timeRemaining = (e.endDate - new Date().getTime()) / (1000 * 60 * 60 * 24);
        const daysRemaining = timeRemaining > 0 ? Math.ceil(timeRemaining) : 0;
        const progress = e.targetValue !== 0 ? (e.currentValue / e.targetValue) * 100 : 0;

        return (
          <Grid item xs={12} sm={12} md={6} lg={4} xl={4} className="p-10" key={e.displayId}>
            <EventCard
              id={e.displayId}
              name={e.title}
              currency={e.currency}
              progress={progress}
              money={e.currentValue}
              person={e.transactionCount}
              time={daysRemaining}
              isFulfilled={e.currentValue >= e.targetValue}
              isPending={e.status === "pending"}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}

export default function EventSelect({ events }: { events: allEventDto[] }) {
  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // Filter events based on their status
  const pendingEvents = events ? events.filter(e => e.status !== "pending" && new Date().getTime() < e.startDate) : [];
  const ongoingEvents = events ? events.filter(e => e.status !== "pending" && new Date().getTime() < e.endDate && new Date().getTime() >= e.startDate) : [];
  const endedEvents = events ? events.filter(e => new Date().getTime() >= e.endDate) : [];

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Ongoing" {...a11yProps(0)} />
          <Tab label="Upcoming" {...a11yProps(1)} />
          <Tab label="Closed" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0} key="ongoing-tab">
        <EventGrid events={ongoingEvents} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1} key="pending-tab">
        <EventGrid events={pendingEvents} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2} key="ended-tab">
        <EventGrid events={endedEvents} />
      </CustomTabPanel>
    </Box>
  );
}

