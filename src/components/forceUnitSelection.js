import React from 'react';

//kN, N, lb, kip
//m, mm, in, ft

const forceUnitSelection = ({ value, onChange }) => {
    return (
        <select value={value} onChange={onChange}>
            <option value="millimeter">kN (kilonewton)</option>
            <option value="centimeter">N (newton)</option>
            <option value="decimeter">Pound (lb)</option>
            <option value="meter">Kilopound (kip)</option>
        </select>
    )
}

export default forceUnitSelection