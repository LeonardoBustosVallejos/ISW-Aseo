import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/acordeon.css'

export const Acordeon = ({ title, content, onToggle, isOpen }) => {
    return (
        <div className="accordion">

            <div className="accordion-header" onClick={onToggle}>
                <h3 >{title}</h3>
                <span className={`arrow  ${isOpen ? "open" : ""}`}>▼</span>

            </div>
            <div className={`accordion-content ${isOpen ? "open" : ""}`}>
                {content}
            </div>
        </div>)
}