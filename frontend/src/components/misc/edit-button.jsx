import { Pencil } from "lucide-react";

export default function EditButton({ text = null, onClick, disabled = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="action-button"
            disabled={disabled}
        >
            <Pencil size={18} />
            {text}
        </button>
    )
}