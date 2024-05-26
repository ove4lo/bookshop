import GoButton from "../components/GoButton";
import BookForm from "../components/BookForm";

/*создание задачи*/
const BookCreatePage: React.FC = () => {
    return (
        <div className='container'>
            <h1 className="title">Создание задачи</h1>
            <GoButton text="&#8592; Назад" nav="/" />
            <BookForm />
        </div>
    )
}

export default BookCreatePage;