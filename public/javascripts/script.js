document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // 获取并显示所有记账记录
    fetchTransactions();
});

document.getElementById('transaction-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const note = document.getElementById('note').value;
    const date = document.getElementById('date').value;

    const transaction = {
        amount,
        category,
        note,
        date
    };

    fetch('/api/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transaction)
    })
        .then(response => response.json())
        .then(data => {
            fetchTransactions();
            clearForm();
        })
        .catch(error => console.error('Error:', error));
});

function fetchTransactions() {
    fetch('/api/transactions')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#transactions-table tbody');
            tableBody.innerHTML = ''; // 清空表格
            data.forEach(transaction => {
                addTransactionToTable(transaction);
            });
        })
        .catch(error => console.error('Error:', error));
}

function addTransactionToTable(transaction) {
    const tableBody = document.querySelector('#transactions-table tbody');
    const row = document.createElement('tr');
    row.setAttribute('data-id', transaction.id);
    row.innerHTML = `
        <td>${transaction.amount}</td>
        <td>${transaction.category}</td>
        <td>${transaction.note}</td>
        <td>${transaction.date}</td>
        <td>
            <button class="edit-btn">編輯</button>
            <button class="delete-btn">刪除</button>
        </td>
    `;
    tableBody.appendChild(row);

    // 为删除按钮添加事件监听器
    row.querySelector('.delete-btn').addEventListener('click', function() {
        const id = row.getAttribute('data-id');
        deleteTransaction(id);
    });

    // 为编辑按钮添加事件监听器
    row.querySelector('.edit-btn').addEventListener('click', function() {
        editTransaction(transaction, row);
    });
}

function deleteTransaction(id) {
    fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                fetchTransactions(); // 重新获取并显示所有记账记录
            } else {
                console.error('Error:', response.statusText);
            }
        })
        .catch(error => console.error('Error:', error));
}

function editTransaction(transaction, row) {
    // 允许用户编辑表格中的数据
    row.innerHTML = `
        <td><input type="number" value="${transaction.amount}" class="edit-amount"></td>
        <td>
            <select class="edit-category">
                <option value="食物" ${transaction.category === '食物' ? 'selected' : ''}>食物</option>
                <option value="遊樂" ${transaction.category === '遊樂' ? 'selected' : ''}>遊樂</option>
                <option value="日常" ${transaction.category === '日常' ? 'selected' : ''}>日常</option>
            </select>
        </td>
        <td><input type="text" value="${transaction.note}" class="edit-note"></td>
        <td><input type="date" value="${transaction.date}" class="edit-date"></td>
        <td>
            <button class="save-btn">保存</button>
            <button class="cancel-btn">取消</button>
        </td>
    `;

    // 为保存按钮添加事件监听器
    row.querySelector('.save-btn').addEventListener('click', function() {
        const id = transaction.id;
        const amount = row.querySelector('.edit-amount').value;
        const category = row.querySelector('.edit-category').value;
        const note = row.querySelector('.edit-note').value;
        const date = row.querySelector('.edit-date').value;

        const updatedTransaction = { amount, category, note, date };

        fetch(`/api/transactions/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedTransaction)
        })
            .then(response => {
                if (response.ok) {
                    fetchTransactions();
                } else {
                    console.error('Error:', response.statusText);
                }
            })
            .catch(error => console.error('Error:', error));
    });

    // 为取消按钮添加事件监听器
    row.querySelector('.cancel-btn').addEventListener('click', function() {
        fetchTransactions();
    });
}

function clearForm() {
    document.getElementById('transaction-form').reset();
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
}
