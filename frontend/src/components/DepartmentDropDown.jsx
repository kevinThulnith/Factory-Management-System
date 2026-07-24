import { ChevronLeft, Building2 } from "lucide-react";
import { useState } from "react";

const DepartmentDropdown = ({
  departments,
  value,
  onChange,
  error = false,
  label = "Department",
  labelClassName = "block text-sm font-medium ml-1",
  placeholder = "Select Department",
}) => {
  const [open, setOpen] = useState(false);

  const selectedDepartment = departments.find(
    (d) => d.id === value || d.id === Number(value),
  );

  return (
    <div className="flex flex-col mb-[-5px]">
      {label && (
        <label htmlFor="department" className={`mb-2 ${labelClassName}`}>
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`w-full px-2 py-2 border-none outline-none rounded-xl bg-card-accent flex items-center gap-2 text-left hover:bg-[#444] ${
            error ? "ring-1 ring-red-400" : ""
          }`}
        >
          <span className="text-sky-400">
            <Building2 size={16} />
          </span>
          <span className="flex-1 text-sm">
            {selectedDepartment?.name || placeholder}
          </span>
          <ChevronLeft
            size={16}
            className={`transition-transform ${open ? "rotate-90" : "-rotate-90"}`}
          />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-0" onClick={() => setOpen(false)} />
            <div className="absolute z-10 mt-1 w-full rounded-xl bg-[#2e2e2e] shadow-lg overflow-hidden max-h-48 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-card-accent transition-colors text-stone-400 ${
                  !value ? "bg-card-accent" : ""
                }`}
              >
                <Building2 size={16} />
                Select Department
              </button>
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => {
                    onChange(dept.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-card-accent transition-colors ${
                    value === dept.id || Number(value) === dept.id
                      ? "bg-card-accent"
                      : ""
                  }`}
                >
                  <span className="text-sky-400">
                    <Building2 size={16} />
                  </span>
                  {dept.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DepartmentDropdown;
