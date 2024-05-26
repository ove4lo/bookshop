import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { IBook } from "../models/models";
import GoButton from '../components/GoButton';
import DeleteButton from '../components/DeleteButton';

/*страница просмотра книги*/
const BookDetailsPage: React.FC = () => {
  const [book, setBook] = useState<IBook | null>(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get<IBook>(`http://localhost:8800/book/${id}`); //получение деталей задачи по id
        setBook(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке книги:', error);
      }
    };

    fetchTask();

  }, [id]); 

  return (
    <div className="container">
      <h1 className="title">{book ? book.title : ''}</h1>
      <GoButton text="&#8592; Назад" nav="/" />
      {book ? (
        <div className="book-details">
          <div>
            <img src={book.photo} alt={book.title} style={{ maxWidth: '100%', height: 'auto' }} /> 
            <p><span className="pod">Автор:</span> {book.author}</p>
            <p><span className="pod">Цена:</span> {book.price}</p>
            <h2 className="pod">ХАРАКТЕРИСТИКИ КНИГИ</h2>
            <p><span className="pod">Автор:</span> {book.house}</p>
            <p><span className="pod">Год издания:</span> {book.year}</p>
            <p><span className="pod">Количество книг:</span> {book.pages}</p>
            <p><span className="pod">ISBN:</span> {book.isbn}</p>
            <p className="marks">
              {book.category.length > 0 ? (
                <><span className="pod">Категории:</span> {book.category.map((mark, index) => (
                  <span className="mark" key={index}>{mark}   </span>
                ))}</>
              ) : (
                "Категорий нет"
              )}
            </p>
            <p><span className="pod">Аннтотация к книге:</span> {book.annotation}</p>
            <p><span className="pod">Ссылка на первоисточник:</span> {book.link}</p>
          </div>
          <div className="buttons-container">
            <DeleteButton book_id={`${book.id}`} />
            <GoButton text="Редактировать" nav={`/book/edit/${book.id}`} />
          </div>
        </div>
      ) : (
        <p>Загрузка...</p>
      )}
    </div>
  );
}

export default BookDetailsPage;
