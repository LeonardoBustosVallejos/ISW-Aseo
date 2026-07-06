import { CirclePlus } from "lucide-react";


export default function AddButton({ text, onClick, disabled = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="action-button"
            disabled={disabled}>
            <CirclePlus size={18} />
            {text}
        </button>
    )
}