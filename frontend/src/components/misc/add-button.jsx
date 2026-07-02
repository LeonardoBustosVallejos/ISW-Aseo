import { CirclePlus } from "lucide-react";


export default function AddButton({ text, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="add-button">
            <CirclePlus size={18} />
            {text}
        </button>
    )
}