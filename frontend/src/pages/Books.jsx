import React, { useEffect, useState } from 'react'
import axios from 'axios'

export const Books = () => {
    const [books, setBooks] = useState([])

    useEffect(() => {
        const fetchAllBooks = async () => {
            try {
                const res = await axios.get("http://localhost:8800/books");
                setBooks(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchAllBooks();
    }, []);

    console.log(books);

    return (
        <div>
            <h1>BOOKSHOP</h1>
            <div className="books">
                {books.map((book) => (
                    <div key={book.id} className="book">
                        <img src={book.cover} alt="" />
                        <h2>{book.title}</h2>
                        <p>{book.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}