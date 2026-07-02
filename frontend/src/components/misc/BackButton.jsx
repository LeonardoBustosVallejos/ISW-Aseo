import { CircleChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../styles/misc/backButton.css'

export default function BackButton() {
    const navigate = useNavigate();

    return (
        <button onClick={() => navigate(-1)} className='backButton'>
            <CircleChevronLeft />
            Volver
        </button>
    );
}