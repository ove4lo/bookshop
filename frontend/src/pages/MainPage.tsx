import React, { useEffect, useState } from 'react';
import BookCard from '../components/BookCard';
import { IBook } from '../models/models';
import axios from "axios";
import GoButton from '../components/GoButton';
import BookSearch from '../components/BookSearch';

/*основная страница*/
const MainPage: React.FC = () => {
  const [books, setBooks] = useState<IBook[]>([]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get("http://localhost:8800/books"); //запрос на сервер для получения всех книг
        setBooks(res.data);
        console.log(books);
      } catch (error) {
        console.error('Ошибка при загрузке книг:', error);
      }
    };

    fetchBook();
  }, );

  return (
    <div className="container">
      <div className="header">
            <h1 className="title">Список книг</h1>
            <GoButton text="Добавить книгу" nav="/book/add" />
      </div>
      <div className="main">
        <div className="book-list">
          <BookSearch />
          {books.map((book: IBook, index) => (
            <BookCard key={index} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
