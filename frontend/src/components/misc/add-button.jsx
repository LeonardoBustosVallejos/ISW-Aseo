import { CirclePlus } from "lucide-react";


export default function AddButton({ text, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="action-button">
            <CirclePlus size={18} />
            {text}
        </button>
    )
}