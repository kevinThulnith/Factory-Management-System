import { PlusCircle, Beaker, FileText, Trash2 } from "lucide-react";
import { InputItem, SelectItem } from "./components";
import { useState } from "react";

function Consumption({
  materials,
  consumptions,
  canAdd,
  canDelete,
  showAddConsumption,
  setShowAddConsumption,
  onSave,
  onDelete,
  loading,
}) {
  const [formData, setFormData] = useState({ material: "", quantity: "1.00", notes: "" });

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.material || parseFloat(formData.quantity) <= 0) return;
    onSave({ material: parseInt(formData.material), quantity: formData.quantity, notes: formData.notes || null });
    setFormData({ material: "", quantity: "1.00", notes: "" });
  };

  return (
    <div className="mt-6 pt-5 border-t border-stone-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-stone-200 flex items-center gap-2">
          <Beaker size={20} /> Material Consumption
        </h3>
        {canAdd && !showAddConsumption && (
          <button type="button" onClick={() => setShowAddConsumption(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-md flex items-center gap-2 transition text-[14px]">
            <PlusCircle size={18} /> Add Consumption
          </button>
        )}
      </div>

      {showAddConsumption && (
        <div className="bg-stone-800 rounded-xl p-4 my-4 inset-shadow-2xl">
          <h4 className="text-md font-semibold text-stone-200 mb-4">Add Material Consumption</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectItem label="Material" name="material" value={formData.material} onChange={handleChange}
                options={materials.map((m) => ({ value: m.id, label: `${m.name} (${m.quantity} ${m.unit_of_measurement || ""})` }))}
                required />
              <InputItem label="Quantity" name="quantity" value={formData.quantity} onChange={handleChange} type="number" required />
              <InputItem label="Notes (optional)" name="notes" value={formData.notes} onChange={handleChange} />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowAddConsumption(false)}
                className="bg-stone-600 hover:bg-stone-700 text-stone-200 py-2 px-3 rounded-md text-[14px]">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-[14px]">
                {loading ? "Saving..." : "Add Consumption"}
              </button>
            </div>
          </form>
        </div>
      )}

      {consumptions.length > 0 ? (
        <div className="space-y-4">
          {consumptions.map((item) => (
            <div key={item.id} className="p-3 bg-card-sub rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-2">
              <div>
                <p className="font-semibold text-stone-300">{item.material_name}</p>
                <p className="text-sm text-stone-400">
                  {parseFloat(item.quantity).toFixed(2)} {item.material_unit || "units"} &middot; by{" "}
                  {item.consumed_by_name || "Unknown"} &middot; {new Date(item.consumed_at).toLocaleString()}
                </p>
                {item.notes && (
                  <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                    <FileText size={12} /> {item.notes}
                  </p>
                )}
              </div>
              {canDelete && (
                <button type="button" onClick={() => onDelete(item.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-stone-400 italic text-center py-4">No material consumption recorded yet.</p>
      )}
    </div>
  );
}

export default Consumption;
