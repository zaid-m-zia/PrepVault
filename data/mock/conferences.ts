export type Conference = {
  id: string;
  name: string;
  organizer: "IEEE" | "Springer";
  mode: "Online" | "Offline" | "Hybrid";
  date: string;
  location: string,
  category: "Conference";
};

export const conferences: Conference[] = [
  {
    id: "ieee-1",
    name: "IEEE International Conference on AI",
    organizer: "IEEE",
    mode: "Hybrid",
    date: "March 15, 2026",
    location: "New Delhi, India",
    category: "Conference",
  },
  {
    id: "springer-1",
    name: "Springer Conference on Data Science",
    organizer: "Springer",
    mode: "Online",
    date: "April 10, 2026",
    location: "Online",
    category: "Conference",
  },
];
