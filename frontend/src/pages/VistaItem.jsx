import Table from '@components/Table';
import useItems from '@hooks/items/useGetItems.jsx';
import useEditItems from '@hooks/items/useEditItems';
import { useCallback, useState } from 'react';
import ItemModal from './AgregarItemModal.jsx';
import Popup from '../components/Popup';
import { deleteItem } from '@services/item.service.js';
import { deleteDataAlert, showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert.js';

const VistaItem = () => {
    const columns = [
        {}
    ]

    return (
        <div className='main-container'>
            <div className='table-container'>
                <div className='top-table'>         
                    <h1 className='title-table'>Capacitados</h1>
                    <Table>

                    </Table>
                </div>     
            </div>
        </div>
    );
};

export default VistaItem;