#!/usr/bin/python3
""""The Main Application Module"""
from datetime import datetime
from flask import Flask, request, jsonify, render_template
from sqlalchemy import or_
from database import init_db, get_db
from models import Book, Member, Transaction

app = Flask(__name__)

# Initialize database
init_db()

@app.route('/')
def index():
    """The Rendered Page"""
    return render_template('index.html')


# Books Routes
@app.route('/books', methods=['GET'])
def get_books():
    """Retrieve all books"""
    db = next(get_db())
    books = db.query(Book).all()
    return jsonify([{
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'quantity': book.quantity,
        'rent_price': book.rent_price
    } for book in books])


@app.route('/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    """Retrieve a single book"""
    db = next(get_db())
    book = db.query(Book).get(book_id)

    if not book:
        return jsonify({'error': 'Book not found'}), 404

    return jsonify({
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'quantity': book.quantity,
        'rent_price': book.rent_price
    })


@app.route('/books', methods=['POST'])
def add_book():
    """Add a new book"""
    db = next(get_db())
    data = request.json
    book = Book(
        title=data['title'],
        author=data['author'],
        quantity=data.get('quantity', 0),
        rent_price=data.get('rent_price', 50.0)
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return jsonify({
        'id': book.id,
        'title': book.title,
        'author': book.author
    }), 201


@app.route('/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    """Update a book"""
    db = next(get_db())
    book = db.query(Book).get(book_id)

    if not book:
        return jsonify({'error': 'Book not found'}), 404

    data = request.json
    book.title = data.get('title', book.title)
    book.author = data.get('author', book.author)
    book.quantity = data.get('quantity', book.quantity)

    db.commit()
    db.refresh(book)

    return jsonify({
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'quantity': book.quantity
    }), 200


@app.route('/books/search', methods=['GET'])
def search_books():
    """Search for books"""
    db = next(get_db())
    query = request.args.get('query', '')
    books = db.query(Book).filter(
        or_(
            Book.title.ilike(f'%{query}%'),
            Book.author.ilike(f'%{query}%')
        )
    ).all()
    return jsonify([{
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'quantity': book.quantity
    } for book in books])


# Members Routes
@app.route('/members', methods=['GET'])
def get_members():
    """Retrieve all members"""
    db = next(get_db())
    members = db.query(Member).all()
    return jsonify([{
        'id': member.id,
        'name': member.name,
        'email': member.email,
        'outstanding_debt': member.outstanding_debt
    } for member in members])


@app.route('/members', methods=['POST'])
def add_member():
    """Add a new member"""
    db = next(get_db())
    data = request.json
    member = Member(
        name=data['name'],
        email=data['email'],
        phone=data.get('phone')
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return jsonify({
        'id': member.id,
        'name': member.name,
        'email': member.email
    }), 201


# Transactions Routes
@app.route('/issue-book', methods=['POST'])
def issue_book():
    """Issue a book to a member"""
    db = next(get_db())
    data = request.json
    book = db.query(Book).get(data['book_id'])
    member = db.query(Member).get(data['member_id'])

    if not book or not member:
        return jsonify({'error': 'Book or Member not found'}), 404

    if book.quantity <= 0:
        return jsonify({'error': 'Book not available'}), 400

    if member.outstanding_debt > 500:
        return jsonify({'error': 'Member has outstanding debt exceeding KES 500'}), 400

    book.quantity -= 1
    transaction = Transaction(
        book_id=book.id,
        member_id=member.id,
        issue_date=datetime.now()
    )

    db.add(transaction)
    db.commit()
    return jsonify({
        'transaction_id': transaction.id,
        'book_title': book.title,
        'member_name': member.name
    }), 201


@app.route('/return-book', methods=['POST'])
def return_book():
    """Return a book from a member"""
    db = next(get_db())
    data = request.json
    transaction = db.query(Transaction).get(data['transaction_id'])

    if not transaction or transaction.is_returned:
        return jsonify({'error': 'Invalid transaction'}), 400

    book = transaction.book
    member = transaction.member
    book.quantity += 1

    # Calculate rent fee (KES 50 per day after 7 days)
    days_overdue = (datetime.now() - transaction.issue_date).days
    rent_fee = max(0, (days_overdue - 7) * 50)

    transaction.return_date = datetime.now()
    transaction.rent_fee = rent_fee
    transaction.is_returned = 1

    member.outstanding_debt += rent_fee

    db.commit()
    return jsonify({
        'rent_fee': rent_fee,
        'book_title': book.title,
        'member_name': member.name
    }), 200


if __name__ == '__main__':
    app.run(debug=True)
