import { useNavigate } from "react-router-dom";

interface GoButtonProps {
  text: string;
  nav: string;
}

/*кнопка для перехода куда либо*/
/*передаем текст в кноаке и ссылку для перехода*/
const GoButton: React.FC<GoButtonProps> = ({ text, nav }) => { 
  const navigate = useNavigate();

  const goNew = () => {
    navigate(nav);  //переходим по ссылке
  };

  return (
    <button onClick={goNew} className="btn">
      <span>{text}</span> 
    </button>
  );
};

export default GoButton;
