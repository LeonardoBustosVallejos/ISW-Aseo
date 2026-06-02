import { useNavigate } from 'react-router-dom';
import { login } from '@services/auth.service.js';
import useLogin from '@hooks/auth/useLogin.jsx';
import '@styles/login.css';
import { useEffect, useState } from 'react';

const LoginForm = () => {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    useEffect(() => {
        if (formData.email || formData.password) setError('');
    }, [formData.email, formData.password]);

    const handleChange = (e) => {

        const { name, value } = e.target;
        setError('')
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const loginSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await login(formData);

            if (response.status === 'Success') {

                navigate('/home');

            } else if (response.status === 'Client error') {

                setError(response.details.message || response.details);
            }

        } catch (error) {

            console.log(error);
        }
    };

    return (

        <main className="login">
            <form
                className="login-form"
                onSubmit={loginSubmit}
            >
                <label>
                    <h1>
                        <strong>
                            Iniciar sesión
                        </strong>
                    </h1>
                </label>
                {/*Correo */}
                <div className="container_inputs">
                    <label className="label">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input"
                        required
                    />
                </div>
                {/*Contraseña */}
                <div className="container_inputs">
                    <label className="label">Contraseña</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="input"
                        required
                    />
                    {/*ver contraseña */}
                    <label className="password-options">
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={(e) =>
                                setShowPassword(e.target.checked)
                            }
                        />
                        <span>Ver contraseña</span>
                    </label>
                </div>

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    className="login-button"
                >
                    Ingresar
                </button>
            </form>
        </main>
    );
};

export default LoginForm;