import React, { useState } from 'react';
import axios from 'axios';
import { IBook } from '../models/models';
import { useNavigate } from "react-router-dom";

interface Props {
    book: IBook;
}

/* передача пропсы книги по id */
/* Форма для редактирования книги */
const BookEditForm: React.FC<Props> = ({ book }) => {
    const [title, setTitle] = useState(book.title);
    const [author, setAuthor] = useState(book.author);
    const [link, setLink] = useState(book.link);
    const [photo, setPhoto] = useState(book.photo);
    const [price, setPrice] = useState(book.price);
    const [house, setHouse] = useState(book.house);
    const [pages, setPages] = useState(book.pages);
    const [isbn, setIsbn] = useState(book.isbn);
    const [annotation, setAnnotation] = useState(book.annotation);
    const [year, setYear] = useState(book.year);
    const [category, setCategory] = useState<string[]>(book.category);
    const [newCategory, setNewCategory] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const updatedBook = { /* обновленные данные книги */
                title,
                author,
                link,
                photo,
                price,
                house,
                pages,
                isbn,
                annotation,
                year,
                category
            };

            await axios.put(`http://localhost:8800/edit/${book.id}`, updatedBook); //запрос для изменения данных о книге по id

            alert('Книга успешно обновлена'); //сообщение об успешном изменении

            navigate("/"); //переходим на главную страницу

        } catch (error) {
            alert('Произошла ошибка при изменении книги'); //сообщение об ошибке
        }
    };

    const handleAddCategory = () => { /*добавление категории*/
        if (newCategory.trim() !== '') {
            setCategory([...category, newCategory.trim()]);
            setNewCategory('');
        }
    };

    const handleRemoveCategory = (index: number) => { /*удалении категории*/
        setCategory(category.filter((_, i) => i !== index));
    };

    return (
        <form onSubmit={handleSubmit} className="form">
            <div className="form-input">
                <label>Название книги:</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-input">
                <label>Автор:</label>
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required />
            </div>
            <div className="form-input">
                <label>Ссылка на фотографию:</label>
                <input type="text" value={photo} onChange={(e) => setPhoto(e.target.value)} required />
            </div>
            <div className="form-input">
                <label>Цена:</label>
                <input type="text" value={price} onChange={(e) => { const value = e.target.value; setPrice(value ? parseInt(value) : 0); }} required />
            </div>
            <div className="form-input">
                <label>Издательство:</label>
                <input type="text" value={house} onChange={(e) => setHouse(e.target.value)} required />
            </div>
            <div className="form-input">
                <label>Год издания:</label>
                <input type="text" value={year} onChange={(e) => { const value = e.target.value; setYear(value ? parseInt(value) : 2024); }} required />
            </div>
            <div className="form-input">
                <label>Количество страниц:</label>
                <input type="text" value={pages} onChange={(e) => { const value = e.target.value; setPages(value ? parseInt(value) : 0); }} required />
            </div>
            <div className="form-input">
                <label>ISBN:</label>
                <input type="text" value={isbn} onChange={(e) => setIsbn(e.target.value)} required />
            </div>
            <div className="form-input">
                <label>Ссылка на источник:</label>
                <input type="text" value={link} onChange={(e) => setLink(e.target.value)} required />
            </div>
            <div className="form-input">
                <label>Аннотация:</label>
                <textarea value={annotation} onChange={(e) => setAnnotation(e.target.value)} />
            </div>
            <div className="form-input">
                <label>Категории:</label>
                <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                <button type="button" onClick={handleAddCategory} className="bot">Добавить категорию</button>
                <ul>
                    {category.map((cat, index) => (
                        <li key={index}>
                            {cat}
                            <button type="button" onClick={() => handleRemoveCategory(index)} className="bot">Удалить</button>
                        </li>
                    ))}
                </ul>
            </div>
            <button type="submit" className="btn">Изменить задачу</button>
        </form>
    );
};

export default BookEditForm;
