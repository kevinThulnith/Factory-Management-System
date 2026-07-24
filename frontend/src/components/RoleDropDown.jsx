import { ChevronLeft } from "lucide-react";
import { userRoles } from "../constants";
import { useState } from "react";

import {
  ShieldCheck,
  Activity,
  Package,
  CogIcon,
  Crown,
  Eye,
} from "lucide-react";

const RoleDropdown = ({
  value,
  onChange,
  disabled = false,
  error = false,
  helperText,
  label = "Role",
  labelClassName = "block text-sm font-medium ml-1",
}) => {
  const [open, setOpen] = useState(false);

  const roleConfig = {
  ADMIN: {
    icon: <Crown size={16} />,
    color: "purple-600",
    label: "Administrator",
  },
  MANAGER: {
    icon: <ShieldCheck size={16} />,
    color: "blue-600",
    label: "Manager",
  },
  SUPERVISOR: {
    icon: <Eye size={16} />,
    color: "green-600",
    label: "Supervisor",
  },
  OPERATOR: {
    icon: <CogIcon size={16} />,
    color: "orange-600",
    label: "Operator",
  },
  TECHNICIAN: {
    icon: <Activity size={16} />,
    color: "red-600",
    label: "Technician",
  },
  PURCHASING: {
    icon: <Package size={16} />,
    color: "indigo-600",
    label: "Purchasing",
  },
};

  return (
    <div className="flex flex-col mb-[-5px]">
      {label && (
        <label htmlFor="role" className={`mb-2 ${labelClassName}`}>
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={`w-full px-2 py-2 border-none outline-none rounded-xl bg-card-accent flex items-center gap-2 text-left ${
            error ? "ring-1 ring-red-400" : ""
          } ${disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-[#444]"}`}
        >
          <span className={`text-${roleConfig[value].color}`}>
            {roleConfig[value].icon}
          </span>
          <span className="flex-1 text-sm">{roleConfig[value].label}</span>
          <ChevronLeft
            size={16}
            className={`transition-transform ${open ? "rotate-90" : "-rotate-90"}`}
          />
        </button>
        {open && !disabled && (
          <>
            <div className="fixed inset-0 z-0" onClick={() => setOpen(false)} />
            <div className="absolute z-10 mt-1 w-full rounded-xl bg-[#2e2e2e] shadow-lg overflow-hidden">
              {userRoles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    onChange(role);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-card-accent transition-colors ${
                    value === role ? "bg-card-accent" : ""
                  }`}
                >
                  <span className={`text-${roleConfig[role].color}`}>
                    {roleConfig[role].icon}
                  </span>
                  {roleConfig[role].label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      {helperText && (
        <p className="text-xs text-amber-500 mt-1">{helperText}</p>
      )}
    </div>
  );
};

export default RoleDropdown;
