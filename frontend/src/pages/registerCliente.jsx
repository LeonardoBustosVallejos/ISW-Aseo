import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useRegister from '@hooks/auth/useRegister.jsx';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import '@styles/form.css';
import { registerCliente } from '@services/auth.service';


/**
 * 
 * @returns body anidado con el cliente y supervisor
 */
const RegisterClienteForm = () => {
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        cliente: {
            nombreCompleto: '',
            rut: '',
            email: '',
            password: '',
            phone: '',
            rol_id: '2',
            personalSolicitado: '',
            nombreCliente: '',
            direccion: ''
        },
        supervisor: {
            nombreCompleto: '',
            rut: '',
            email: '',
            password: '',
            phone: '',
            rol_id: '3'
        }
    });

    useEffect(() => {
        setErrors({});
    }, [formData]);

    const setFieldError = (field, message) => {
        setErrors(prev => ({
            ...prev,
            [field]: message
        }));
    };


    const handleChange = (e, section) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [name]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            const response = await registerCliente(formData);
            if (response.status === 'Success') {
                showSuccessAlert('¡Registrado!', 'Usuario registrado exitosamente.');
                setTimeout(3000)
            } else if (response.status === 'Client error') {
                setErrors(response.details);
            }
        } catch (error) {
            console.error("Error al registrar un usuario: ", error);
            showErrorAlert('Cancelado', 'Ocurrió un error al registrarse.');
        }
    }

    return (
        <div className="container" style={{ width: 'auto', height: 'auto', padding: '40px' }}>
            <div className='form'>
                <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }} >

                    <h1>Registro de Cliente y Supervisor</h1>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '50px',
                        width: '100%',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        marginBottom: '20px'
                    }}>

                        {/* SECCIÓN CLIENTE */}
                        <section style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '350px' }}>
                            <h3 >Datos del Cliente</h3>

                            <div className="container_inputs">
                                <label className="label">Nombre Completo (Razón Social)</label>
                                <input type="text" name="nombreCompleto" value={formData.cliente.nombreCompleto} onChange={(e) => handleChange(e, 'cliente')} className="input" placeholder="Empresa XYZ SPA" required />
                            </div>

                            <div className="container_inputs">
                                <label className="label">RUT</label>
                                <input type="text" name="rut" value={formData.cliente.rut} onChange={(e) => handleChange(e, 'cliente')} className="input" placeholder="76.xxx.xxx-x" required />
                            </div>

                            <div className="container_inputs">
                                <label className="label">Teléfono</label>
                                <input type="text" name="phone" value={formData.cliente.phone} onChange={(e) => handleChange(e, 'cliente')} className="input" placeholder="912345678" />
                            </div>

                            <div className="container_inputs">
                                <label className="label">Nombre de Fantasía</label>
                                <input type="text" name="nombreCliente" value={formData.cliente.nombreCliente} onChange={(e) => handleChange(e, 'cliente')} className="input" />
                            </div>

                            <div className="container_inputs">
                                <label className="label">Dirección</label>
                                <input type="text" name="direccion" value={formData.cliente.direccion} onChange={(e) => handleChange(e, 'cliente')} className="input" />
                            </div>

                            <div className="container_inputs">
                                <label className="label">Email de contacto</label>
                                <input type="email" name="email" value={formData.cliente.email} onChange={(e) => handleChange(e, 'cliente')} className="input" required />
                            </div>
                            <div className="container_inputs">
                                <label className="label">Password</label>
                                <input type="password" name="password" value={formData.cliente.password} onChange={(e) => handleChange(e, 'cliente')} className="input" required />
                            </div>

                            <div className="container_inputs">
                                <label className="label">Personal Solicitado (Cantidad)</label>
                                <input type="number" name="personalSolicitado" value={formData.cliente.personalSolicitado} onChange={(e) => handleChange(e, 'cliente')} className="input" />
                            </div>
                        </section>

                        {/* SECCIÓN SUPERVISOR */}
                        <section style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '350px' }}>
                            <h3 >Datos del Supervisor</h3>

                            <div className="container_inputs">
                                <label className="label">Nombre Completo</label>
                                <input type="text" name="nombreCompleto" value={formData.supervisor.nombreCompleto} onChange={(e) => handleChange(e, 'supervisor')} className="input" placeholder="Juan Pérez" required />
                            </div>

                            <div className="container_inputs">
                                <label className="label">RUT</label>
                                <input type="text" name="rut" value={formData.supervisor.rut} onChange={(e) => handleChange(e, 'supervisor')} className="input" required />
                            </div>

                            <div className="container_inputs">
                                <label className="label">Teléfono</label>
                                <input type="text" name="phone" value={formData.supervisor.phone} onChange={(e) => handleChange(e, 'supervisor')} className="input" />
                            </div>

                            <div className="container_inputs">
                                <label className="label">Email</label>
                                <input type="email" name="email" value={formData.supervisor.email} onChange={(e) => handleChange(e, 'supervisor')} className="input" required />
                            </div>

                            <div className="container_inputs">
                                <label className="label">Password</label>
                                <input type="password" name="password" value={formData.supervisor.password} onChange={(e) => handleChange(e, 'supervisor')} className="input" required />
                            </div>
                        </section>

                    </div>
                    <span className={`error-message ${errors.nombreCompleto ? 'visible' : ''}`}>
                        {errors.nombreCompleto || 'Campo requerido'}
                    </span>
                    <hr />
                    <button type="submit" onClick={handleSubmit}>Registrar</button>
                </form>
            </div>
        </div>
    );
};

export default RegisterClienteForm