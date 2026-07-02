import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/acordeon.css'
import { ChevronRight, ChevronsRight } from 'lucide-react';

export default function Acordeon({ title, content, onToggle, isOpen, required, level = 0 }) {
    return (
        <div className={`accordion level-${level}`}>

            <div className="accordion-header" onClick={onToggle}>

                <div className="accordion-title">

                    <div className={`accordion-circle ${isOpen ? "open" : ""}`}>
                        <ChevronsRight size={16} />
                    </div>

                    <h3 >
                        <strong>
                            {title}
                        </strong>
                        {required && <span style={{ color: "red", marginLeft: "4px" }}>*</span>}
                    </h3>

                </div>
                <div className="accordion-line" />

            </div>
            <div className={`accordion-content ${isOpen ? "open" : ""}`}>
                {content}
            </div>
        </div>)
}