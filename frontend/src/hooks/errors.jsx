import { useEffect, useState } from "react";

export const useErrors = () => {
    const [errorsObject, setErrorsObject] = useState({
        dataInfo: '',
        message: '',
        details: ''
    });

    const setErrors = (res) => {
        if (res.details) {
            setErrorsObject({
                dataInfo: "",
                message: res.message,
                details: res.details
            });
            return;
        }
        res = res.message
        setErrorsObject({
            dataInfo: res.message.dataInfo ?? "",
            message: res.message.message ?? "",
            details: ""
        });
    };
    const cleanObject = () => {
        setErrorsObject({
            dataInfo: '',
            message: '',
            details: ''
        })
    }
    const displayError = errorsObject.message?.dataInfo
        ? `Error: ${errorsObject.message.dataInfo}: ${errorsObject.message.message}`
        :
        errorsObject.details ?
            errorsObject.details.dataInfo ?
                `Error: ${errorsObject.details.dataInfo}: ${'' || errorsObject.details.message}` :
                `Error: ${errorsObject.message}: ${'' || errorsObject.details}`
            : "";


    return {
        errorsObject,
        setErrors,
        cleanObject,
        displayError
    }
}