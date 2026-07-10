import { CirclePlus } from "lucide-react";


export default function AddButton({ text, onClick, disabled = false, hidden = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`action-button ${hidden ? 'oculto' : ''}`}
            disabled={disabled}>
            <CirclePlus size={18} />
            {text}
        </button>
    )
}