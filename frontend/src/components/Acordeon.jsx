import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/acordeon.css'

export default function Acordeon({ title, content, onToggle, isOpen, required }) {
    return (
        <div className="accordion">

            <div className="accordion-header" onClick={onToggle}>
                <h3 >
                    <strong>
                        {title}
                    </strong>
                    {required && <span className="text-red-500 ml-1">*</span>}
                </h3>
                <span className={`accordion-icon arrow ${isOpen ? "open" : ""}`}>▼</span>

            </div>
            <div className={`accordion-content ${isOpen ? "open" : ""}`}>
                {content}
            </div>
        </div>)
}