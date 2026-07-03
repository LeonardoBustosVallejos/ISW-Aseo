import { Pencil } from "lucide-react";

export default function EditButton({ text = null, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="action-button">
            <Pencil size={18} />
            {text}
        </button>
    )
}