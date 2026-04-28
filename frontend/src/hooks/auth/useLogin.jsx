import { useState, useEffect } from 'react';

const useLogin = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const [inputData, setInputData] = useState({ email: '', password: '' });

    useEffect(() => {
        if (inputData.email || inputData.password) setErrorMessage('');
    }, [inputData.email, inputData.password]);

    const errorData = (dataMessage) => {
        if (dataMessage.dataInfo === 'email' || dataMessage.dataInfo === 'password') {
            setErrorMessage(dataMessage.message);
        }
    };

    const handleInputChange = (field, value) => {
        setInputData(prevState => ({
            ...prevState,
            [field]: value
        }));
    };

    return {
        errorMessage,
        inputData,
        errorData,
        handleInputChange,
    };
};

export default useLogin;