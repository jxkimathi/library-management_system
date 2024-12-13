#!/usr/bin/python3
"""The Models module"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base


Base = declarative_base()

class Book(Base):
    """The Book Model"""
    __tablename__ = 'books'

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    author = Column(String(200), nullable=False)
    quantity = Column(Integer, default=0)
    rent_price = Column(Float, default=50.0)

    transactions = relationship('Transaction', back_populates='book')

    def to_dict(self):
        """Dictionary Representation of the Book"""
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'quantity': self.quantity,
            'rent_price': self.rent_price
        }


class Member(Base):
    """"The Member Model"""
    __tablename__ = 'members'

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True)
    phone = Column(String(20))
    outstanding_debt = Column(Float, default=0.0)

    transactions = relationship('Transaction', back_populates='member')

    def to_dict(self):
        """Dictionary Representation of the Member"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'outstanding_debt': self.outstanding_debt
        }


class Transaction(Base):
    """The Transaction Model"""
    __tablename__ = 'transactions'

    id = Column(Integer, primary_key=True)
    book_id = Column(Integer, ForeignKey('books.id'))
    member_id = Column(Integer, ForeignKey('members.id'))
    issue_date = Column(DateTime, default=datetime.now())
    return_date = Column(DateTime, nullable=True)
    rent_fee = Column(Float, default=0.0)
    is_returned = Column(Integer, default=0)

    book = relationship('Book', back_populates='transactions')
    member = relationship('Member', back_populates='transactions')

    def to_dict(self):
        """Dictionary Representation of the Transaction"""
        return {
            'id': self.id,
            'book_id': self.book_id,
            'member_id': self.member_id,
            'issue_date': self.issue_date,
            'return_date': self.return_date,
            'rent_fee': self.rent_fee,
            'is_returned': self.is_returned
        }
