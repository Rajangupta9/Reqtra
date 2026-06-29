

export function debounce(func, delay){
    let timeoutId;
    return(...arg)=>{
        clearTimeout(timeoutId);
        timeoutId = setTimeout(()=> {
            func(...arg);
        }, delay)
    };
}