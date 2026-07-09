import { X } from "lucide-react";
import "../styles/modal.css";
import Header from "./misc/Header";

export function Modal({
    open,
    onClose,
    title,
    subtitle,
    children,
    footer,
    isForm = false,
    onAcept = null,
}) {

    if (!open) return null;

    return (
        <div
            className="modal-overlay"
        >

            <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
            >

                <Header title={title}
                    subtitle={subtitle || null}
                >
                    <div className="modal-header">


                        <button
                            className="modal-close"
                            onClick={onClose}
                        >
                            <X />
                        </button>
                    </div>
                </Header>


                <div className="modal-body">

                    {children}

                </div>


                {footer && (

                    <div className="modal-footer">
                        {footer}

                    </div>

                )}
                {isForm && (
                    <div>

                        <div className="modal-footer">
                            <button type="submit"
                                className="submit-button"
                                onClick={onAcept}>
                                Aceptar
                            </button>
                            <button type="button"
                                className="cancel-button"
                                onClick={onClose}>
                                Cancelar
                            </button>
                        </div>
                    </div>

                )}

            </div>

        </div>
    );
}