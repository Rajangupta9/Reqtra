import React, { useState, useRef } from 'react';

function FileUploader() {
    // 1. State to hold the data for all your rows.
    // Each row is an object with an id and a value (which can be a File object or null).
    const [rows, setRows] = useState([
        { id: 1, value: null },
        { id: 2, value: null },
    ]);

    // This ref is useful if you need to programmatically click the hidden input
    const fileInputRef = useRef(null);

    // 2. Function to update a specific row's file in the state.
    const updateRow = (index, newFile) => {
        // Create a new array to ensure immutability (important for React state updates)
        const updatedRows = rows.map((row, i) => {
            if (i === index) {
                // Return a new object for the row that needs to be updated
                return { ...row, value: newFile };
            }
            // Return the original object for all other rows
            return row;
        });
        setRows(updatedRows);
    };

    // 3. Handle the form submission.
    const handleSubmit = (event) => {
        event.preventDefault();

        // Create a FormData object to send the file(s)
        const formData = new FormData();

        // Append each file from your state to the FormData object
        rows.forEach((row, index) => {
            if (row.value) { // Check if a file was selected for this row
                // The first argument is the key/name the server will see
                formData.append(`file-${index}`, row.value);
            }
        });

        // Now, you can send this `formData` object to your server
        console.log("Submitting FormData...");
        // Example with fetch:
        // fetch('/api/upload', {
        //   method: 'POST',
        //   body: formData,
        // });

        // For demonstration, we'll just log the keys
        for (let key of formData.keys()) {
            console.log(key);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {rows.map((row, index) => (
                <div key={row.id} style={{ marginBottom: '15px' }}>
                    <p>Row {index + 1}: {row.value ? row.value.name : 'No file selected'}</p>

                    {/* This is your hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            updateRow(index, file); // Update the state with the file object
                            if (e.target) e.target.value = ''; // Reset input to allow re-selecting the same file
                        }}
                    />

                    {/* A button to trigger the hidden file input */}
                    <button type="button" onClick={() => fileInputRef.current?.click()}>
                        Choose File 📁
                    </button>
                </div>
            ))}
            <button type="submit">Upload Files</button>
        </form>
    );
}

export default FileUploader;