let logoDataURL = null;
let currencySymbol = '$';

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
}

setTodayDate();

document.getElementById('logo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            logoDataURL = event.target.result;
            const logoPreview = document.getElementById('logoPreview');
            logoPreview.innerHTML = `<img src="${logoDataURL}" alt="Logo">`;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('removeLogo').addEventListener('click', function() {
    document.getElementById('logo').value = '';
    logoDataURL = null;
    document.getElementById('logoPreview').innerHTML = '';
});

document.getElementById('currency').addEventListener('change', function(e) {
    currencySymbol = e.target.value;
    updateAllCurrencySymbols();
    updatePreview();
});

function updateAllCurrencySymbols() {
    const symbols = document.querySelectorAll('[id^="currencySymbol"], [id^="previewCurrencySymbol"]');
    symbols.forEach(el => el.textContent = currencySymbol);
}

function attachInputListeners() {
    const inputs = {
        'companyName': 'previewCompanyName',
        'companyEmail': 'previewCompanyEmail',
        'companyAddress': 'previewCompanyAddress',
        'invoiceNumber': 'previewInvoiceNumber',
        'invoiceDate': 'previewInvoiceDate',
        'dueDate': 'previewDueDate',
        'clientName': 'previewClientName',
        'clientEmail': 'previewClientEmail',
        'clientAddress': 'previewClientAddress'
    };

    for (const [inputId, previewId] of Object.entries(inputs)) {
        document.getElementById(inputId).addEventListener('input', function(e) {
            document.getElementById(previewId).textContent = e.target.value || 
                (inputId === 'companyName' ? 'Your Company' : 
                 inputId === 'invoiceNumber' || inputId === 'invoiceDate' || inputId === 'dueDate' ? '-' : '');
        });
    }

    document.getElementById('notes').addEventListener('input', function(e) {
        const notesDiv = document.getElementById('previewNotes');
        if (e.target.value.trim()) {
            notesDiv.innerHTML = `<strong>Notes:</strong><br>${e.target.value}`;
            notesDiv.style.display = 'block';
        } else {
            notesDiv.style.display = 'none';
        }
    });

    document.getElementById('taxRate').addEventListener('input', updatePreview);
}

function attachItemListeners() {
    const itemRows = document.querySelectorAll('.item-row');
    itemRows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => {
            input.removeEventListener('input', updatePreview);
            input.addEventListener('input', updatePreview);
        });
        
        const removeBtn = row.querySelector('.btn-remove');
        if (removeBtn) {
            removeBtn.removeEventListener('click', removeItem);
            removeBtn.addEventListener('click', removeItem);
        }
    });
}

function removeItem(e) {
    const itemRows = document.querySelectorAll('.item-row');
    if (itemRows.length > 1) {
        e.target.closest('.item-row').remove();
        updatePreview();
        updateRemoveButtons();
    }
}

function updateRemoveButtons() {
    const itemRows = document.querySelectorAll('.item-row');
    const removeButtons = document.querySelectorAll('.btn-remove');
    removeButtons.forEach(btn => {
        btn.disabled = itemRows.length === 1;
    });
}

