import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { StatusBadge, Pill, TypeBadge } from "../components/Badge";
import StatCard from "../components/StatCard";
import {
  ConfirmModal,
  FormModal,
  FormGrid,
  FormGroup,
  FormInput,
  FormSelect,
} from "../components/Modal";

export default function SpecMaster() {
  const { specs, setSpecs, toast } = useApp();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(-1);
  const [formData, setFormData] = useState({});
  const [confirmModal, setConfirmModal] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Group specs by itemCode
  const groupedSpecs = useMemo(() => {
    const groups = {};
    specs.forEach((spec) => {
      if (!groups[spec.itemCode]) {
        groups[spec.itemCode] = {
          itemCode: spec.itemCode,
          itemDesc: spec.itemDesc,
          createdBy: spec.createdBy || "Admin",
          approvedBy: spec.approvedBy || "QA Manager",
          checkpoints: [],
        };
      }
      groups[spec.itemCode].checkpoints.push(spec);
    });
    return Object.values(groups);
  }, [specs]);

  // Filter grouped specs based on search
  const displayedGroups = useMemo(() => {
    return search
      ? groupedSpecs.filter(
          (g) =>
            [g.itemCode, g.itemDesc, g.createdBy, g.approvedBy].some((v) =>
              v.toLowerCase().includes(search.toLowerCase()),
            ) ||
            g.checkpoints.some((c) =>
              [c.checkpoint, c.spec, c.instrument, c.frequency, c.place].some(
                (v) => v.toLowerCase().includes(search.toLowerCase()),
              ),
            ),
        )
      : groupedSpecs;
  }, [groupedSpecs, search]);

  const toggleExpand = (itemCode) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemCode)) {
      newExpanded.delete(itemCode);
    } else {
      newExpanded.add(itemCode);
    }
    setExpandedItems(newExpanded);
  };

  const openForm = (idx = -1) => {
    setEditIdx(idx);
    setFormData(
      idx >= 0
        ? { ...specs[idx] }
        : {
            itemCode: "",
            itemDesc: "",
            customer: "Customer",
            testName: "Dim",
            checkpoint: "",
            spec: "",
            uom: "mm",
            instrument: "Vernier",
            frequency: "Every Lot",
            place: "WRL",
            conv: 1.0,
            sampLevel: "S2",
            status: "Active",
            createdBy: "Admin",
            approvedBy: "QA Manager",
          },
    );
    setFormOpen(true);
  };

  const saveForm = () => {
    if (!formData.itemCode || !formData.checkpoint || !formData.spec) {
      toast("Fill required fields", "warn");
      return;
    }
    if (editIdx >= 0)
      setSpecs((prev) =>
        prev.map((s, i) => (i === editIdx ? { ...formData, id: s.id } : s)),
      );
    else setSpecs((prev) => [...prev, { ...formData, id: Date.now() }]);
    toast(editIdx >= 0 ? "Spec updated" : "Spec added", "success");
    setFormOpen(false);
  };

  const deleteSpec = (i) => {
    setConfirmModal({
      title: "Delete Specification",
      body: `Delete spec for <strong>${specs[i].checkpoint}</strong> (${specs[i].itemCode})?`,
      confirmLabel: "Delete",
      confirmColor: "#dc2626",
      onConfirm: () => {
        setSpecs((prev) => prev.filter((_, idx) => idx !== i));
        toast("Specification deleted", "warn");
        setConfirmModal(null);
      },
    });
  };

  const f = (field) => (e) =>
    setFormData((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div>
      <div className="text-[11px] text-slate-400 font-mono mb-2">
        🏠 QMAS ›{" "}
        <span className="text-blue-600 font-semibold">
          Specification Master
        </span>
      </div>
      <div className="mb-5">
        <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
          📏 Specification Master Table
        </h1>
        <p className="text-slate-400 text-[12.5px] mt-1">
          Item-wise test specifications — click item to expand checkpoints
        </p>
      </div>
      <div className="flex gap-2.5 mb-4 flex-wrap">
        <StatCard
          label="Total Items"
          value={displayedGroups.length}
          sub="Unique items"
          color="blue"
        />
        <StatCard
          label="Total Specs"
          value={specs.length}
          sub="All checkpoints"
          color="slate"
        />
        <StatCard
          label="Dimensional"
          value={specs.filter((s) => s.testName === "Dim").length}
          sub="Dim tests"
          color="green"
        />
        <StatCard
          label="Visual"
          value={specs.filter((s) => s.testName === "Vis").length}
          sub="Visual tests"
          color="purple"
        />
        <StatCard
          label="Reliability"
          value={specs.filter((s) => s.testName === "Rel").length}
          sub="Reliability tests"
          color="amber"
        />
      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50 rounded-t-xl">
          <div className="text-[13px] font-bold flex items-center gap-2">
            📊 Specification Records by Item
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                🔍
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items, specs…"
                className="pl-7 pr-3 py-1.5 text-[12.5px] bg-slate-100 border border-slate-200 rounded-lg outline-none w-48 focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>
            <button
              onClick={() => openForm()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
            >
              + Add Spec
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {[
                  "",
                  "Item Code",
                  "Item Description",
                  "Created By",
                  "Approved By",
                  "Checkpoints",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-right text-[10.5px] font-bold uppercase tracking-wide text-slate-400 border-b border-slate-100 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedGroups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-slate-400 py-8">
                    No specifications found.
                  </td>
                </tr>
              ) : (
                displayedGroups.map((group) => (
                  <tbody key={group.itemCode}>
                    <tr
                      className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => toggleExpand(group.itemCode)}
                    >
                      <td className="px-3 py-2.5">
                        <button className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">
                          {expandedItems.has(group.itemCode) ? "▼" : "▶"}
                        </button>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-mono text-[11.5px] font-bold text-blue-600">
                          {group.itemCode}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-medium text-[11.5px] max-w-[220px]">
                        {group.itemDesc}
                      </td>
                      <td className="px-3 py-2.5 text-[12px] text-slate-600">
                        {group.createdBy}
                      </td>
                      <td className="px-3 py-2.5 text-[12px] text-slate-600">
                        {group.approvedBy}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                          {group.checkpoints.length} checks
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge
                          status={
                            group.checkpoints.every(
                              (c) => c.status === "Active",
                            )
                              ? "Approved"
                              : "Rejected"
                          }
                        />
                      </td>
                    </tr>
                    {expandedItems.has(group.itemCode) &&
                      group.checkpoints.map((row, idx) => (
                        <tr
                          key={row.id}
                          className="border-b border-slate-100 bg-slate-50/40 hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="px-3 py-2"></td>
                          <td colSpan={6} className="px-6 py-3">
                            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3 items-center">
                              <div>
                                <div className="text-[9.5px] font-bold uppercase text-slate-400">
                                  Test
                                </div>
                                <TypeBadge type={row.testName} />
                              </div>
                              <div>
                                <div className="text-[9.5px] font-bold uppercase text-slate-400">
                                  Checkpoint
                                </div>
                                <div className="text-[12px] font-medium">
                                  {row.checkpoint}
                                </div>
                              </div>
                              <div>
                                <div className="text-[9.5px] font-bold uppercase text-slate-400">
                                  Specification
                                </div>
                                <div className="font-mono text-[11.5px] text-amber-600 font-bold">
                                  {row.spec}
                                </div>
                              </div>
                              <div>
                                <div className="text-[9.5px] font-bold uppercase text-slate-400">
                                  UOM / Instrument
                                </div>
                                <div className="text-[12px] text-slate-600">
                                  {row.uom} / {row.instrument}
                                </div>
                              </div>
                              <div>
                                <div className="text-[9.5px] font-bold uppercase text-slate-400">
                                  Frequency / Place
                                </div>
                                <div className="text-[12px] text-slate-600">
                                  {row.frequency} / {row.place}
                                </div>
                              </div>
                              <div>
                                <div className="text-[9.5px] font-bold uppercase text-slate-400">
                                  Sample Level
                                </div>
                                <Pill color="purple">{row.sampLevel}</Pill>
                              </div>
                              <div>
                                <div className="text-[9.5px] font-bold uppercase text-slate-400">
                                  Status
                                </div>
                                <StatusBadge
                                  status={
                                    row.status === "Active"
                                      ? "Approved"
                                      : "Rejected"
                                  }
                                />
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openForm(specs.indexOf(row));
                                  }}
                                  className="w-7 h-7 rounded-md bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-500 hover:text-white transition-all text-xs flex items-center justify-center"
                                >
                                  ✏
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSpec(specs.indexOf(row));
                                  }}
                                  className="w-7 h-7 rounded-md bg-red-50 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs flex items-center justify-center"
                                >
                                  🗑
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FormModal
        open={formOpen}
        title={<>📏 {editIdx >= 0 ? "Edit" : "Add"} Specification</>}
        onSave={saveForm}
        onCancel={() => setFormOpen(false)}
      >
        <FormGrid>
          <FormGroup label="Item Code *">
            <FormInput
              value={formData.itemCode || ""}
              onChange={f("itemCode")}
            />
          </FormGroup>
          <FormGroup label="Item Description">
            <FormInput
              value={formData.itemDesc || ""}
              onChange={f("itemDesc")}
            />
          </FormGroup>
          <FormGroup label="Customer Type">
            <FormSelect
              value={formData.customer || "Customer"}
              onChange={f("customer")}
            >
              <option>Customer</option>
              <option>Non-Inductive</option>
            </FormSelect>
          </FormGroup>
          <FormGroup label="Test Name">
            <FormSelect
              value={formData.testName || "Dim"}
              onChange={f("testName")}
            >
              <option value="Dim">Dimensional</option>
              <option value="Vis">Visual</option>
              <option value="Rel">Reliability</option>
            </FormSelect>
          </FormGroup>
          <FormGroup label="Check Point *">
            <FormInput
              value={formData.checkpoint || ""}
              onChange={f("checkpoint")}
            />
          </FormGroup>
          <FormGroup label="Specification *">
            <FormInput
              value={formData.spec || ""}
              onChange={f("spec")}
              placeholder="e.g. 10±0.2 or ≥25"
            />
          </FormGroup>
          <FormGroup label="UOM">
            <FormInput value={formData.uom || "mm"} onChange={f("uom")} />
          </FormGroup>
          <FormGroup label="Instrument">
            <FormInput
              value={formData.instrument || ""}
              onChange={f("instrument")}
            />
          </FormGroup>
          <FormGroup label="Frequency">
            <FormInput
              value={formData.frequency || "Every Lot"}
              onChange={f("frequency")}
            />
          </FormGroup>
          <FormGroup label="Place">
            <FormInput value={formData.place || "WRL"} onChange={f("place")} />
          </FormGroup>
          <FormGroup label="Conv. Factor">
            <FormInput
              type="number"
              step="0.01"
              value={formData.conv || 1.0}
              onChange={f("conv")}
            />
          </FormGroup>
          <FormGroup label="Sample Level">
            <FormInput
              value={formData.sampLevel || "S2"}
              onChange={f("sampLevel")}
            />
          </FormGroup>
          <FormGroup label="Created By">
            <FormInput
              value={formData.createdBy || "Admin"}
              onChange={f("createdBy")}
            />
          </FormGroup>
          <FormGroup label="Approved By">
            <FormInput
              value={formData.approvedBy || "QA Manager"}
              onChange={f("approvedBy")}
            />
          </FormGroup>
          <FormGroup label="Status">
            <FormSelect
              value={formData.status || "Active"}
              onChange={f("status")}
            >
              <option>Active</option>
              <option>Inactive</option>
            </FormSelect>
          </FormGroup>
        </FormGrid>
      </FormModal>

      {confirmModal && (
        <ConfirmModal
          open={true}
          {...confirmModal}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}
