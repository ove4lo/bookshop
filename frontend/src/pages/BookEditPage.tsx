import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { IBook } from '../models/models';
import BookEditForm from '../components/BookEditForm';
import GoButton from '../components/GoButton';

/*страница редактирования задачи*/
const BookEditPage: React.FC = () => {
  const [book, setBook] = useState<IBook | null>(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`http://localhost:8800/book/${id}`); //запрос на редактирования книги по id
        setBook(res.data);
      } catch (error) {
        console.error('Ошибка при загрузке книги:', error);
      }
    };

    fetchBook();
  }, [id]);

  return (
    <div className="container">
      <h1 className="title">Редактирование книги №{id}</h1>
      <GoButton text="&#8592; Назад" nav="/"/>
      {book ? <BookEditForm book={book} /> : <p>Загрузка...</p>}
    </div>
  );
};

export default BookEditPage;
