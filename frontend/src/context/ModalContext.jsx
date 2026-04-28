import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modal, setModal] = useState({
        visible: false,
        tipo: "success", // success | error
        mensaje: "",
    });

    const showModal = (tipo, mensaje) => {
        setModal({ visible: true, tipo, mensaje });
    };

    const closeModal = () => {
        setModal({ ...modal, visible: false });
    };

    return (
        <ModalContext.Provider value={{ modal, showModal, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => useContext(ModalContext);