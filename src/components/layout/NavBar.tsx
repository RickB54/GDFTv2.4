
// We need to add the Calendar link to the bottom navigation
// I'll add it between Plans and Settings in the menu items array

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Dumbbell, 
  Play, 
  BarChart2, 
  Settings,
  ClipboardList,
  CalendarDays
} from "lucide-react";

const NavBar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/exercises", icon: Dumbbell, label: "Exercises" },
    { path: "/workout", icon: Play, label: "Workout" },
    { path: "/stats", icon: BarChart2, label: "Stats" },
    { path: "/custom-plans", icon: ClipboardList, label: "Plans" },
    { path: "/my-calendar", icon: CalendarDays, label: "Calendar" },
    { path: "/settings", icon: Settings, label: "Settings" }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-gym-dark border-t border-gray-800 flex justify-around items-center z-50">
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            location.pathname === item.path
              ? "text-gym-blue"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <item.icon className="h-5 w-5" />
          <span className="text-xs mt-1">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default NavBar;
