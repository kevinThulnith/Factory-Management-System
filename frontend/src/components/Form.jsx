import LoadingIndicator from "./LoadingIndicator";
import { ChevronLeft, Edit2 } from "lucide-react";
import { cloneElement } from "react";

const Form = ({
  icon,
  heading,
  text_01,
  text_02,
  onClick,
  loading,
  fnction,
  gradient,
  pageError,
  isViewMode,
  children,
}) => (
  <div className="container mx-auto text-star-dust-200">
    <div className="max-w-5xl mx-auto">
      {/* Header */}
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
            className="inline-flex items-center bg-card-sub p-2 shadow-lg rounded-xl gap-1 px-3 pl-2 hover:shadow-sm"
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

      {/* Error Message */}
      {pageError && (
        <div className="mb-6 bg-red-900/30 border border-red-500 text-red-400 p-4 rounded-lg">
          {pageError}
        </div>
      )}

      {/* Body Content */}
      <div className="bg-card-main rounded-xl shadow-md p-6 sm:p-8">
        {children}
      </div>
      {loading && <LoadingIndicator />}
    </div>
  </div>
);

export default Form;
