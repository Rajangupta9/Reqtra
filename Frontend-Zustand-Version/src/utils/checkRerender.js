import React from "react";


export function useWhyDidYouUpdate(name, props) {
    const previousProps = React.useRef();
    
    React.useEffect(() => {
        if (previousProps.current) {
            const allKeys = Object.keys({ ...previousProps.current, ...props });
            const changedProps = {};
            
            allKeys.forEach(key => {
                if (previousProps.current[key] !== props[key]) {
                    changedProps[key] = {
                        from: previousProps.current[key],
                        to: props[key]
                    };
                }
            });
            
            if (Object.keys(changedProps).length > 0) {
                console.log(`🔍 [${name}] Changed props:`, changedProps);
            }
        }
        
        previousProps.current = props;
    });
}