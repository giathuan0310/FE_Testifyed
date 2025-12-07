import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Breadcrumb.css';

const Breadcrumb = ({ items }) => {
    const navigate = useNavigate();
    return (
        <div className="breadcrumb">
            {items.map((item, idx) => (
                <span key={idx}>
                    {(item.onClick || item.link) ? (
                        <span
                            className="breadcrumb-link"
                            style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
                            onClick={() => {
                                if (item.onClick) item.onClick();
                                else navigate(item.link);
                            }}
                        >
                            {item.label}
                        </span>
                    ) : (
                        <span className="breadcrumb-current">{item.label}</span>
                    )}
                    {idx < items.length - 1 && <span className="breadcrumb-sep"> / </span>}
                </span>
            ))}
        </div>
    );
};

export default Breadcrumb;
