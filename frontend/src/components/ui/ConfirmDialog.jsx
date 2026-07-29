// src/components/ui/ConfirmDialog.jsx
import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle } from "lucide-react";

const ConfirmDialog = ({ open, onClose, onConfirm, title="Confirm Action", message, confirmLabel="Confirm", danger=false, loading=false }) => (
  <Modal open={open} onClose={onClose} size="sm">
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${danger ? "bg-red-100" : "bg-yellow-100"}`}>
          <AlertTriangle className={`w-5 h-5 ${danger ? "text-danger" : "text-warning"}`} />
        </div>
        <h4 className="font-semibold text-slate-800 dark:text-white">{title}</h4>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant={danger ? "danger" : "primary"} size="sm" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </div>
  </Modal>
);
export default ConfirmDialog;
