import React, { useState, useEffect } from 'react';
import { FaChevronUp } from 'react-icons/fa';
import './BackToTop.css';

const BackToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Mostrar el botón cuando se baja 300px
    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <div className={`back-to-top ${isVisible ? 'visible' : ''}`} onClick={scrollToTop}>
            <FaChevronUp />
        </div>
    );
};

export default BackToTop;
