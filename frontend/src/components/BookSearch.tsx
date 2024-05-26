import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IBook } from "../models/models";
import axios from "axios";

const BookSearch: React.FC = () => {
    const [searchValue, setSearchValue] = useState<string>("");
    const [books, setBooks] = useState<IBook[]>([]);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleSearch = async () => {
        try {
            const response = await axios.get(`http://localhost:8800/books/search?value=${searchValue}`);
            setBooks(response.data);
            setShowDropdown(true);
        } catch (error) {
            console.error("Error searching books:", error);
            setBooks([]);
            setShowDropdown(true);
        }
    };

    const handleBookClick = (bookId: number) => {
        navigate(`/book/${bookId}`);
        setShowDropdown(false);
    };

    return (
        <div className="book-search">
            <div className="search-bar">
                <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Введите название книги или автора"
                />
                <button onClick={handleSearch}>🔍</button>
            </div>
            {showDropdown && (
                <ul className="dropdown">
                    {books.length > 0 ? (
                        books.map((book) => (
                            <li key={book.id} onClick={() => handleBookClick(book.id)}>
                                {book.title} - {book.author}
                            </li>
                        ))
                    ) : (
                        <li>Ничего не найдено</li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default BookSearch;
