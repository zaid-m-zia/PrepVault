"use client";

import { useState } from "react";
import type { Resource } from "../../data/mock/resources";
import {
  BookOpen,
  FileText,
  ClipboardList,
  Presentation,
  Youtube,
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

  export default function ResourcesTabs({ resources }: { resources: Resource[] }) {
    const [activeTab, setActiveTab] = useState("pyq");

    return (
      <div className="mt-8">
        {/* Tabs Header */}
        <div className="flex flex-wrap gap-3 border-b">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                aria-pressed={isActive}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                  transition-all duration-200 focus:outline-none
                  ${
                    isActive
                    ? "bg-primary text-white shadow-md ring-2 ring-primary/40"
                    : "bg-transparent text-gray-400 opacity-70 hover:opacity-100 hover:text-primary"
  }
  `}

              >
                <Icon className={`${isActive ? 'text-white' : 'text-gray-400'} transition-colors duration-200`} size={18} />
                <span className={`${isActive ? 'text-white' : 'text-gray-600'} transition-colors duration-200`}>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Tabs Content */}
        <div className="mt-6">
          {activeTab === "pyq" && <PYQTab resources={resources} />}
          {activeTab === "notes" && <NotesTab resources={resources} />}
          {activeTab === "assignments" && <AssignmentsTab resources={resources} />}
          {activeTab === "ppts" && <PPTTab resources={resources} />}
          {activeTab === "playlists" && <PlaylistTab resources={resources} />}
        </div>
      </div>
    );
  }
