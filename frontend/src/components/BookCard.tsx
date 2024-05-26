import { NavLink } from "react-router-dom";
import { IBook } from "../models/models";

interface Props {
    book: IBook;
}

/*карточка книги*/
/*передаем данные и при нажатии на карточку товара переходим на ее просмотр*/
const BookCard: React.FC<Props> = ({ book }) => {

    return (
        <NavLink to={`/book/${book.id}`} className='book nav-link'>
            <div> 
                <img src={book.photo} alt={book.title} style={{ maxWidth: '40%', height: 'auto' }} /> 
                <h3>{book.title}</h3>
                <p>Автор: {book.author}</p>
                <p>Цена: {book.price}</p>             
            </div>
        </NavLink>
    )
}

export default BookCard;