function updatePreview() {
    const previewItems = document.getElementById('previewItems');
    previewItems.innerHTML = '';
    
    const itemRows = document.querySelectorAll('.item-row');
    let subtotal = 0;
    
    itemRows.forEach(row => {
        const description = row.querySelector('.item-description').value;
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const itemTotal = quantity * price;
        
        if (description || quantity || price) {
            subtotal += itemTotal;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${description}</td>
                <td>${quantity}</td>
                <td>${currencySymbol}${price.toFixed(2)}</td>
                <td>${currencySymbol}${itemTotal.toFixed(2)}</td>
            `;
            previewItems.appendChild(tr);
        }
    });
    
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    document.getElementById('subtotalAmount').textContent = subtotal.toFixed(2);
    document.getElementById('taxAmount').textContent = taxAmount.toFixed(2);
    document.getElementById('totalAmount').textContent = total.toFixed(2);
    
    document.getElementById('previewSubtotal').textContent = subtotal.toFixed(2);
    document.getElementById('previewTax').textContent = taxAmount.toFixed(2);
    document.getElementById('previewTaxRate').textContent = taxRate.toFixed(1);
    document.getElementById('previewTotal').textContent = total.toFixed(2);
}

document.getElementById('addItem').addEventListener('click', function() {
    const itemsContainer = document.getElementById('itemsContainer');
    const newRow = document.createElement('div');
    newRow.className = 'item-row';
    newRow.innerHTML = `
        <input type="text" class="item-description" placeholder="Product or service description">
        <input type="number" class="item-quantity" placeholder="Qty" min="1" value="1">
        <input type="number" class="item-price" placeholder="Price" min="0" step="0.01">
        <button class="btn-remove">×</button>
    `;
    itemsContainer.appendChild(newRow);
    attachItemListeners();
    updateRemoveButtons();
});

document.getElementById('clearForm').addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all fields?')) {
        document.getElementById('logo').value = '';
        logoDataURL = null;
        document.getElementById('logoPreview').innerHTML = '';
        
        document.getElementById('companyName').value = '';
        document.getElementById('companyEmail').value = '';
        document.getElementById('companyAddress').value = '';
        document.getElementById('invoiceNumber').value = '';
        setTodayDate();
        document.getElementById('dueDate').value = '';
        document.getElementById('clientName').value = '';
        document.getElementById('clientEmail').value = '';
        document.getElementById('clientAddress').value = '';
        document.getElementById('notes').value = '';
        document.getElementById('taxRate').value = '0';
        document.getElementById('currency').value = '$';
        currencySymbol = '$';
        
        const itemsContainer = document.getElementById('itemsContainer');
        itemsContainer.innerHTML = `
            <div class="item-row">
                <input type="text" class="item-description" placeholder="Product or service description">
                <input type="number" class="item-quantity" placeholder="Qty" min="1" value="1">
                <input type="number" class="item-price" placeholder="Price" min="0" step="0.01">
                <button class="btn-remove" disabled>×</button>
            </div>
        `;
        
        attachItemListeners();
        updateAllCurrencySymbols();
        updatePreview();
        
        document.getElementById('previewCompanyName').textContent = 'Your Company';
        document.getElementById('previewCompanyEmail').textContent = '';
        document.getElementById('previewCompanyAddress').textContent = '';
        document.getElementById('previewInvoiceNumber').textContent = '-';
        document.getElementById('previewInvoiceDate').textContent = '-';
        document.getElementById('previewDueDate').textContent = '-';
        document.getElementById('previewClientName').textContent = '';
        document.getElementById('previewClientEmail').textContent = '';
        document.getElementById('previewClientAddress').textContent = '';
        document.getElementById('previewNotes').style.display = 'none';
    }
});

document.getElementById('downloadPDF').addEventListener('click', function() {
    updateAllCurrencySymbols();
    updatePreview();
    
    const companyName = document.getElementById('companyName').value || 'Your Company';
    const companyEmail = document.getElementById('companyEmail').value;
    const companyAddress = document.getElementById('companyAddress').value;
    const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV-001';
    const invoiceDate = document.getElementById('invoiceDate').value || '-';
    const dueDate = document.getElementById('dueDate').value || '-';
    const clientName = document.getElementById('clientName').value;
    const clientEmail = document.getElementById('clientEmail').value;
    const clientAddress = document.getElementById('clientAddress').value;
    const notes = document.getElementById('notes').value;
    
    const itemRows = document.querySelectorAll('.item-row');
    const items = [];
    let subtotal = 0;
    
    itemRows.forEach(row => {
        const description = row.querySelector('.item-description').value;
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const total = quantity * price;
        
        if (description || quantity || price) {
            items.push([
                description,
                quantity.toString(),
                currencySymbol + price.toFixed(2),
                currencySymbol + total.toFixed(2)
            ]);
            subtotal += total;
        }
    });
    
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    const docDefinition = {
        content: [
            {
                columns: [
                    {
                        stack: [
                            logoDataURL ? { image: logoDataURL, width: 100, margin: [0, 0, 0, 10] } : {},
                            { text: companyName, style: 'companyName' },
                            companyEmail ? { text: companyEmail, style: 'companyInfo' } : {},
                            companyAddress ? { text: companyAddress, style: 'companyInfo' } : {}
                        ]
                    },
                    {
                        stack: [
                            { text: 'INVOICE', style: 'invoiceTitle', alignment: 'right' }
                        ]
                    }
                ]
            },
            { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 515, y2: 10, lineWidth: 2, lineColor: '#667eea' }] },
            { text: ' ', margin: [0, 10] },
            {
                columns: [
                    {
                        stack: [
                            { text: 'Invoice #: ' + invoiceNumber, style: 'details' },
                            { text: 'Date: ' + invoiceDate, style: 'details' },
                            { text: 'Due Date: ' + dueDate, style: 'details' }
                        ]
                    },
                    {
                        stack: [
                            { text: 'Bill To:', style: 'detailsHeader' },
                            clientName ? { text: clientName, style: 'details' } : {},
                            clientEmail ? { text: clientEmail, style: 'details' } : {},
                            clientAddress ? { text: clientAddress, style: 'details' } : {}
                        ]
                    }
                ]
            },
            { text: ' ', margin: [0, 20] },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            { text: 'Description', style: 'tableHeader' },
                            { text: 'Quantity', style: 'tableHeader' },
                            { text: 'Price', style: 'tableHeader' },
                            { text: 'Total', style: 'tableHeader' }
                        ],
                        ...items
                    ]
                },
                layout: {
                    fillColor: function(rowIndex) {
                        return rowIndex === 0 ? '#667eea' : (rowIndex % 2 === 0 ? '#f8f9ff' : null);
                    },
                    hLineWidth: function() { return 0.5; },
                    vLineWidth: function() { return 0; }
                }
            },
            { text: ' ', margin: [0, 20] },
            {
                columns: [
                    { text: '', width: '*' },
                    {
                        width: 200,
                        stack: [
                            {
                                columns: [
                                    { text: 'Subtotal:', style: 'summary' },
                                    { text: currencySymbol + subtotal.toFixed(2), style: 'summary', alignment: 'right' }
                                ]
                            },
                            {
                                columns: [
                                    { text: 'Tax (' + taxRate.toFixed(1) + '%):', style: 'summary' },
                                    { text: currencySymbol + taxAmount.toFixed(2), style: 'summary', alignment: 'right' }
                                ]
                            },
                            { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 200, y2: 5, lineWidth: 2, lineColor: '#667eea' }] },
                            {
                                columns: [
                                    { text: 'Total:', style: 'total' },
                                    { text: currencySymbol + total.toFixed(2), style: 'total', alignment: 'right' }
                                ],
                                margin: [0, 5, 0, 0]
                            }
                        ]
                    }
                ]
            },
            notes ? { text: ' ', margin: [0, 30] } : {},
            notes ? {
                stack: [
                    { text: 'Notes:', style: 'notesHeader' },
                    { text: notes, style: 'notes' }
                ]
            } : {}
        ],
        styles: {
            companyName: { fontSize: 18, bold: true, margin: [0, 0, 0, 5] },
            companyInfo: { fontSize: 10, color: '#666', margin: [0, 2] },
            invoiceTitle: { fontSize: 36, bold: true, color: '#667eea' },
            details: { fontSize: 10, margin: [0, 2] },
            detailsHeader: { fontSize: 11, bold: true, margin: [0, 0, 0, 5] },
            tableHeader: { fontSize: 11, bold: true, color: 'white', fillColor: '#667eea', margin: [5, 5] },
            summary: { fontSize: 11, margin: [0, 3] },
            total: { fontSize: 16, bold: true, color: '#667eea', margin: [0, 3] },
            notesHeader: { fontSize: 12, bold: true, margin: [0, 0, 0, 5] },
            notes: { fontSize: 10, color: '#555' }
        },
        defaultStyle: {
            font: 'Roboto'
        }
    };
    
    pdfMake.createPdf(docDefinition).download(invoiceNumber + '.pdf');
});

attachInputListeners();
attachItemListeners();
updateRemoveButtons();