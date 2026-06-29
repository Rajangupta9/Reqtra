export const getMethodColor = (reqMethod) => {
        switch (reqMethod) {
            case 'GET': return '#17b26a';
            case 'POST': return '#ef6820';
            case 'PATCH': return '#EE46BC';
            case 'DELETE': return '#F04438';
            default: return '#2E90FA';
        }
    };