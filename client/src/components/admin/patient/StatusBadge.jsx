import React from 'react';

const StatusBadge = ({ status }) => {
    const getStatusStyle = (status) => {
        return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    }

    const statusText = status === 'active' ? 'Hoàn thành' : 'Chưa hoàn thành';

    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(status)}`}>
            {statusText}
        </span>
    );
};

export default StatusBadge;