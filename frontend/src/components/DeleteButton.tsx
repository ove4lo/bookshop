import { useNavigate } from "react-router-dom";
import axios from 'axios'

interface DeleteButtonProps {
    book_id: string;
}

/*кнопка удаления задачи*/
const DeleteButton: React.FC<DeleteButtonProps> = ({ book_id }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8800/delete/${book_id}`); //запрос на удаление книги по его id
      alert("Книга успешно удалена"); //сообщение об удалении
      navigate("/"); //переходим на главную страницу
    } catch (error) {
      alert("Ошибка при удалении книги"); //сообщение об ошибке удалении
    }
  };

  return (
    <button onClick={handleDelete} className="btn btn-delete">
      <span>Удалить</span> 
    </button>
  );
};

export default DeleteButton;
