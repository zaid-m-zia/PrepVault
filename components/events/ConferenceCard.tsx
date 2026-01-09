import type { Conference } from "@/data/mock/conferences";

type Props = {
  conference: Conference;
};

export default function ConferenceCard({ conference }: Props) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <h3 className="text-lg font-semibold">{conference.name}</h3>

      <p className="text-sm text-gray-400 mt-1">
        Organizer: {conference.organizer}
      </p>

      <div className="mt-3 text-sm space-y-1">
        <p>Mode: {conference.mode}</p>
        <p>Date: {conference.date}</p>
        <p>Location: {conference.location}</p>
      </div>
    </div>
  );
}
