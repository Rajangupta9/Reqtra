import { useState, useRef, useCallback, useEffect } from 'react';

export const useResizable = ({
    initialWidth = 320,
    minWidth = 240,
    maxWidth = 800,
    handleDirection = 'right'
} = {}) => {
    const [width, setWidth] = useState(initialWidth);
    const isResizing = useRef(false);
    const startXRef = useRef(0);
    const initialWidthRef = useRef(0);

    const handleMouseMove = useCallback((e) => {
        if (!isResizing.current) return;
        
        const deltaX = e.clientX - startXRef.current;
        let newWidth;

       
        if (handleDirection === 'right') {
            newWidth = initialWidthRef.current + deltaX;
        } else { 
            newWidth = initialWidthRef.current - deltaX;
        }
        
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
            setWidth(newWidth);
        }
    }, [minWidth, maxWidth, handleDirection]);

    const handleMouseUp = useCallback(() => {
        isResizing.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.pointerEvents = '';
    }, [handleMouseMove]);

    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        isResizing.current = true;
        startXRef.current = e.clientX;
        initialWidthRef.current = width; 
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = 'none';
        document.body.style.pointerEvents = 'none';
    }, [width, handleMouseMove, handleMouseUp]); 
    
    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    
    return { width, resizerProps: { onMouseDown: handleMouseDown } };
};