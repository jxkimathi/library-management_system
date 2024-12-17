const BASE_URL = 'http://127.0.0.1:5000';

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    if (sectionId === 'books') loadBooks();
    if (sectionId === 'members') loadMembers();
    if (sectionId === 'transactions') {
        loadBooks('issue-book-select');
        loadMembers('issue-member-select');
    }
}

async function searchBooks() {
    const searchTerm = document.getElementById('book-search-input').value;
    try {
        const response = await fetch(`${BASE_URL}/books/search?title=${encodeURIComponent(searchTerm)}&author=${encodeURIComponent(searchTerm)}`);
        const books = await response.json();
        
        const booksList = document.getElementById('books-list');
        booksList.innerHTML = books.map(book => `
            <tr>
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.quantity}</td>
                <td>
                    <button onclick="editBook(${book.id}, '${book.title}', '${book.author}', ${book.quantity})">Edit</button>
                    <button onclick="deleteBook(${book.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error searching books:', error);
    }
}

function editBook(id, title, author, quantity) {
    const modal = document.getElementById('book-modal');
    const form = document.getElementById('add-book-form');
    
    document.getElementById('book-modal-title').textContent = 'Edit Book';
    document.getElementById('book-edit-id').value = id;
    form.querySelector('input[name="title"]').value = title;
    form.querySelector('input[name="author"]').value = author;
    form.querySelector('input[name="quantity"]').value = quantity;
    
    modal.style.display = 'block';
}

function editMember(id, name, email, phone) {
    const modal = document.getElementById('member-modal');
    const form = document.getElementById('add-member-form');
    
    document.getElementById('member-modal-title').textContent = 'Edit Member';
    document.getElementById('member-edit-id').value = id;
    form.querySelector('input[name="name"]').value = name;
    form.querySelector('input[name="email"]').value = email;
    form.querySelector('input[name="phone"]').value = phone || '';
    
    modal.style.display = 'block';
}


async function loadBooks(selectId = null) {
    try {
        const response = await fetch(`${BASE_URL}/books`);
        const books = await response.json();
        
        if (selectId) {
            const select = document.getElementById(selectId);
            select.innerHTML = books.map(book => 
                `<option value="${book.id}">${book.title} (${book.quantity} available)</option>`
            ).join('');
            return;
        }

        const booksList = document.getElementById('books-list');
        booksList.innerHTML = books.map(book => `
            <tr>
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.quantity}</td>
                <td>
                    <button onclick="editBook(${book.id}, '${book.title}', '${book.author}', ${book.quantity})">Edit</button>
                    <button onclick="deleteBook(${book.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading books:', error);
    }
}


async function loadMembers(selectId = null) {
    try {
        const response = await fetch(`${BASE_URL}/members`);
        const members = await response.json();
        
        if (selectId) {
            const select = document.getElementById(selectId);
            select.innerHTML = members.map(member => 
                `<option value="${member.id}">${member.name}</option>`
            ).join('');
            return;
        }

        const membersList = document.getElementById('members-list');
        membersList.innerHTML = members.map(member => `
            <tr>
                <td>${member.id}</td>
                <td>${member.name}</td>
                <td>${member.email}</td>
                <td>${member.outstanding_debt}</td>
                <td>
                    <button onclick="editMember(${member.id}, '${member.name}', '${member.email}', '${member.phone || ''}')">Edit</button>
                    <button onclick="deleteMember(${member.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading members:', error);
    }
}

document.getElementById('add-book-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const bookData = Object.fromEntries(formData);
    const bookId = bookData.id;

    try {
        let response;
        if (bookId) {
            // Edit existing book
            response = await fetch(`${BASE_URL}/books/${bookId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookData)
            });
        } else {
            // Add new book
            response = await fetch(`${BASE_URL}/books`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookData)
            });
        }
        
        closeModal('book-modal');
        loadBooks();
    } catch (error) {
        console.error('Error adding/editing book:', error);
    }
});

document.getElementById('add-member-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const memberData = Object.fromEntries(formData);
    const memberId = memberData.id;

    try {
        let response;
        if (memberId) {
            // Edit existing member
            response = await fetch(`${BASE_URL}/members/${memberId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(memberData)
            });
        } else {
            // Add new member
            response = await fetch(`${BASE_URL}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(memberData)
            });
        }
        
        closeModal('member-modal');
        loadMembers();
    } catch (error) {
        console.error('Error adding/editing member:', error);
    }
});

function openAddBookModal() {
    document.getElementById('book-modal').style.display = 'block';
}

