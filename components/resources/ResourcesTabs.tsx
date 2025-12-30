"use client";

import { useState } from "react";
import {
  BookOpen,
  FileText,
  ClipboardList,
  Presentation,
  Youtube
} from "lucide-react";

import PYQTab from "./PYQTab";
import NotesTab from "./NotesTab";
import AssignmentsTab from "./AssignmentsTab";
import PPTTab from "./PPTTab";
import PlaylistTab from "./PlaylistTab";

const tabs = [
  { id: "pyq", label: "PYQs", icon: BookOpen },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "ppts", label: "PPTs", icon: Presentation },
  { id: "playlists", label: "Playlists", icon: Youtube },
];

export default function ResourcesTabs() {
  const [activeTab, setActiveTab] = useState("pyq");

  return (
    <div className="mt-8">
      {/* Tabs Header */}
      <div className="flex flex-wrap gap-3 border-b">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-md text-sm font-medium
              ${
                activeTab === id
                  ? "bg-primary text-white"
                  : "text-gray-500 hover:text-primary"
              }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="mt-6">
        {activeTab === "pyq" && <PYQTab />}
        {activeTab === "notes" && <NotesTab />}
        {activeTab === "assignments" && <AssignmentsTab />}
        {activeTab === "ppts" && <PPTTab />}
        {activeTab === "playlists" && <PlaylistTab />}
      </div>
    </div>
  );
}
