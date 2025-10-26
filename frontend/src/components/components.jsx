import { Save, ChevronLeft, Edit2 } from "lucide-react";
import { cloneElement } from "react";

// !Input component for forms
export const InputItem = ({ label, name, icon, error, ...props }) => (
  <div className="flex flex-col">
    <label
      htmlFor={name}
      className="mb-2 text-sm text-stone-400 ml-1 flex items-center gap-2"
    >
      {icon && cloneElement(icon, { size: 16 })}
      {label}
    </label>
    <input
      id={name}
      name={name}
      className="bg-card-sub outline-none border-none rounded-lg p-2 text-stone-300 disabled:bg-card-accent disabled:text-stone-400"
      {...props}
    />
    {error && <small className="text-red-500 mt-1 text-xs">{error}</small>}
  </div>
);

// !Textarea component
export const TextareaItem = ({ label, name, icon, error, ...props }) => (
  <div className="flex flex-col">
    <label
      htmlFor={name}
      className="mb-2 text-sm font-medium text-stone-400 flex items-center gap-2"
    >
      {icon && cloneElement(icon, { size: 16 })}
      {label}
    </label>
    <textarea
      id={name}
      name={name}
      className="bg-card-sub rounded-lg p-2 resize-none text-stone-300 outline-none disabled:bg-card-accent disabled:text-stone-400"
      {...props}
    />
    {error && <small className="text-red-500 mt-1 text-xs">{error}</small>}
  </div>
);

// !Select component
export const SelectItem = ({
  label,
  name,
  icon,
  options,
  error,
  loading,
  ...props
}) => (
  <div className="flex flex-col">
    <label
      htmlFor={name}
      className="mb-2 text-sm font-medium text-stone-400 flex items-center gap-2"
    >
      {icon && cloneElement(icon, { size: 16 })}
      {label}
    </label>
    {loading ? (
      <div className="bg-[#3a3a3a] border border-stone-600 rounded-lg p-2 text-stone-400">
        Loading...
      </div>
    ) : (
      <select
        id={name}
        name={name}
        className={`bg-card-sub rounded-lg p-2 text-stone-300 outline-none disabled:bg-card-accent disabled:text-stone-300 disabled:cursor-not-allowed appearance-none`}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )}
    {error && <small className="text-red-500 mt-1 text-xs">{error}</small>}
  </div>
);

// !Info display component for view mode
export const InfoItem = ({ icon, label, value }) => (
  <div className="bg-card-sub p-2 pl-3 rounded-lg border-l-4 border-orange-600">
    <label className="flex items-center gap-2 text-sm text-stone-400 mb-2">
      {icon && cloneElement(icon, { size: 16 })}
      {label}
    </label>
    <p className="text-base font-medium text-stone-300">
      {value === null || value === undefined || value === "" ? (
        <span className="text-stone-500">N/A</span>
      ) : (
        value
      )}
    </p>
  </div>
);

// !Buttons component for form actions
export const Buttons = ({
  onCancel,
  text_01 = "Save Changes",
  disabled = false,
}) => (
  <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-star-dust-600">
    <button
      type="button"
      onClick={onCancel}
      className="bg-gray-600 hover:bg-gray-500 text-stone-200 font-medium duration-100 py-2 px-3 rounded-lg text-sm"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={disabled}
      className="bg-orange-500 hover:bg-orange-400 text-stone-800 font-medium duration-100 py-2 px-3 rounded-lg text-sm"
    >
      {text_01} <Save className="inline ml-1" size={16} />
    </button>
  </div>
);

export const FormHeader = ({
  icon,
  heading,
  text_01,
  text_02,
  onClick,
  fnction,
  gradient,
  isViewMode,
}) => (
  <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-card-main p-6 rounded-xl shadow-lg">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div
          className={` bg-gradient-to-r ${gradient} rounded-lg p-2 mr-4 text-stone-200`}
        >
          {icon && cloneElement(icon, { size: 40 })}
        </div>
        <div>
          <h1 className="text-2xl font-medium">{heading}</h1>
          <p className="text-stone-400 mt-1 text-1xl">{text_01}</p>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={onClick}
        className="inline-flex items-center bg-card-sub p-2 shadow-lg rounded-xl gap-1 px-3 hover:shadow-sm"
      >
        <ChevronLeft size={20} />
        {text_02}
      </button>
      {isViewMode && (
        <button
          onClick={fnction}
          className="inline-flex items-center bg-card-sub p-2 shadow-lg rounded-xl gap-2 px-3 hover:shadow-sm"
        >
          <Edit2 size={18} />
          Edit
        </button>
      )}
    </div>
  </div>
);