function openAddMemberModal() {
    document.getElementById('member-modal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}


document.getElementById('add-member-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const memberData = Object.fromEntries(formData);

    try {
        await fetch(`${BASE_URL}/members`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(memberData)
        });
        closeModal('member-modal');
        loadMembers();
    } catch (error) {
        console.error('Error adding member:', error);
    }
});

async function deleteBook(bookId) {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    try {
        await fetch(`${BASE_URL}/books/${bookId}`, { method: 'DELETE' });
        loadBooks();
    } catch (error) {
        console.error('Error deleting book:', error);
    }
}

async function deleteMember(memberId) {
    if (!confirm('Are you sure you want to delete this member?')) return;
    
    try {
        await fetch(`${BASE_URL}/members/${memberId}`, { method: 'DELETE' });
        loadMembers();
    } catch (error) {
        console.error('Error deleting member:', error);
    }
}

async function issueBook() {
    const bookId = document.getElementById('issue-book-select').value;
    const memberId = document.getElementById('issue-member-select').value;

    try {
        const response = await fetch(`${BASE_URL}/issue-book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ book_id: bookId, member_id: memberId })
        });
        const result = await response.json();
        alert(`Book issued. Transaction ID: ${result.transaction_id}`);
        loadBooks('issue-book-select');
    } catch (error) {
        console.error('Error issuing book:', error);
    }
}

async function returnBook() {
    const transactionId = document.getElementById('return-transaction-id').value;

    try {
        const response = await fetch(`${BASE_URL}/return-book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ transaction_id: transactionId })
        });
        const result = await response.json();
        alert(`Book returned. Rent Fee: ${result.rent_fee}`);
    } catch (error) {
        console.error('Error returning book:', error);
    }
}

// Add HTML structure first
const searchHTML = `
    <div class="search-container">
        <input type="text" id="search-input" placeholder="Search...">
        <button id="search-button">Search</button>
        <div id="search-results"></div>
    </div>
`;

document.addEventListener('DOMContentLoaded', () => {
    // Insert search HTML into page
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertAdjacentHTML('afterbegin', searchHTML);
    }

    // Initialize search elements
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    // Add event listener for search
    if (searchButton && searchInput && searchResults) {
        searchButton.addEventListener('click', async (e) => {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            
            if (!searchTerm) return;

            try {
                const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(searchTerm)}`);
                const data = await response.json();
                displaySearchResults(data, searchResults);
            } catch (error) {
                console.error('Search failed:', error);
                searchResults.innerHTML = '<p>Search failed. Please try again.</p>';
            }
        });
    }

    // Load initial books if container exists
    const booksContainer = document.getElementById('books-container');
    if (booksContainer) {
        loadBooks();
    }
});

function displaySearchResults(results, container) {
    container.innerHTML = '';
    
    if (!results.length) {
        container.innerHTML = '<p>No results found</p>';
        return;
    }

    const resultHTML = results.map(item => `
        <div class="search-result-item">
            <h3>${item.title || item.name}</h3>
            <p>${item.description || item.email || ''}</p>
        </div>
    `).join('');

    container.innerHTML = resultHTML;
}

// Initial load
loadBooks();

document.addEventListener('DOMContentLoaded', () => {
    // Initialize search functionality
    const searchForm = document.querySelector('#search-form');
    const searchInput = document.querySelector('#search-input');
    const searchResults = document.querySelector('#search-results');
    const booksContainer = document.querySelector('#books-container');

    if (searchForm) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            
            if (!searchTerm) return;

            try {
                const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(searchTerm)}`);
                if (!response.ok) throw new Error('Search failed');
                
                const books = await response.json();
                displaySearchResults(books);
            } catch (error) {
                console.error('Search error:', error);
                searchResults.innerHTML = '<p class="error">Search failed. Please try again.</p>';
            }
        });
    }

    function displaySearchResults(books) {
        if (!searchResults) return;
        searchResults.innerHTML = '';

        if (!books.length) {
            searchResults.innerHTML = '<p>No books found</p>';
            return;
        }

        const booksHTML = books.map(book => `
            <div class="book-item">
                <h3>${book.title}</h3>
                <p>Author: ${book.author}</p>
                <p>Quantity: ${book.quantity}</p>
                <div class="book-actions">
                    <button onclick="editBook(${book.id}, '${book.title}', '${book.author}', ${book.quantity})">Edit</button>
                    <button onclick="deleteBook(${book.id})">Delete</button>
                </div>
            </div>
        `).join('');

        searchResults.innerHTML = booksHTML;
    }

    // Load initial books
    if (booksContainer) {
        loadBooks();
    }
});
